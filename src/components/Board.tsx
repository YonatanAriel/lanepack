import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useState } from 'react'
import type { Lane, Task } from '../types'
import { LANES } from '../types'
import { TaskCard } from './TaskCard'

function LaneColumnInner({
  lane,
  label,
  tasks,
  onMarkDone,
  onStatusChange,
  onMoveLane,
  onMovePriority,
  onEdit,
  onDelete,
}: {
  lane: Lane
  label: string
  tasks: Task[]
  onMarkDone: (id: string) => void
  onStatusChange: (id: string, status: Task['status']) => void
  onMoveLane: (id: string, lane: Lane) => void
  onMovePriority: (id: string, direction: 'up' | 'down') => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}) {
  const sorted = [...tasks].sort((a, b) => a.priority - b.priority)
  const { setNodeRef, isOver } = useDroppable({ id: lane })

  return (
    <section
      ref={setNodeRef}
      className={`flex min-h-[200px] flex-1 flex-col rounded-xl border bg-[var(--color-surface-raised)]/50 transition-colors ${
        isOver ? 'border-teal-500/50 bg-teal-500/5' : 'border-[var(--color-border-subtle)]'
      }`}
    >
      <header className="flex items-center justify-between border-b border-[var(--color-border-subtle)] px-4 py-3">
        <h2 className="text-sm font-semibold tracking-tight text-zinc-200">{label}</h2>
        <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-400">
          {sorted.length}
        </span>
      </header>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <SortableContext items={sorted.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {sorted.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 px-4 py-10 text-center">
              <p className="text-sm text-zinc-600">Nothing here yet</p>
              <p className="mt-1 text-xs text-zinc-700">Drop a task here</p>
            </div>
          ) : (
            sorted.map((task, idx) => (
              <TaskCard
                key={task.id}
                task={task}
                isFirst={idx === 0}
                isLast={idx === sorted.length - 1}
                onMarkDone={onMarkDone}
                onStatusChange={onStatusChange}
                onMoveLane={onMoveLane}
                onMovePriority={onMovePriority}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </SortableContext>
      </div>
    </section>
  )
}

function resolveLane(overId: string, tasks: Task[]): Lane | null {
  if (overId === 'up_next' || overId === 'in_progress' || overId === 'done') return overId
  const task = tasks.find((t) => t.id === overId)
  return task?.lane ?? null
}

export function Board({
  tasks,
  hideDone = true,
  onMarkDone,
  onStatusChange,
  onMoveLane,
  onMovePriority,
  onEdit,
  onDelete,
  onReorder,
}: {
  tasks: Task[]
  hideDone?: boolean
  onMarkDone: (id: string) => void
  onStatusChange: (id: string, status: Task['status']) => void
  onMoveLane: (id: string, lane: Lane) => void
  onMovePriority: (id: string, direction: 'up' | 'down') => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onReorder: (lane: Lane, orderedIds: string[]) => void
}) {
  const visibleLanes = LANES.filter((l) => !(hideDone && l.id === 'done'))
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  function handleDragEnd(event: DragEndEvent) {
    const scrollY = window.scrollY
    setActiveId(null)
    const { active, over } = event
    if (!over) {
      requestAnimationFrame(() => window.scrollTo({ top: scrollY, behavior: 'instant' as ScrollBehavior }))
      return
    }

    const dragged = tasks.find((t) => t.id === active.id)
    if (!dragged) {
      requestAnimationFrame(() => window.scrollTo({ top: scrollY, left: 0, behavior: 'instant' as ScrollBehavior }))
      return
    }

    const overId = String(over.id)
    const targetLane = resolveLane(overId, tasks)
    if (!targetLane) {
      requestAnimationFrame(() => window.scrollTo({ top: scrollY, left: 0, behavior: 'instant' as ScrollBehavior }))
      return
    }

    // Cross-lane move (drop on lane column or on a card in another lane)
    if (dragged.lane !== targetLane) {
      onMoveLane(dragged.id, targetLane)
      requestAnimationFrame(() => {
        window.scrollTo({ top: scrollY, left: 0, behavior: 'instant' as ScrollBehavior })
      })
      return
    }

    // Same-lane reorder
    if (active.id === over.id) return
    const overTask = tasks.find((t) => t.id === over.id)
    if (!overTask) return

    const laneTasks = tasks
      .filter((t) => t.lane === dragged.lane)
      .sort((a, b) => a.priority - b.priority)

    const oldIndex = laneTasks.findIndex((t) => t.id === active.id)
    const newIndex = laneTasks.findIndex((t) => t.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = [...laneTasks]
    const [removed] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, removed)
    onReorder(dragged.lane, reordered.map((t) => t.id))

    requestAnimationFrame(() => {
      window.scrollTo({ top: scrollY, left: 0, behavior: 'instant' as ScrollBehavior })
    })
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={`grid grid-cols-1 gap-4 ${hideDone ? 'lg:grid-cols-2' : 'lg:grid-cols-3'}`}>
        {visibleLanes.map(({ id, label }) => (
          <LaneColumnInner
            key={id}
            lane={id}
            label={label}
            tasks={tasks.filter((t) => t.lane === id)}
            onMarkDone={onMarkDone}
            onStatusChange={onStatusChange}
            onMoveLane={onMoveLane}
            onMovePriority={onMovePriority}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rounded-lg border border-teal-500/40 bg-[var(--color-surface-raised)] p-3 opacity-95 shadow-2xl">
            <p className="text-sm font-medium">{activeTask.title}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
