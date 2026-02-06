import { useState, useCallback, useMemo } from 'react'
import { Bot, Filter, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { AgentCard, AgentDetailPanel, ActivityFeed } from '@/components/agents'
import { useAgentStore } from '@/stores/agentStore'
import { useTeamStore } from '@/stores/teamStore'
import { api } from '@/lib/api'
import type { Agent, AgentStatus, Team } from '@/types'

export function AgentsPage() {
  const [activeTab, setActiveTab] = useState('agents')
  const [filterTeam, setFilterTeam] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const selectedAgentId = useAgentStore((s) => s.selectedAgentId)
  const selectAgent = useAgentStore((s) => s.selectAgent)
  const setAgents = useAgentStore((s) => s.setAgents)
  const activities = useAgentStore((s) => s.activities)
  const agents = useAgentStore((s) => s.agents)
  const teams = useTeamStore((s) => s.teams)
  const setTeams = useTeamStore((s) => s.setTeams)

  const { isLoading } = useQuery({
    queryKey: ['teams-for-agents'],
    queryFn: async () => {
      const result = await api.getTeams() as { data: Team[] }
      const teamsList = result.data ?? result as unknown as Team[]
      const arr = Array.isArray(teamsList) ? teamsList : []
      setTeams(arr)
      // Derive agents from team members
      const allAgents: Agent[] = arr.flatMap((team) =>
        team.members.map((member) => ({
          name: member.name,
          agentId: member.agentId,
          agentType: member.agentType,
          teamId: team.id,
          teamName: team.name,
          status: member.status,
          currentTask: member.currentTask,
        }))
      )
      setAgents(allAgents)
      return allAgents
    },
  })

  const filteredAgents = useMemo(() => {
    return agents.filter((a) => {
      if (filterTeam && a.teamId !== filterTeam) return false
      if (filterStatus && a.status !== filterStatus) return false
      return true
    })
  }, [agents, filterTeam, filterStatus])

  const handleSelectAgent = useCallback((agent: Agent) => {
    selectAgent(agent.agentId)
  }, [selectAgent])

  const selectedAgent = agents.find((a) => a.agentId === selectedAgentId)

  const statusCounts = useMemo(() => {
    const counts: Record<AgentStatus, number> = { active: 0, idle: 0, error: 0, inactive: 0 }
    agents.forEach((a) => { counts[a.status]++ })
    return counts
  }, [agents])

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-4">
          <div>
            <h2 className="text-lg font-semibold">Agent Monitor</h2>
            <p className="text-sm text-muted-foreground">
              {agents.length} agent{agents.length !== 1 ? 's' : ''} across {teams.length} team{teams.length !== 1 ? 's' : ''}
              {statusCounts.active > 0 && (
                <span className="text-success"> -- {statusCounts.active} active</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
              className="h-8 rounded-md border border-input bg-transparent px-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">All Teams</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-8 rounded-md border border-input bg-transparent px-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="idle">Idle</option>
              <option value="error">Error</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-hidden px-6 pb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="agents">Agents</TabsTrigger>
              <TabsTrigger value="activity">Activity Feed</TabsTrigger>
            </TabsList>

            <TabsContent value="agents" className="h-full overflow-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredAgents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <Bot className="h-12 w-12 mb-3 opacity-50" />
                  <p className="text-sm font-medium">No agents found</p>
                  <p className="text-xs mt-1">
                    {agents.length === 0 ? 'Teams need to have members to show agents' : 'Try adjusting your filters'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 mt-2 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredAgents.map((agent) => (
                    <AgentCard
                      key={agent.agentId}
                      agent={agent}
                      onSelect={handleSelectAgent}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="activity" className="h-full">
              <ActivityFeed activities={activities} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {selectedAgent && (
        <AgentDetailPanel
          agent={selectedAgent}
          activities={activities}
          onClose={() => selectAgent(null)}
        />
      )}
    </div>
  )
}
