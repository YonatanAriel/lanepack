import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Check,
  ChevronDown,
  ChevronUp,
  GripVertical,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import type { Lane, Task } from '../types'
import { LANES } from '../types'
import { formatRelativeTime, SourceBadge, StatusSelect, TaskLinks } from './ui'

interface TaskCardProps {
  task: Task
  isFirst: boolean
  isLast: boolean
  onMarkDone: (id: string) => void
  onStatusChange: (id: string, status: Task['status']) => void
  onMoveLane: (id: string, lane: Lane) => void
  onMovePriority: (id: string, direction: 'up' | 'down') => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

export function TaskCard({
  task,
  isFirst,
  isLast,
  onMarkDone,
  onStatusChange,
  onMoveLane,
  onMovePriority,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isDone = task.status === 'done' || task.status === 'dropped'

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-3 shadow-sm transition-shadow hover:border-zinc-700 hover:shadow-md ${
        isDragging ? 'z-10 opacity-80 shadow-lg ring-2 ring-teal-500/40' : ''
      } ${isDone ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-0.5 cursor-grab touch-none text-zinc-600 transition-colors hover:text-zinc-400 active:cursor-grabbing"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <SourceBadge source={task.source} />
                <StatusSelect
                  value={task.status}
                  onChange={(s) => onStatusChange(task.id, s)}
                />
              </div>
              <h3 className="text-sm font-medium leading-snug text-zinc-100">{task.title}</h3>
            </div>

            <div className="flex shrink-0 items-center gap-0.5">
              {!isDone && (
                <button
                  type="button"
                  onClick={() => onMarkDone(task.id)}
                  className="rounded-md p-1.5 text-emerald-400 transition-colors hover:bg-emerald-500/10 hover:text-emerald-300"
                  title="Mark done"
                  aria-label="Mark done"
                >
                  <Check className="h-4 w-4" />
                </button>
              )}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
                  aria-label="More actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMenuOpen(false)}
                      aria-hidden
                    />
                    <div className="absolute right-0 z-20 mt-1 w-36 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] py-1 shadow-xl">
                      <button
                        type="button"
                        onClick={() => {
                          onEdit(task)
                          setMenuOpen(false)
                        }}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-zinc-300 hover:bg-zinc-800"
                      >
                        <Pencil className="h-3 w-3" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onDelete(task.id)
                          setMenuOpen(false)
                        }}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {task.evidence && (
            <p className="text-xs leading-relaxed text-zinc-500">{task.evidence}</p>
          )}

          <TaskLinks jiraUrl={task.jiraUrl} slackUrl={task.slackUrl} />

          <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
            <select
              value={task.lane}
              onChange={(e) => onMoveLane(task.id, e.target.value as Lane)}
              className="rounded border border-[var(--color-border)] bg-transparent px-2 py-0.5 text-[11px] text-zinc-400 outline-none focus:border-teal-500/50"
              aria-label="Move to lane"
            >
              {LANES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={isFirst}
                onClick={() => onMovePriority(task.id, 'up')}
                className="rounded p-0.5 text-zinc-600 transition-colors hover:text-zinc-400 disabled:opacity-30"
                aria-label="Move up"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                disabled={isLast}
                onClick={() => onMovePriority(task.id, 'down')}
                className="rounded p-0.5 text-zinc-600 transition-colors hover:text-zinc-400 disabled:opacity-30"
                aria-label="Move down"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <span className="ml-1 text-[10px] text-zinc-600">
                {formatRelativeTime(task.updatedAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
