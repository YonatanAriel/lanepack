import { useState } from 'react'
import { Board } from './components/Board'
import { Header, TaskModal, type TaskFormData } from './components/Header'
import { useTasks } from './hooks/useTasks'
import { EXPORT_PREFIX } from './config'
import { exportBoard, importBoard } from './storage'
import type { Task } from './types'
import { laneForStatus } from './types'

function App() {
  const {
    state,
    sourceFilter,
    setSourceFilter,
    visibleTasks,
    doneCount,
    addTask,
    updateTask,
    deleteTask,
    markDone,
    setStatus,
    moveToLane,
    reorderInLane,
    movePriority,
    toggleHideDone,
    replaceBoard,
  } = useTasks()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  function openAdd() {
    setEditingTask(null)
    setModalOpen(true)
  }

  function openEdit(task: Task) {
    setEditingTask(task)
    setModalOpen(true)
  }

  function handleSave(data: TaskFormData, existingId?: string) {
    const lane = data.lane
    const status = data.status
    const payload = {
      title: data.title.trim(),
      source: data.source,
      status,
      lane: lane || laneForStatus(status),
      priority: 0,
      jiraUrl: data.jiraUrl.trim() || undefined,
      slackUrl: data.slackUrl.trim() || undefined,
      evidence: data.evidence.trim() || undefined,
    }

    if (existingId) {
      updateTask(existingId, payload)
    } else {
      const maxPriority = state.tasks
        .filter((t) => t.lane === payload.lane)
        .reduce((max, t) => Math.max(max, t.priority), -1)
      addTask({ ...payload, priority: maxPriority + 1 })
    }
  }

  function handleExport() {
    const json = exportBoard(state)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${EXPORT_PREFIX}-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(json: string) {
    try {
      const board = importBoard(json)
      replaceBoard(board)
    } catch {
      alert('Could not import board — check JSON format')
    }
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Header
          sourceFilter={sourceFilter}
          onSourceFilterChange={setSourceFilter}
          hideDone={state.hideDone}
          onToggleHideDone={toggleHideDone}
          doneCount={doneCount}
          onAddTask={openAdd}
          onExport={handleExport}
          onImport={handleImport}
        />

        <Board
          tasks={visibleTasks}
          hideDone={state.hideDone}
          onMarkDone={markDone}
          onStatusChange={setStatus}
          onMoveLane={moveToLane}
          onMovePriority={movePriority}
          onEdit={openEdit}
          onDelete={deleteTask}
          onReorder={reorderInLane}
        />
      </div>

      <TaskModal
        open={modalOpen}
        task={editingTask}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  )
}

export default App
