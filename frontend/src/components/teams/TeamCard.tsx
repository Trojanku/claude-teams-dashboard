import { Users, ListTodo, MoreVertical, Eye, UserPlus, Trash2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import type { Team } from '@/types'
import { cn } from '@/lib/utils'

interface TeamCardProps {
  team: Team;
  onSelect: (team: Team) => void;
  onSpawnAgent: (team: Team) => void;
  onCleanup: (team: Team) => void;
}

const statusConfig = {
  active: { label: 'Active', variant: 'success' as const },
  idle: { label: 'Idle', variant: 'secondary' as const },
  error: { label: 'Error', variant: 'error' as const },
  inactive: { label: 'Inactive', variant: 'secondary' as const },
}

export function TeamCard({ team, onSelect, onSpawnAgent, onCleanup }: TeamCardProps) {
  const status = statusConfig[team.status]
  const activeMembers = team.members.filter((m) => m.status === 'active').length

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:border-primary/50 hover:shadow-md hover:shadow-primary/5',
      )}
      onClick={() => onSelect(team)}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base">{team.name}</CardTitle>
          <Badge variant={status.variant} className="text-[10px]">
            {status.label}
          </Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="rounded-md p-1 hover:bg-accent"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onSelect(team)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSpawnAgent(team)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Spawn Agent
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-error"
              onClick={() => onCleanup(team)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Cleanup
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        {team.description && (
          <p className="mb-3 text-xs text-muted-foreground line-clamp-2">
            {team.description}
          </p>
        )}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <span>{team.members.length} member{team.members.length !== 1 ? 's' : ''}</span>
            {activeMembers > 0 && (
              <span className="text-success">({activeMembers} active)</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <ListTodo className="h-3.5 w-3.5" />
            <span>tasks</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
