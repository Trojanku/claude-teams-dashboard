import { useMemo, useState } from 'react'
import { Send, Radio, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { Agent } from '@/types'

interface MessageComposerProps {
  agents: Agent[];
  onSend: (recipient: string | null, content: string, broadcast: boolean) => void;
}

const statusIndicator: Record<string, string> = {
  active: '\u25CF',   // ●
  idle: '\u25CF',     // ●
  inactive: '\u25CB', // ○
  error: '\u25CF',    // ●
}

export function MessageComposer({ agents, onSend }: MessageComposerProps) {
  const [content, setContent] = useState('')
  const [recipient, setRecipient] = useState('')
  const [broadcast, setBroadcast] = useState(false)

  const reachableAgents = useMemo(
    () => agents.filter((a) => a.status !== 'inactive'),
    [agents],
  )
  const allInactive = agents.length > 0 && reachableAgents.length === 0

  const handleSend = () => {
    if (!content.trim()) return
    if (!broadcast && !recipient) return
    onSend(broadcast ? null : recipient, content.trim(), broadcast)
    setContent('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (allInactive) {
    return (
      <div className="border-t border-border p-3 bg-card">
        <div className="flex items-center gap-2 text-muted-foreground">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p className="text-xs">All agents in this team are inactive. Messages can only be sent to running agents.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-border p-3 bg-card">
      <div className="flex items-center gap-2 mb-2">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={broadcast}
            onChange={(e) => setBroadcast(e.target.checked)}
            className="rounded"
          />
          <Radio className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Broadcast</span>
        </label>
        {!broadcast && (
          <select
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="h-7 flex-1 rounded-md border border-input bg-transparent px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Select recipient...</option>
            {agents.map((agent) => (
              <option
                key={agent.agentId}
                value={agent.name}
                disabled={agent.status === 'inactive'}
              >
                {statusIndicator[agent.status] ?? '●'} {agent.name} — {agent.status}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="flex gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={broadcast ? 'Type a broadcast message...' : 'Type a message...'}
          rows={1}
          className="min-h-[36px] max-h-[120px] resize-none text-sm"
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!content.trim() || (!broadcast && !recipient)}
          className="shrink-0 h-9 w-9"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
