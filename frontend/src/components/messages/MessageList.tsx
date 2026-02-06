import { useEffect, useRef } from 'react'
import { MessageSquare } from 'lucide-react'
import { MessageBubble } from './MessageBubble'
import type { Message } from '@/types'

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
        <MessageSquare className="h-12 w-12 mb-3 opacity-50" />
        <p className="text-sm font-medium">No messages yet</p>
        <p className="text-xs mt-1">Messages between agents will appear here</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="py-2">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
