import { useCallback, useEffect, useState } from 'react'
import { createTask, importBoard, loadBoard, normalizeTask, saveBoard } from '../storage'
import type { BoardState, Lane, SourceFilter, Task, TaskStatus } from '../types'
import { laneForStatus, statusForLane } from '../types'

export function useTasks() {
  const [state, setState] = useState<BoardState>(() => loadBoard())
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all')

  useEffect(() => {
    saveBoard(state)
  }, [state])

  // Auto-load packs from /latest-board.json — merge, never wipe local adds/edits
  useEffect(() => {
    let cancelled = false
    let lastPackJson = ''

    function mergePack(prev: BoardState, pack: BoardState): BoardState {
      const localById = new Map(prev.tasks.map((t) => [t.id, t]))
      const packIds = new Set(pack.tasks.map((t) => t.id))
      const merged: Task[] = []

      for (const incoming of pack.tasks) {
        const local = localById.get(incoming.id)
        if (!local) {
          merged.push(incoming)
          continue
        }
        // Existing ids: pack may refresh title/evidence/links, but NEVER overwrite
        // local workflow state (lane / status / priority).
        merged.push({
          ...incoming,
          id: local.id,
          lane: local.lane,
          status: local.status,
          priority: local.priority,
          updatedAt: local.updatedAt,
          title:
            (Date.parse(local.updatedAt) || 0) >= (Date.parse(incoming.updatedAt) || 0)
              ? local.title
              : incoming.title,
          evidence: incoming.evidence ?? local.evidence,
          jiraUrl: incoming.jiraUrl ?? local.jiraUrl,
          slackUrl: incoming.slackUrl ?? local.slackUrl,
          source: incoming.source || local.source,
        })
      }

      // Keep local-only tasks (manual adds, etc.)
      for (const local of prev.tasks) {
        if (!packIds.has(local.id)) merged.push(local)
      }

      return { tasks: merged, hideDone: prev.hideDone }
    }

    async function pull() {
      try {
        const res = await fetch('/latest-board.json', { cache: 'no-store' })
        if (!res.ok) return
        const json = await res.text()
        if (json === lastPackJson) return
        lastPackJson = json
        const pack = importBoard(json)
        if (cancelled) return
        setState((prev) => mergePack(prev, pack))
      } catch {
        // ignore missing pack
      }
    }
    pull()
    const id = window.setInterval(pull, 20000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [])

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.id !== id) return t
        const next = { ...t, ...patch, updatedAt: new Date().toISOString() }
        if (patch.status && !patch.lane) next.lane = laneForStatus(patch.status)
        if (patch.lane && !patch.status) next.status = statusForLane(patch.lane, t.status)
        return next
      }),
    }))
  }, [])

  const addTask = useCallback((task: Omit<Task, 'id' | 'updatedAt'>) => {
    setState((prev) => ({
      ...prev,
      tasks: [...prev.tasks, createTask(task)],
    }))
  }, [])

  const deleteTask = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }))
  }, [])

  const markDone = useCallback(
    (id: string) => updateTask(id, { status: 'done', lane: 'done' }),
    [updateTask],
  )

  const setStatus = useCallback(
    (id: string, status: TaskStatus) => updateTask(id, { status, lane: laneForStatus(status) }),
    [updateTask],
  )

  const moveToLane = useCallback((id: string, lane: Lane) => {
    setState((prev) => {
      const task = prev.tasks.find((t) => t.id === id)
      if (!task) return prev
      const maxPriority = prev.tasks
        .filter((t) => t.lane === lane && t.id !== id)
        .reduce((max, t) => Math.max(max, t.priority), -1)
      return {
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === id
            ? {
                ...t,
                lane,
                status: statusForLane(lane, t.status),
                priority: maxPriority + 1,
                updatedAt: new Date().toISOString(),
              }
            : t,
        ),
      }
    })
  }, [])

  const reorderInLane = useCallback((lane: Lane, orderedIds: string[]) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.lane !== lane) return t
        const idx = orderedIds.indexOf(t.id)
        if (idx === -1) return t
        return { ...t, priority: idx, updatedAt: new Date().toISOString() }
      }),
    }))
  }, [])

  const movePriority = useCallback((id: string, direction: 'up' | 'down') => {
    setState((prev) => {
      const task = prev.tasks.find((t) => t.id === id)
      if (!task) return prev

      const laneTasks = prev.tasks
        .filter((t) => t.lane === task.lane)
        .sort((a, b) => a.priority - b.priority)

      const idx = laneTasks.findIndex((t) => t.id === id)
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= laneTasks.length) return prev

      const swap = laneTasks[swapIdx]
      return {
        ...prev,
        tasks: prev.tasks.map((t) => {
          if (t.id === task.id) return { ...t, priority: swap.priority, updatedAt: new Date().toISOString() }
          if (t.id === swap.id) return { ...t, priority: task.priority, updatedAt: new Date().toISOString() }
          return t
        }),
      }
    })
  }, [])

  const toggleHideDone = useCallback(() => {
    setState((prev) => ({ ...prev, hideDone: !prev.hideDone }))
  }, [])

  const replaceBoard = useCallback((board: BoardState) => {
    setState({
      ...board,
      tasks: board.tasks.map((t) => normalizeTask(t as Partial<Task> & Record<string, unknown>)),
    })
  }, [])

  const visibleTasks = state.tasks.filter((t) => {
    if (sourceFilter !== 'all' && t.source !== sourceFilter) return false
    if (state.hideDone && (t.lane === 'done' || t.status === 'done' || t.status === 'dropped')) return false
    return true
  })

  const doneCount = state.tasks.filter(
    (t) => t.lane === 'done' || t.status === 'done' || t.status === 'dropped',
  ).length

  return {
    state,
    sourceFilter,
    setSourceFilter,
    visibleTasks,
    doneCount,
    updateTask,
    addTask,
    deleteTask,
    markDone,
    setStatus,
    moveToLane,
    reorderInLane,
    movePriority,
    toggleHideDone,
    replaceBoard,
  }
}
