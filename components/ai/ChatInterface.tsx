'use client'

import { useState, useEffect, useRef } from 'react'
import { Send } from 'lucide-react'
import { TrialGroup, ChatMessage } from '@/lib/types'
import { supabase } from '@/lib/supabase'
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
        <li key={i} className="ml-4 list-disc text-[#ccc]">
          <BoldText text={content} />
        </li>
      )
    }
    return (
      <p key={i} className={`text-[#ccc] ${line === '' ? 'mt-2' : ''}`}>
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
          <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

export default function ChatInterface({ groups }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const loadHistory = async () => {
      const { data } = await supabase
        .from('chat_history')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50)
      if (data) {
        setMessages(data.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          createdAt: m.created_at,
        })))
      }
      setLoadingHistory(false)
    }
    loadHistory()
  }, [])

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
    <div className="flex flex-col h-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#2A2A2A]">
        <h3 className="text-sm font-semibold text-white">Chat with your data</h3>
        <p className="text-xs text-[#555]">Ask anything about your trial reels</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {loadingHistory && (
          <div className="text-center text-xs text-[#555] py-4">Loading history...</div>
        )}

        {!loadingHistory && messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-[#555] text-sm mb-2">No messages yet</p>
            <p className="text-[#444] text-xs">Ask a question below to get started</p>
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
                  ? 'bg-[#6B2D8B] text-white ml-8'
                  : 'bg-[#0F0F0F] border border-[#2A2A2A] mr-8'
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
      {messages.length === 0 && !loadingHistory && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {STARTER_PROMPTS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => sendMessage(p)}
              className="text-xs px-2.5 py-1 bg-[#6B2D8B]/10 border border-[#6B2D8B]/30 text-[#A855D4] rounded-full hover:bg-[#6B2D8B]/20 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-[#2A2A2A]">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your trial data..."
            rows={1}
            disabled={loading}
            className="flex-1 bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-3 py-2 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#6B2D8B] resize-none disabled:opacity-50"
            style={{ maxHeight: 120, overflowY: 'auto' }}
          />
          <button
            type="button"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-9 h-9 flex items-center justify-center bg-[#6B2D8B] hover:bg-[#7B3D9B] rounded-xl text-white transition-colors disabled:opacity-40 shrink-0"
          >
            <Send size={14} />
          </button>
        </div>
        <p className="text-[10px] text-[#444] mt-1.5">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}
