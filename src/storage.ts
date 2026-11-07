import type { BoardState, Lane, Task, TaskSource, TaskStatus } from './types'
import { STORAGE_KEY } from './config'
import { laneForStatus } from './types'

export const SEED_TASKS: Task[] = [
  {
    id: 'example-in-progress',
    title: 'Finish draft API spec (ACME-42)',
    source: 'jira',
    status: 'in_progress',
    lane: 'in_progress',
    priority: 0,
    jiraUrl: 'https://example.atlassian.net/browse/ACME-42',
    evidence: 'In progress — blocked on review',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'example-up-next-1',
    title: 'Reply in #eng-standup thread',
    source: 'slack',
    status: 'open',
    lane: 'up_next',
    priority: 0,
    slackUrl: 'https://example.slack.com/archives/C00000000/p0000000000000000',
    evidence: 'Question about rollout timing',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'example-up-next-2',
    title: 'Schedule design review',
    source: 'meeting',
    status: 'open',
    lane: 'up_next',
    priority: 1,
    evidence: 'Action item from last sync',
    updatedAt: new Date().toISOString(),
  },
]

function defaultState(): BoardState {
  return { tasks: SEED_TASKS, hideDone: true }
}

function normalizeSource(raw: unknown): TaskSource {
  const s = String(raw ?? 'jira').toLowerCase()
  if (s === 'meetings') return 'meeting'
  if (s === 'slack' || s === 'jira' || s === 'gmail' || s === 'meeting') return s
  return 'jira'
}

function normalizeLane(raw: unknown, status: TaskStatus): Lane {
  const s = String(raw ?? '')
  if (s === 'up_next' || s === 'in_progress' || s === 'done') return s
  // legacy Now/Today/This week
  if (s === 'now' || s === 'today' || s === 'this_week') return laneForStatus(status)
  return laneForStatus(status)
}

function normalizeStatus(raw: unknown): TaskStatus {
  const s = String(raw ?? 'open')
  if (s === 'open' || s === 'in_progress' || s === 'done' || s === 'dropped') return s
  return 'open'
}

export function normalizeTask(raw: Partial<Task> & Record<string, unknown>): Task {
  const status = normalizeStatus(raw.status)
  const lane = normalizeLane(raw.lane, status)
  return {
    id: String(raw.id ?? crypto.randomUUID()),
    title: String(raw.title ?? 'Untitled'),
    source: normalizeSource(raw.source),
    status,
    lane,
    priority: typeof raw.priority === 'number' ? raw.priority : 0,
    jiraUrl: raw.jiraUrl ? String(raw.jiraUrl) : undefined,
    slackUrl: raw.slackUrl ? String(raw.slackUrl) : undefined,
    evidence: raw.evidence ? String(raw.evidence) : undefined,
    updatedAt: String(raw.updatedAt ?? new Date().toISOString()),
  }
}

function normalizeBoard(parsed: BoardState): BoardState {
  const tasks = Array.isArray(parsed.tasks)
    ? parsed.tasks.map((t) => normalizeTask(t as Partial<Task> & Record<string, unknown>))
    : []
  return { tasks, hideDone: parsed.hideDone ?? true }
}

export function loadBoard(): BoardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw) as BoardState
    if (!Array.isArray(parsed.tasks)) return defaultState()
    return normalizeBoard(parsed)
  } catch {
    return defaultState()
  }
}

export function saveBoard(state: BoardState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function exportBoard(state: BoardState): string {
  return JSON.stringify(state, null, 2)
}

export function importBoard(json: string): BoardState {
  const parsed = JSON.parse(json) as BoardState & { version?: number; tasks?: unknown }
  // support pack shape { version, tasks: [...] } or BoardState
  const tasks = Array.isArray(parsed.tasks) ? parsed.tasks : null
  if (!tasks) throw new Error('Invalid board: tasks array required')
  return normalizeBoard({ tasks: tasks as Task[], hideDone: (parsed as BoardState).hideDone ?? true })
}

export function createTask(partial: Omit<Task, 'id' | 'updatedAt'>): Task {
  return {
    ...partial,
    id: crypto.randomUUID(),
    updatedAt: new Date().toISOString(),
  }
}
