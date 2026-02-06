import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, Loader2 } from 'lucide-react'
import { TeamCard, TeamDetailPanel } from '@/components/teams'
import { useTeamStore } from '@/stores/teamStore'
import { api } from '@/lib/api'
import type { Team } from '@/types'

export function TeamsPage() {
  const queryClient = useQueryClient()
  const selectedTeamId = useTeamStore((s) => s.selectedTeamId)
  const selectTeam = useTeamStore((s) => s.selectTeam)
  const setTeams = useTeamStore((s) => s.setTeams)

  const { data: teams = [], isLoading, error } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const result = await api.getTeams() as { data: Team[] }
      const teamsList = result.data ?? result as unknown as Team[]
      setTeams(Array.isArray(teamsList) ? teamsList : [])
      return Array.isArray(teamsList) ? teamsList : []
    },
  })

  const cleanupMutation = useMutation({
    mutationFn: (id: string) => api.deleteTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      selectTeam(null)
    },
  })

  const handleSelect = useCallback((team: Team) => {
    selectTeam(team.id)
  }, [selectTeam])

  const handleSpawnAgent = useCallback((_team: Team) => {
    // TODO: Implement spawn agent dialog
  }, [])

  const handleCleanup = useCallback((team: Team) => {
    cleanupMutation.mutate(team.id)
  }, [cleanupMutation])

  const selectedTeam = teams.find((t) => t.id === selectedTeamId)

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-4">
          <div>
            <h2 className="text-lg font-semibold">Teams</h2>
            <p className="text-sm text-muted-foreground">
              Manage your Claude Code agent teams
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-6 pb-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <p className="text-sm">Failed to load teams</p>
              <p className="text-xs mt-1">Make sure the backend is running on port 3001</p>
            </div>
          ) : teams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Users className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm font-medium">No teams yet</p>
              <p className="text-xs mt-1">Teams created via Claude Code CLI will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {teams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  onSelect={handleSelect}
                  onSpawnAgent={handleSpawnAgent}
                  onCleanup={handleCleanup}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedTeam && (
        <TeamDetailPanel
          team={selectedTeam}
          onClose={() => selectTeam(null)}
          onSpawnAgent={handleSpawnAgent}
          onCleanup={handleCleanup}
        />
      )}

    </div>
  )
}
