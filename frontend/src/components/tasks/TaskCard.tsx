import { MoreVertical, ArrowRight, ArrowLeft, Ban, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import type { Task, TaskStatus } from '@/types'

interface TaskCardProps {
  task: Task;
  onSelect: (task: Task) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

export function TaskCard({ task, onSelect, onStatusChange }: TaskCardProps) {
  const isBlocked = task.blockedBy.length > 0

  return (
    <Card
      className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm"
      onClick={() => onSelect(task)}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-muted-foreground font-mono">#{task.id}</span>
              {isBlocked && (
                <Badge variant="error" className="text-[10px] px-1.5 py-0">
                  <Ban className="mr-0.5 h-2.5 w-2.5" />
                  Blocked
                </Badge>
              )}
            </div>
            <p className="text-sm font-medium leading-tight">{task.subject}</p>
            {task.description && (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              className="shrink-0 rounded-md p-1 hover:bg-accent"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {task.status !== 'pending' && (
                <DropdownMenuItem onClick={() => onStatusChange(task.id, 'pending')}>
                  <ArrowLeft className="mr-2 h-3.5 w-3.5" />
                  Move to Pending
                </DropdownMenuItem>
              )}
              {task.status !== 'in_progress' && (
                <DropdownMenuItem onClick={() => onStatusChange(task.id, 'in_progress')}>
                  <ArrowRight className="mr-2 h-3.5 w-3.5" />
                  Move to In Progress
                </DropdownMenuItem>
              )}
              {task.status !== 'completed' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onStatusChange(task.id, 'completed')}>
                    <ArrowRight className="mr-2 h-3.5 w-3.5 text-success" />
                    Mark Completed
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {task.owner && (
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span>{task.owner}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
