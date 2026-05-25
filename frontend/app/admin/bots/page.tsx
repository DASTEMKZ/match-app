'use client'
import { useEffect, useState } from 'react'
import { MessageSquare, Instagram, Globe, RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'

interface BotMsg { id: string; channel: string; senderId: string; message: string; response?: string; createdAt: string }

const CHANNEL_ICONS: Record<string, any> = { whatsapp: MessageSquare, instagram: Instagram, site: Globe }
const CHANNEL_COLORS: Record<string, string> = {
  whatsapp: 'text-green-400 bg-green-400/10',
  instagram: 'text-pink-400 bg-pink-400/10',
  site: 'text-blue-400 bg-blue-400/10',
}

export default function BotsPage() {
  const [msgs, setMsgs] = useState<BotMsg[]>([])
  const [loading, setLoading] = useState(true)
  const [channel, setChannel] = useState('')

  const load = () => {
    setLoading(true)
    api.bookings().then(() => {}).catch(() => {})
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/bots/messages${channel ? `?channel=${channel}` : ''}`)
      .then(r => r.json()).then(setMsgs).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [channel])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-xs font-semibold tracking-widest uppercase text-[#B5F23A] mb-2">Боты</div>
          <h1 className="font-['Bebas_Neue'] text-4xl sm:text-5xl tracking-wide">Чат-боты</h1>
        </div>
        <button onClick={load} className={`w-9 h-9 flex items-center justify-center border border-[#2A4A2A] rounded-lg text-[#8FAD8F] hover:text-[#B5F23A] hover:border-[#B5F23A] transition-colors ${loading ? 'animate-spin' : ''}`}>
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { key: 'whatsapp', icon: MessageSquare, label: 'WhatsApp Business', status: 'Настройка через .env', color: 'text-green-400' },
          { key: 'instagram', icon: Instagram, label: 'Instagram DM', status: 'Настройка через .env', color: 'text-pink-400' },
          { key: 'site', icon: Globe, label: 'Сайт-виджет', status: 'Активен', color: 'text-[#B5F23A]' },
        ].map(b => (
          <div key={b.key} className="bg-[#1A3A1A] border border-[#2A4A2A] rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${CHANNEL_COLORS[b.key]}`}>
                <b.icon size={20} />
              </div>
              <div>
                <h3 className="font-medium text-[#F5F5F0] text-sm">{b.label}</h3>
                <span className={`text-xs ${b.color}`}>{b.status}</span>
              </div>
            </div>
            <p className="text-xs text-[#8FAD8F]">
              {b.key === 'site' ? 'Виджет активен в правом углу сайта. Двуязычный (рус/каз).' : `Для активации добавьте ${b.key.toUpperCase()}_TOKEN в .env файл.`}
            </p>
          </div>
        ))}
      </div>

      {/* Messages */}
      <div className="flex gap-2 mb-4">
        {['', 'whatsapp', 'instagram', 'site'].map(c => (
          <button key={c} onClick={() => setChannel(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              channel === c ? 'bg-[#B5F23A] text-[#0A1F0A] border-[#B5F23A]' : 'bg-[#1A3A1A] text-[#8FAD8F] border-[#2A4A2A] hover:border-[#B5F23A]'
            }`}>
            {c === '' ? 'Все' : c}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-[#1A3A1A] border border-[#2A4A2A] rounded-xl p-4 animate-pulse">
              <div className="h-3 bg-[#2A4A2A] rounded w-1/3 mb-2" />
              <div className="h-3 bg-[#2A4A2A] rounded w-2/3" />
            </div>
          ))
        ) : msgs.length === 0 ? (
          <div className="text-center py-12 text-[#8FAD8F]">Сообщений нет</div>
        ) : (
          msgs.map(m => {
            const Icon = CHANNEL_ICONS[m.channel] || MessageSquare
            return (
              <div key={m.id} className="bg-[#1A3A1A] border border-[#2A4A2A] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-xs ${CHANNEL_COLORS[m.channel]}`}>
                    <Icon size={12} />
                  </span>
                  <span className="text-xs text-[#8FAD8F] font-mono">{m.senderId}</span>
                  <span className="ml-auto text-xs text-[#8FAD8F]">{new Date(m.createdAt).toLocaleString('ru-RU')}</span>
                </div>
                <p className="text-sm text-[#F5F5F0] mb-2">→ {m.message}</p>
                {m.response && <p className="text-sm text-[#8FAD8F] border-l-2 border-[#B5F23A]/40 pl-3 whitespace-pre-wrap">{m.response}</p>}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
