import { X, User, Link2, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import type { Task, TaskStatus } from '@/types'

interface TaskDetailPanelProps {
  task: Task;
  onClose: () => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

const statusBadgeVariant: Record<TaskStatus, 'warning' | 'default' | 'success'> = {
  pending: 'warning',
  in_progress: 'default',
  completed: 'success',
}

const statusLabel: Record<TaskStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
}

export function TaskDetailPanel({ task, onClose, onStatusChange }: TaskDetailPanelProps) {
  return (
    <div data-testid="task-detail-panel" className="flex h-full w-80 flex-col border-l border-border bg-card">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground">#{task.id}</span>
          <Badge variant={statusBadgeVariant[task.status]}>
            {statusLabel[task.status]}
          </Badge>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 hover:bg-accent transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <Separator />
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">{task.subject}</h3>
          </div>

          {task.description && (
            <div>
              <h4 className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</h4>
              <p className="text-sm whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {task.owner && (
            <div>
              <h4 className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">Owner</h4>
              <div className="flex items-center gap-1.5 text-sm">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{task.owner}</span>
              </div>
            </div>
          )}

          {task.activeForm && (
            <div>
              <h4 className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Form</h4>
              <p className="text-sm">{task.activeForm}</p>
            </div>
          )}

          <Separator />

          <div>
            <h4 className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Dependencies</h4>
            {task.blockedBy.length > 0 ? (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Blocked by:</p>
                <div className="flex flex-wrap gap-1">
                  {task.blockedBy.map((id) => (
                    <Badge key={id} variant="outline" className="text-[10px]">
                      <Link2 className="mr-0.5 h-2.5 w-2.5" />
                      #{id}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No blockers</p>
            )}
            {task.blocks.length > 0 && (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-muted-foreground">Blocks:</p>
                <div className="flex flex-wrap gap-1">
                  {task.blocks.map((id) => (
                    <Badge key={id} variant="outline" className="text-[10px]">
                      <ArrowRight className="mr-0.5 h-2.5 w-2.5" />
                      #{id}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
      <Separator />
      <div className="flex gap-2 p-3">
        {task.status !== 'in_progress' && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => onStatusChange(task.id, 'in_progress')}
          >
            Start
          </Button>
        )}
        {task.status !== 'completed' && (
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onStatusChange(task.id, 'completed')}
          >
            Complete
          </Button>
        )}
        {task.status === 'completed' && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => onStatusChange(task.id, 'pending')}
          >
            Reopen
          </Button>
        )}
      </div>
    </div>
  )
}
