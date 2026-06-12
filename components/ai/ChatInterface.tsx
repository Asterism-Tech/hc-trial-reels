'use client'

import { useState, useEffect, useRef } from 'react'
import { Send } from 'lucide-react'
import { TrialGroup, ChatMessage } from '@/lib/types'
import { generateId } from '@/lib/utils'
import TypingIndicator from './TypingIndicator'

interface ChatInterfaceProps {
  groups: TrialGroup[]
}

const STARTER_PROMPTS = [
  "What length video performs best?",
  "Which hook type gets the most saves?",
  "What should we test next?",
  "Compare our winners — what do they share?",
]

function renderMarkdown(text: string) {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    if (line.startsWith('- ') || line.startsWith('• ')) {
      const content = line.replace(/^[-•]\s+/, '')
      return (
        <li key={i} className="ml-4 list-disc text-[#5a2040]">
          <BoldText text={content} />
        </li>
      )
    }
    return (
      <p key={i} className={`text-[#5a2040] ${line === '' ? 'mt-2' : ''}`}>
        <BoldText text={line} />
      </p>
    )
  })
}

function BoldText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i} className="text-[#45132c] font-semibold">{part.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

export default function ChatInterface({ groups }: ChatInterfaceProps) {
  // Chat is session-only: messages live in component state and clear when
  // the page is left — no history is loaded or persisted.
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || loading) return

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    const assistantId = generateId()
    setMessages((prev) => [...prev, {
      id: assistantId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
    }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          trialData: groups,
        }),
      })

      if (res.status === 429) {
        setMessages((prev) => prev.map((m) => m.id === assistantId
          ? { ...m, content: 'Rate limit reached. Please wait before sending more messages.' }
          : m
        ))
        return
      }

      if (!res.body) return

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setMessages((prev) => prev.map((m) =>
          m.id === assistantId ? { ...m, content: accumulated } : m
        ))
      }
    } catch {
      setMessages((prev) => prev.map((m) =>
        m.id === assistantId ? { ...m, content: 'Sorry, something went wrong. Please try again.' } : m
      ))
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full bg-white border border-[#e8d5c4] rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(69,19,44,0.06)]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#e8d5c4]">
        <h3 className="text-sm font-semibold text-[#45132c]">Chat with your data</h3>
        <p className="text-xs text-[#a07080]">Ask anything about your trial reels</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 bg-[#faf9f7]">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-[#a07080] text-sm mb-2">No messages yet</p>
            <p className="text-[#b09090] text-xs">Ask a question below to get started — chats clear when you leave</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2.5 text-xs ${
                msg.role === 'user'
                  ? 'bg-[#45132c] text-white ml-8'
                  : 'bg-white border border-[#e8d5c4] mr-8 shadow-[0_1px_4px_rgba(69,19,44,0.06)]'
              }`}
            >
              {msg.role === 'assistant' && msg.content === '' ? (
                <TypingIndicator />
              ) : (
                <div className="space-y-0.5 leading-relaxed">
                  {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                </div>
              )}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter chips */}
      {messages.length === 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5 bg-[#faf9f7]">
          {STARTER_PROMPTS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => sendMessage(p)}
              className="text-xs px-2.5 py-1 bg-[#45132c]/5 border border-[#45132c]/20 text-[#45132c] rounded-full hover:bg-[#45132c]/10 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-[#e8d5c4] bg-white">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your trial data..."
            rows={1}
            disabled={loading}
            className="flex-1 bg-[#faf9f7] border border-[#e8d5c4] rounded-xl px-3 py-2 text-sm text-[#45132c] placeholder-[#c0a0b0] focus:outline-none focus:border-[#45132c] focus:shadow-[0_0_0_3px_rgba(237,74,126,0.1)] transition-all resize-none disabled:opacity-50"
            style={{ maxHeight: 120, overflowY: 'auto' }}
          />
          <button
            type="button"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-9 h-9 flex items-center justify-center bg-[#45132c] hover:bg-[#ed4a7e] rounded-xl text-white transition-all duration-200 disabled:opacity-40 shrink-0 hover:scale-105 hover:shadow-[0_4px_12px_rgba(237,74,126,0.2)]"
          >
            <Send size={14} />
          </button>
        </div>
        <p className="text-[10px] text-[#b09090] mt-1.5">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}
