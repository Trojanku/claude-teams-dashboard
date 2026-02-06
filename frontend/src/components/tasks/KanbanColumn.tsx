import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { TaskCard } from './TaskCard'
import type { Task, TaskStatus } from '@/types'
import { cn } from '@/lib/utils'

interface KanbanColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

const columnStyles: Record<TaskStatus, { badge: 'warning' | 'default' | 'success'; accent: string }> = {
  pending: { badge: 'warning', accent: 'border-t-warning' },
  in_progress: { badge: 'default', accent: 'border-t-primary' },
  completed: { badge: 'success', accent: 'border-t-success' },
}

export function KanbanColumn({ title, status, tasks, onSelectTask, onStatusChange }: KanbanColumnProps) {
  const style = columnStyles[status]

  return (
    <div data-testid={`kanban-column-${status}`} className={cn('flex flex-col rounded-lg border border-border bg-muted/30 border-t-2', style.accent)}>
      <div className="flex items-center justify-between p-3 pb-2">
        <h3 className="text-sm font-medium">{title}</h3>
        <Badge variant={style.badge} className="text-[10px]">
          {tasks.length}
        </Badge>
      </div>
      <ScrollArea className="flex-1 px-3 pb-3">
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">No tasks</p>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onSelect={onSelectTask}
                onStatusChange={onStatusChange}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
