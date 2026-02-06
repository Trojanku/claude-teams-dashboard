import { useState, useCallback, useMemo } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Filter, Loader2 } from 'lucide-react'
import { MessageList, MessageComposer } from '@/components/messages'
import { useMessageStore } from '@/stores/messageStore'
import { useTeamStore } from '@/stores/teamStore'
import { useAgentStore } from '@/stores/agentStore'
import { api } from '@/lib/api'
import type { Message, Team, Agent } from '@/types'

export function MessagesPage() {
  const [selectedTeamId, setSelectedTeamId] = useState<string>('')
  const messages = useMessageStore((s) => s.messages)
  const setMessages = useMessageStore((s) => s.setMessages)
  const addMessage = useMessageStore((s) => s.addMessage)
  const teams = useTeamStore((s) => s.teams)
  const setTeams = useTeamStore((s) => s.setTeams)
  const agents = useAgentStore((s) => s.agents)
  const setAgents = useAgentStore((s) => s.setAgents)

  // Load teams for filter and agent list
  useQuery({
    queryKey: ['teams-for-messages'],
    queryFn: async () => {
      const result = await api.getTeams() as { data: Team[] }
      const teamsList = result.data ?? result as unknown as Team[]
      const arr = Array.isArray(teamsList) ? teamsList : []
      setTeams(arr)
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
      return arr
    },
  })

  // Load messages for selected team
  const { isLoading } = useQuery({
    queryKey: ['messages', selectedTeamId],
    queryFn: async () => {
      if (!selectedTeamId) {
        setMessages([])
        return []
      }
      const result = await api.getMessages(selectedTeamId) as { data: Message[] }
      const msgs = result.data ?? result as unknown as Message[]
      const arr = Array.isArray(msgs) ? msgs : []
      setMessages(arr)
      return arr
    },
    enabled: !!selectedTeamId,
  })

  const sendMutation = useMutation({
    mutationFn: (data: { teamId: string; sender: string; recipient?: string; content: string; type: string }) =>
      api.sendMessage(data),
    onSuccess: (_data, variables) => {
      addMessage({
        id: Date.now().toString(),
        teamId: variables.teamId,
        type: variables.type === 'broadcast' ? 'broadcast' : 'message',
        sender: 'You',
        recipient: variables.recipient ?? undefined,
        content: variables.content,
        timestamp: new Date().toISOString(),
      })
    },
  })

  const handleSend = useCallback((recipient: string | null, content: string, broadcast: boolean) => {
    if (!selectedTeamId) return
    sendMutation.mutate({
      teamId: selectedTeamId,
      sender: 'You',
      recipient: recipient ?? undefined,
      content,
      type: broadcast ? 'broadcast' : 'message',
    })
  }, [selectedTeamId, sendMutation])

  const filteredAgents = useMemo(() => {
    if (!selectedTeamId) return agents
    return agents.filter((a) => a.teamId === selectedTeamId)
  }, [agents, selectedTeamId])

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-6 pb-3">
        <div>
          <h2 className="text-lg font-semibold">Messages</h2>
          <p className="text-sm text-muted-foreground">
            Communication between agents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            className="h-8 rounded-md border border-input bg-transparent px-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Select a team...</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden mx-6 mb-6 rounded-lg border border-border bg-card">
        {!selectedTeamId ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p className="text-sm">Select a team to view messages</p>
          </div>
        ) : isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <MessageList messages={messages} />
            <MessageComposer agents={filteredAgents} onSend={handleSend} />
          </>
        )}
      </div>
    </div>
  )
}
