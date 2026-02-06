import { X, Bot, UserPlus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import type { Team, AgentStatus } from '@/types'

interface TeamDetailPanelProps {
  team: Team;
  onClose: () => void;
  onSpawnAgent: (team: Team) => void;
  onCleanup: (team: Team) => void;
}

const agentStatusConfig: Record<AgentStatus, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-success' },
  idle: { label: 'Idle', color: 'bg-warning' },
  error: { label: 'Error', color: 'bg-error' },
}

export function TeamDetailPanel({ team, onClose, onSpawnAgent, onCleanup }: TeamDetailPanelProps) {
  return (
    <div className="flex h-full w-80 flex-col border-l border-border bg-card">
      <div className="flex items-center justify-between p-4">
        <h3 className="font-semibold">{team.name}</h3>
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
          {team.description && (
            <div>
              <h4 className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</h4>
              <p className="text-sm">{team.description}</p>
            </div>
          )}

          <div>
            <h4 className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</h4>
            <Badge variant={team.status === 'active' ? 'success' : team.status === 'error' ? 'error' : team.status === 'idle' ? 'secondary' : 'secondary'}>
              {team.status}
            </Badge>
          </div>

          <div>
            <h4 className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</h4>
            <p className="text-sm">{new Date(team.createdAt).toLocaleString()}</p>
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Members ({team.members.length})
              </h4>
            </div>
            <div className="space-y-2">
              {team.members.length === 0 ? (
                <p className="text-sm text-muted-foreground">No members yet</p>
              ) : (
                team.members.map((member) => {
                  const statusInfo = agentStatusConfig[member.status]
                  return (
                    <div
                      key={member.agentId}
                      className="flex items-center gap-3 rounded-md border border-border p-2"
                    >
                      <Bot className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{member.name}</span>
                          <span className={`h-2 w-2 rounded-full ${statusInfo.color}`} />
                        </div>
                        <span className="text-xs text-muted-foreground">{member.agentType}</span>
                        {member.currentTask && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            Working on: {member.currentTask}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
      <Separator />
      <div className="flex gap-2 p-3">
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={() => onSpawnAgent(team)}
        >
          <UserPlus className="mr-1 h-3.5 w-3.5" />
          Spawn Agent
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-error hover:text-error"
          onClick={() => onCleanup(team)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
