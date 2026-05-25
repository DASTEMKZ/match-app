'use client'
import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot } from 'lucide-react'
import { api } from '@/lib/api'

interface Msg { role: 'user' | 'bot'; text: string }

const QUICK = ['Свободные слоты', 'Цены', 'Забронировать', 'Адрес']

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'bot', text: 'Привет! Я бот Match ⚽\n\nМогу помочь с расписанием, ценами и бронированием. Что интересует?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const sessionId = useRef(Math.random().toString(36).slice(2))

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  async function send(text: string) {
    if (!text.trim() || loading) return
    setInput('')
    setMsgs(m => [...m, { role: 'user', text }])
    setLoading(true)
    try {
      const { response } = await api.chat(sessionId.current, text)
      setMsgs(m => [...m, { role: 'bot', text: response }])
    } catch {
      setMsgs(m => [...m, { role: 'bot', text: 'Ошибка соединения. Попробуйте позже.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {open && (
        <div className="mb-3 w-80 rounded-2xl border border-[#2A4A2A] bg-[#0A1F0A] shadow-2xl flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#1A3A1A] border-b border-[#2A4A2A]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#B5F23A]/20 flex items-center justify-center">
                <Bot size={16} className="text-[#B5F23A]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#F5F5F0]">Match Bot</p>
                <p className="text-xs text-[#B5F23A]">Онлайн 24/7</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-[#8FAD8F] hover:text-[#F5F5F0]">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-80">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-[#B5F23A] text-[#0A1F0A] font-medium rounded-br-sm'
                    : 'bg-[#1A3A1A] text-[#F5F5F0] border border-[#2A4A2A] rounded-bl-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#1A3A1A] border border-[#2A4A2A] rounded-2xl rounded-bl-sm px-3 py-2">
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 bg-[#B5F23A] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          <div className="px-3 pb-2 flex gap-1.5 flex-wrap">
            {QUICK.map(q => (
              <button key={q} onClick={() => send(q)}
                className="text-xs border border-[#2A4A2A] text-[#8FAD8F] hover:border-[#B5F23A] hover:text-[#B5F23A] px-2 py-1 rounded-lg transition-colors">
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-[#2A4A2A] p-3 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send(input)}
              placeholder="Напишите сообщение..."
              className="flex-1 bg-[#1A3A1A] border border-[#2A4A2A] rounded-lg px-3 py-2 text-sm text-[#F5F5F0] placeholder-[#8FAD8F] focus:outline-none focus:border-[#B5F23A]"
            />
            <button onClick={() => send(input)}
              className="w-9 h-9 bg-[#B5F23A] text-[#0A1F0A] rounded-lg flex items-center justify-center hover:opacity-90 disabled:opacity-50"
              disabled={!input.trim() || loading}>
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 bg-[#B5F23A] text-[#0A1F0A] rounded-full shadow-lg flex items-center justify-center hover:opacity-90 transition-all pulse-lime">
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  )
}
