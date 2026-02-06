import { Bot, ListTodo } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Agent, AgentStatus } from '@/types'
import { cn } from '@/lib/utils'

interface AgentCardProps {
  agent: Agent;
  onSelect: (agent: Agent) => void;
}

const statusConfig: Record<AgentStatus, { label: string; variant: 'success' | 'warning' | 'error' | 'secondary'; dot: string }> = {
  active: { label: 'Active', variant: 'success', dot: 'bg-success' },
  idle: { label: 'Idle', variant: 'warning', dot: 'bg-warning' },
  error: { label: 'Error', variant: 'error', dot: 'bg-error' },
  inactive: { label: 'Inactive', variant: 'secondary', dot: 'bg-muted-foreground' },
}

export function AgentCard({ agent, onSelect }: AgentCardProps) {
  const status = statusConfig[agent.status]

  return (
    <Card
      className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm"
      onClick={() => onSelect(agent)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
            agent.status === 'active' ? 'bg-success/10 text-success' :
            agent.status === 'idle' ? 'bg-warning/10 text-warning' :
            agent.status === 'inactive' ? 'bg-muted/50 text-muted-foreground' :
            'bg-error/10 text-error'
          )}>
            <Bot className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium truncate">{agent.name}</span>
              <span className={cn('h-2 w-2 rounded-full shrink-0', status.dot)} />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{agent.agentType}</span>
              <span className="text-border">|</span>
              <span>{agent.teamName}</span>
            </div>
            {agent.currentTask && (
              <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <ListTodo className="h-3 w-3 shrink-0" />
                <span className="truncate">{agent.currentTask}</span>
              </div>
            )}
          </div>
          <Badge variant={status.variant} className="text-[10px] shrink-0">
            {status.label}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
