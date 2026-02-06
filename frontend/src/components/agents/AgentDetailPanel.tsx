import { X, Bot, ListTodo, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import type { Agent, AgentActivity, AgentStatus } from '@/types'
import { cn } from '@/lib/utils'

interface AgentDetailPanelProps {
  agent: Agent;
  activities: AgentActivity[];
  onClose: () => void;
}

const statusConfig: Record<AgentStatus, { label: string; variant: 'success' | 'warning' | 'error' | 'secondary'; dot: string }> = {
  active: { label: 'Active', variant: 'success', dot: 'bg-success' },
  idle: { label: 'Idle', variant: 'warning', dot: 'bg-warning' },
  error: { label: 'Error', variant: 'error', dot: 'bg-error' },
  inactive: { label: 'Inactive', variant: 'secondary', dot: 'bg-muted-foreground' },
}

export function AgentDetailPanel({ agent, activities, onClose }: AgentDetailPanelProps) {
  const status = statusConfig[agent.status]
  const agentActivities = activities.filter((a) => a.agentName === agent.name)

  return (
    <div className="flex h-full w-80 flex-col border-l border-border bg-card">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className={cn(
            'flex h-7 w-7 items-center justify-center rounded-full',
            agent.status === 'active' ? 'bg-success/10 text-success' :
            agent.status === 'idle' ? 'bg-warning/10 text-warning' :
            agent.status === 'inactive' ? 'bg-muted/50 text-muted-foreground' :
            'bg-error/10 text-error'
          )}>
            <Bot className="h-4 w-4" />
          </div>
          <span className="font-semibold">{agent.name}</span>
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
            <h4 className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</h4>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>

          <div>
            <h4 className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</h4>
            <p className="text-sm">{agent.agentType}</p>
          </div>

          <div>
            <h4 className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">Team</h4>
            <p className="text-sm">{agent.teamName}</p>
          </div>

          {agent.currentTask && (
            <div>
              <h4 className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Task</h4>
              <div className="flex items-center gap-1.5 text-sm">
                <ListTodo className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{agent.currentTask}</span>
              </div>
            </div>
          )}

          <Separator />

          <div>
            <h4 className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Recent Activity
            </h4>
            {agentActivities.length === 0 ? (
              <p className="text-xs text-muted-foreground">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {agentActivities.slice(0, 20).map((activity) => (
                  <div key={activity.id} className="flex gap-2">
                    <Clock className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-xs">{activity.description}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
