import { ExternalLink } from 'lucide-react'
import type { TaskSource, TaskStatus } from '../types'

const statusStyles: Record<TaskStatus, string> = {
  open: 'bg-zinc-500/15 text-zinc-300 ring-zinc-500/25',
  in_progress: 'bg-teal-500/15 text-teal-300 ring-teal-500/25',
  done: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/25',
  dropped: 'bg-zinc-500/10 text-zinc-500 ring-zinc-500/20',
}

const sourceStyles: Record<TaskSource, string> = {
  jira: 'bg-[#0052cc]/20 text-blue-300 ring-1 ring-[#0052cc]/30',
  slack: 'bg-[#611f69]/20 text-fuchsia-300 ring-1 ring-[#611f69]/30',
  gmail: 'bg-red-500/15 text-red-300 ring-1 ring-red-500/25',
  meeting: 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/25',
}

export function SourceBadge({ source }: { source: TaskSource }) {
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${sourceStyles[source]}`}
    >
      {source === 'meeting' ? 'meeting' : source}
    </span>
  )
}

export function StatusSelect({
  value,
  onChange,
}: {
  value: TaskStatus
  onChange: (status: TaskStatus) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as TaskStatus)}
      className={`cursor-pointer rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset outline-none transition-colors hover:brightness-110 focus:ring-2 focus:ring-teal-500/50 ${statusStyles[value]}`}
      aria-label="Task status"
    >
      <option value="open">Open</option>
      <option value="in_progress">In progress</option>
      <option value="done">Done</option>
      <option value="dropped">Dropped</option>
    </select>
  )
}

export function TaskLinks({
  jiraUrl,
  slackUrl,
}: {
  jiraUrl?: string
  slackUrl?: string
}) {
  if (!jiraUrl && !slackUrl) return null

  return (
    <div className="flex flex-wrap gap-2">
      {jiraUrl && (
        <a
          href={jiraUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-blue-400 transition-colors hover:text-blue-300"
        >
          <ExternalLink className="h-3 w-3" />
          Jira
        </a>
      )}
      {slackUrl && (
        <a
          href={slackUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-fuchsia-400 transition-colors hover:text-fuchsia-300"
        >
          <ExternalLink className="h-3 w-3" />
          Slack
        </a>
      )}
    </div>
  )
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
