export type Lane = 'up_next' | 'in_progress' | 'done'
export type TaskStatus = 'open' | 'in_progress' | 'done' | 'dropped'
export type TaskSource = 'slack' | 'jira' | 'gmail' | 'meeting'

export interface Task {
  id: string
  title: string
  source: TaskSource
  status: TaskStatus
  lane: Lane
  priority: number
  jiraUrl?: string
  slackUrl?: string
  evidence?: string
  updatedAt: string
}

export interface BoardState {
  tasks: Task[]
  hideDone: boolean
}

export type SourceFilter = 'all' | TaskSource

export const LANES: { id: Lane; label: string }[] = [
  { id: 'up_next', label: 'Up next' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'done', label: 'Done' },
]

export const STATUSES: { id: TaskStatus; label: string }[] = [
  { id: 'open', label: 'Open' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'done', label: 'Done' },
  { id: 'dropped', label: 'Dropped' },
]

export const SOURCES: { id: TaskSource; label: string }[] = [
  { id: 'slack', label: 'Slack' },
  { id: 'jira', label: 'Jira' },
  { id: 'gmail', label: 'Gmail' },
  { id: 'meeting', label: 'Meetings' },
]

export function laneForStatus(status: TaskStatus): Lane {
  if (status === 'in_progress') return 'in_progress'
  if (status === 'done' || status === 'dropped') return 'done'
  return 'up_next'
}

export function statusForLane(lane: Lane, current: TaskStatus): TaskStatus {
  if (lane === 'done') return current === 'dropped' ? 'dropped' : 'done'
  if (lane === 'in_progress') return 'in_progress'
  return current === 'dropped' || current === 'done' ? 'open' : current === 'in_progress' ? 'open' : current
}
