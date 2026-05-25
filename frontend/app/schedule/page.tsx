'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { api, Arena, TimeSlot } from '@/lib/api'
import { today, addDays, formatDate, formatHour } from '@/lib/utils'

const HOURS = Array.from({ length: 15 }, (_, i) => i + 8) // 8–22

export default function SchedulePage() {
  const [arenas, setArenas] = useState<Arena[]>([])
  const [slots, setSlots] = useState<Record<string, TimeSlot[]>>({}) // arenaId -> slots
  const [date, setDate] = useState(today())
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await api.arenas()
    setArenas(data)
    const all: Record<string, TimeSlot[]> = {}
    await Promise.all(data.map(async a => {
      all[a.id] = await api.arenaSchedule(a.id, date)
    }))
    setSlots(all)
    setLoading(false)
  }, [date])

  useEffect(() => { load() }, [load])

  // WebSocket
  useEffect(() => {
    const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
    const ws = new WebSocket(BASE.replace('http', 'ws') + '/ws')
    ws.onmessage = e => {
      const { event } = JSON.parse(e.data)
      if (event === 'booking_created' || event === 'booking_updated' || event === 'booking_deleted') load()
    }
    return () => ws.close()
  }, [load])

  function getSlot(arenaId: string, hour: number) {
    return slots[arenaId]?.find(s => s.hour === hour)
  }

  function slotStyle(slot?: TimeSlot) {
    if (!slot || slot.status === 'FREE') return { bg: '#B5F23A20', border: '#B5F23A40', text: '#B5F23A', label: 'Свободно' }
    if (slot.status === 'SOON_FREE') return { bg: '#FFA50020', border: '#FFA50040', text: '#FFA500', label: 'Скоро' }
    return { bg: '#EF444420', border: '#EF444440', text: '#EF4444', label: 'Занято' }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="text-xs font-semibold tracking-widest uppercase text-[#B5F23A] mb-2">Расписание</div>
          <h1 className="font-['Bebas_Neue'] text-4xl sm:text-5xl tracking-wide">График слотов</h1>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setDate(d => addDays(d, -1))} className="w-9 h-9 flex items-center justify-center border border-[#2A4A2A] rounded-lg hover:border-[#B5F23A] text-[#8FAD8F] hover:text-[#B5F23A] transition-colors">
            <ChevronLeft size={18} />
          </button>
          <div className="px-4 py-2 border border-[#2A4A2A] rounded-lg text-sm text-[#F5F5F0] bg-[#1A3A1A]">
            {formatDate(date)}
          </div>
          <button onClick={() => setDate(d => addDays(d, 1))} className="w-9 h-9 flex items-center justify-center border border-[#2A4A2A] rounded-lg hover:border-[#B5F23A] text-[#8FAD8F] hover:text-[#B5F23A] transition-colors">
            <ChevronRight size={18} />
          </button>
          <button onClick={load} className={`w-9 h-9 flex items-center justify-center border border-[#2A4A2A] rounded-lg text-[#8FAD8F] hover:text-[#B5F23A] hover:border-[#B5F23A] transition-colors ${loading ? 'animate-spin' : ''}`}>
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-6">
        {[
          { color: '#B5F23A', label: 'Свободно' },
          { color: '#EF4444', label: 'Занято' },
          { color: '#FFA500', label: 'Скоро освободится' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-2 text-xs text-[#8FAD8F]">
            <div className="w-3 h-3 rounded-sm" style={{ background: l.color + '40', border: `1px solid ${l.color}` }} />
            {l.label}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="overflow-x-auto rounded-2xl border border-[#2A4A2A]">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-[#2A4A2A]">
              <th className="px-4 py-3 text-left text-xs text-[#8FAD8F] font-medium bg-[#1A3A1A] min-w-[120px]">Арена</th>
              {HOURS.map(h => (
                <th key={h} className="px-2 py-3 text-center text-xs text-[#8FAD8F] font-medium bg-[#1A3A1A] min-w-[72px]">{formatHour(h)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <tr key={i} className="border-b border-[#2A4A2A]">
                  <td className="px-4 py-3 bg-[#1A3A1A]"><div className="h-3 bg-[#2A4A2A] rounded animate-pulse w-24" /></td>
                  {HOURS.map(h => <td key={h} className="px-2 py-3"><div className="h-8 bg-[#2A4A2A] rounded animate-pulse" /></td>)}
                </tr>
              ))
            ) : (
              arenas.map((arena, ai) => (
                <tr key={arena.id} className={`border-b border-[#2A4A2A] ${ai % 2 === 0 ? '' : 'bg-[#0d2a0d]'}`}>
                  <td className="px-4 py-3 font-medium text-[#F5F5F0] bg-[#1A3A1A] sticky left-0">
                    <div>{arena.name}</div>
                    <div className="text-[10px] font-normal text-[#8FAD8F]">{arena.city || 'Алматы'}</div>
                  </td>
                  {HOURS.map(hour => {
                    const slot = getSlot(arena.id, hour)
                    const style = slotStyle(slot)
                    const isFree = !slot || slot.status === 'FREE'
                    return (
                      <td key={hour} className="px-2 py-2">
                        {isFree ? (
                          <Link href={`/book?arenaId=${arena.id}&date=${date}&hour=${hour}`}
                            className="block w-full h-8 rounded-lg text-xs font-medium text-center leading-8 transition-all hover:scale-105 hover:brightness-110"
                            style={{ background: style.bg, border: `1px solid ${style.border}`, color: style.text }}>
                            {style.label}
                          </Link>
                        ) : (
                          <div className="w-full h-8 rounded-lg text-xs font-medium text-center leading-8 cursor-not-allowed"
                            style={{ background: style.bg, border: `1px solid ${style.border}`, color: style.text }}
                            title={slot?.booking?.clientName}>
                            {style.label}
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && arenas.length === 0 && (
        <div className="text-center py-16 text-[#8FAD8F]">Арены не найдены</div>
      )}
    </div>
  )
}
