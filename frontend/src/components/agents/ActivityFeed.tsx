import { Clock, CheckCircle2, Play, MessageSquare, AlertCircle } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { AgentActivity } from '@/types'
import { cn } from '@/lib/utils'

interface ActivityFeedProps {
  activities: AgentActivity[];
}

const activityIcons: Record<AgentActivity['type'], { icon: React.ElementType; color: string }> = {
  task_started: { icon: Play, color: 'text-primary' },
  task_completed: { icon: CheckCircle2, color: 'text-success' },
  message_sent: { icon: MessageSquare, color: 'text-muted-foreground' },
  status_changed: { icon: AlertCircle, color: 'text-warning' },
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Clock className="h-8 w-8 mb-2 opacity-50" />
        <p className="text-sm">No activity yet</p>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1">
      <div className="space-y-1 p-4">
        {activities.map((activity) => {
          const config = activityIcons[activity.type]
          const Icon = config.icon
          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 rounded-md p-2 hover:bg-muted/50 transition-colors"
            >
              <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', config.color)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{activity.agentName}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{activity.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}
