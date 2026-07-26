import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import type { LivestreamMessage } from '../../types/livestream'
import VerifiedBadge from '../common/VerifiedBadge'

interface LivestreamChatProps {
  messages: LivestreamMessage[]
  onSend: (content: string) => void
  disabled?: boolean
}

const LivestreamChat: React.FC<LivestreamChatProps> = ({ messages, onSend, disabled }) => {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || disabled) return
    onSend(input.trim())
    setInput('')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {messages.length === 0 && (
          <p className="text-gray-500 text-xs text-center pt-4">
            No messages yet. Be the first to chat!
          </p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className="flex items-start gap-1.5">
            <img
              src={msg.user.avatar || '/default-avatar.png'}
              alt=""
              className="w-5 h-5 rounded-full mt-0.5 flex-shrink-0"
            />
            <div>
              <span className="text-xs font-semibold inline-flex items-center gap-0.5">
                {msg.user.displayName}
                {msg.user.isVerified && <VerifiedBadge />}
              </span>
              <p className="text-sm text-gray-700 break-words">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t p-2 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={disabled ? 'Stream ended' : 'Say something...'}
          disabled={disabled}
          className="flex-1 text-sm border rounded-full px-3 py-1.5 outline-none focus:border-blue-400 disabled:bg-gray-100"
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="text-blue-500 hover:text-blue-600 disabled:text-gray-300 p-1"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}

export default LivestreamChat
