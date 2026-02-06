import { Bot, Radio, Settings2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Message } from '@/types'
import { cn } from '@/lib/utils'

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isSystem = message.type === 'system'
  const isBroadcast = message.type === 'broadcast'

  if (isSystem) {
    return (
      <div className="flex items-center gap-2 py-1 px-4">
        <Settings2 className="h-3 w-3 text-muted-foreground shrink-0" />
        <p className="text-xs text-muted-foreground italic">{message.content}</p>
        <span className="text-[10px] text-muted-foreground/60 shrink-0">
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
    )
  }

  return (
    <div className={cn(
      'group flex gap-3 px-4 py-2 hover:bg-muted/30 transition-colors',
      isBroadcast && 'bg-primary/5 border-l-2 border-primary'
    )}>
      <div className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
        isBroadcast ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
      )}>
        {isBroadcast ? <Radio className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-medium">{message.sender}</span>
          {isBroadcast && (
            <Badge variant="default" className="text-[10px] px-1.5 py-0">
              Broadcast
            </Badge>
          )}
          {message.recipient && !isBroadcast && (
            <span className="text-xs text-muted-foreground">
              to {message.recipient}
            </span>
          )}
          <span className="text-[10px] text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words">
          {message.content}
        </p>
        {message.summary && (
          <p className="mt-0.5 text-xs text-muted-foreground italic">{message.summary}</p>
        )}
      </div>
    </div>
  )
}
