'use client'
import { useEffect, useState } from 'react'
import { api, Booking } from '@/lib/api'
import { formatMoney, STATUS_LABELS, STATUS_COLORS, formatHour } from '@/lib/utils'
import { Calendar, Clock, X } from 'lucide-react'
import Link from 'next/link'

export default function MyBookingsPage() {
  const [phone, setPhone] = useState('')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)

  async function search() {
    if (!phone) return
    setLoading(true)
    const res = await api.bookings({ phone })
    setBookings(res)
    setSearched(true)
    setLoading(false)
  }

  async function cancel(id: string) {
    await api.updateBookingStatus(id, 'CANCELLED')
    search()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <div className="text-xs font-semibold tracking-widest uppercase text-[#B5F23A] mb-2">Личный кабинет</div>
        <h1 className="font-['Bebas_Neue'] text-4xl sm:text-5xl tracking-wide">Мои бронирования</h1>
      </div>

      <div className="flex gap-3 mb-8">
        <input
          value={phone}
          onChange={e => setPhone(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          placeholder="+7 777 123 45 67"
          className="flex-1 bg-[#1A3A1A] border border-[#2A4A2A] rounded-xl px-4 py-3 text-sm text-[#F5F5F0] placeholder-[#8FAD8F] focus:outline-none focus:border-[#B5F23A]"
        />
        <button onClick={search} disabled={loading}
          className="bg-[#B5F23A] text-[#0A1F0A] font-semibold px-6 py-3 rounded-xl text-sm hover:opacity-90 disabled:opacity-50">
          {loading ? '...' : 'Найти'}
        </button>
      </div>

      {searched && bookings.length === 0 && (
        <div className="text-center py-12 text-[#8FAD8F]">
          <Calendar size={40} className="mx-auto mb-3 opacity-40" />
          <p>Бронирований не найдено по этому номеру</p>
          <Link href="/book" className="inline-block mt-4 text-sm text-[#B5F23A] hover:opacity-80 transition-opacity">
            Забронировать поле →
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {bookings.map(b => (
          <div key={b.id} className="bg-[#1A3A1A] border border-[#2A4A2A] rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-[#F5F5F0]">{b.arena?.name || 'Арена'}</h3>
                <p className="text-xs font-mono text-[#8FAD8F]">#{b.id.slice(-6).toUpperCase()}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-lg font-medium ${STATUS_COLORS[b.status]}`}>
                {STATUS_LABELS[b.status]}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-[#8FAD8F]">
                <Calendar size={14} className="text-[#B5F23A]" /> {b.date}
              </div>
              <div className="flex items-center gap-2 text-sm text-[#8FAD8F]">
                <Clock size={14} className="text-[#B5F23A]" /> {formatHour(b.startHour)} · {b.duration}ч
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[#2A4A2A] pt-3">
              <div>
                <span className="text-[#F5F5F0] font-semibold">{formatMoney(b.totalAmount)}</span>
                <span className="text-xs text-[#8FAD8F] ml-2">предоплата {formatMoney(b.prepayAmount)}</span>
              </div>
              {['PENDING', 'CONFIRMED'].includes(b.status) && (
                <button onClick={() => cancel(b.id)}
                  className="flex items-center gap-1 text-xs text-red-400 border border-red-400/30 hover:bg-red-400/10 px-2.5 py-1.5 rounded-lg transition-colors">
                  <X size={12} /> Отменить
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
