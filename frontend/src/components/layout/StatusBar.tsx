import { useUIStore } from '@/stores/uiStore'
import { useTeamStore } from '@/stores/teamStore'
import { useAgentStore } from '@/stores/agentStore'
import { cn } from '@/lib/utils'

export function StatusBar() {
  const connected = useUIStore((s) => s.connected)
  const teams = useTeamStore((s) => s.teams)
  const agents = useAgentStore((s) => s.agents)

  const activeAgents = agents.filter((a) => a.status === 'active').length

  return (
    <footer className="flex h-7 items-center gap-4 border-t border-border bg-card px-4 text-xs text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            'inline-block h-2 w-2 rounded-full',
            connected ? 'bg-success' : 'bg-error'
          )}
        />
        <span>{connected ? 'Connected' : 'Disconnected'}</span>
      </div>
      <span className="text-border">|</span>
      <span>{teams.length} team{teams.length !== 1 ? 's' : ''}</span>
      <span className="text-border">|</span>
      <span>{activeAgents} agent{activeAgents !== 1 ? 's' : ''} active</span>
    </footer>
  )
}
