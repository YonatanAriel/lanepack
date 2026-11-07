import { Download, Plus, Upload, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { BOARD_TAGLINE, BOARD_TITLE } from '../config'
import type { Lane, Task, TaskSource, TaskStatus } from '../types'
import { LANES } from '../types'

interface TaskFormData {
  title: string
  source: TaskSource
  status: TaskStatus
  lane: Lane
  jiraUrl: string
  slackUrl: string
  evidence: string
}

const emptyForm: TaskFormData = {
  title: '',
  source: 'jira',
  status: 'open',
  lane: 'up_next',
  jiraUrl: '',
  slackUrl: '',
  evidence: '',
}

export function TaskModal({
  open,
  task,
  onClose,
  onSave,
}: {
  open: boolean
  task: Task | null
  onClose: () => void
  onSave: (data: TaskFormData, existingId?: string) => void
}) {
  const [form, setForm] = useState<TaskFormData>(emptyForm)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      if (task) {
        setForm({
          title: task.title,
          source: task.source,
          status: task.status,
          lane: task.lane,
          jiraUrl: task.jiraUrl ?? '',
          slackUrl: task.slackUrl ?? '',
          evidence: task.evidence ?? '',
        })
      } else {
        setForm(emptyForm)
      }
      setTimeout(() => titleRef.current?.focus(), 50)
    }
  }, [open, task])

  if (!open) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    onSave(form, task?.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal
        aria-labelledby="task-modal-title"
        className="relative w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 id="task-modal-title" className="text-lg font-semibold">
            {task ? 'Edit task' : 'Add task'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-zinc-400">Title</span>
            <input
              ref={titleRef}
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30"
              placeholder="Short task title"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-zinc-400">Source</span>
              <select
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value as TaskSource })}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-teal-500/50"
              >
                <option value="jira">Jira</option>
                <option value="slack">Slack</option>
                <option value="gmail">Gmail</option>
                <option value="meeting">Meetings</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-zinc-400">Lane</span>
              <select
                value={form.lane}
                onChange={(e) => setForm({ ...form, lane: e.target.value as Lane })}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-teal-500/50"
              >
                {LANES.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-zinc-400">Status</span>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-teal-500/50"
            >
              <option value="open">Open</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
              <option value="dropped">Dropped</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-zinc-400">Evidence / why open</span>
            <input
              value={form.evidence}
              onChange={(e) => setForm({ ...form, evidence: e.target.value })}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-teal-500/50"
              placeholder="One line context"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-zinc-400">Jira URL</span>
            <input
              type="url"
              value={form.jiraUrl}
              onChange={(e) => setForm({ ...form, jiraUrl: e.target.value })}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-teal-500/50"
              placeholder="https://..."
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-zinc-400">Slack thread URL</span>
            <input
              type="url"
              value={form.slackUrl}
              onChange={(e) => setForm({ ...form, slackUrl: e.target.value })}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-teal-500/50"
              placeholder="https://..."
            />
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-500"
            >
              {task ? 'Save changes' : 'Add task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function Header({
  sourceFilter,
  onSourceFilterChange,
  hideDone,
  onToggleHideDone,
  doneCount,
  onAddTask,
  onExport,
  onImport,
}: {
  sourceFilter: 'all' | TaskSource
  onSourceFilterChange: (f: 'all' | TaskSource) => void
  hideDone: boolean
  onToggleHideDone: () => void
  doneCount: number
  onAddTask: () => void
  onExport: () => void
  onImport: (json: string) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        onImport(String(reader.result))
      } catch {
        alert('Invalid JSON file')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <header className="mb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-teal-400/80">
            Task board
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50">
            {BOARD_TITLE}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">{BOARD_TAGLINE}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onAddTask}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-500"
          >
            <Plus className="h-4 w-4" />
            Add task
          </button>
          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-[var(--color-surface-hover)]"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-[var(--color-surface-hover)]"
          >
            <Upload className="h-4 w-4" />
            Import
          </button>
          <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={handleImport} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-[var(--color-border)] p-0.5">
          {(['all', 'slack', 'jira', 'gmail', 'meeting'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onSourceFilterChange(f)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                sourceFilter === f
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {f === 'all' ? 'All sources' : f === 'meeting' ? 'Meetings' : f}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onToggleHideDone}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
            hideDone
              ? 'border-[var(--color-border)] text-zinc-500 hover:text-zinc-300'
              : 'border-teal-500/40 bg-teal-500/10 text-teal-300'
          }`}
        >
          {hideDone ? `Show done (${doneCount})` : 'Hide done'}
        </button>
      </div>
    </header>
  )
}

export type { TaskFormData }
