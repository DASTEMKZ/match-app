'use client'
import { useEffect, useState } from 'react'
import { Search, Filter, Calendar, CheckCircle, XCircle } from 'lucide-react'
import { api, Booking } from '@/lib/api'
import { formatMoney, STATUS_LABELS, STATUS_COLORS, CLIENT_TYPE_LABELS, formatDate } from '@/lib/utils'

const STATUSES = ['', 'PENDING', 'CONFIRMED', 'PAID', 'COMPLETED', 'CANCELLED']

export default function BookingsAdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  const load = () => {
    setLoading(true)
    api.bookings(status ? { status } : {}).then(setBookings).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [status])

  const filtered = search
    ? bookings.filter(b => b.clientName.toLowerCase().includes(search.toLowerCase()) || b.clientPhone.includes(search))
    : bookings

  async function updateStatus(id: string, s: string) {
    await api.updateBookingStatus(id, s)
    load()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="text-xs font-semibold tracking-widest uppercase text-[#B5F23A] mb-2">Администрирование</div>
          <h1 className="font-['Bebas_Neue'] text-4xl sm:text-5xl tracking-wide">Бронирования</h1>
        </div>
        <div className="text-[#8FAD8F] text-sm">{filtered.length} броней</div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8FAD8F]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по имени или телефону..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#1A3A1A] border border-[#2A4A2A] rounded-xl text-sm text-[#F5F5F0] placeholder-[#8FAD8F] focus:outline-none focus:border-[#B5F23A]" />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="bg-[#1A3A1A] border border-[#2A4A2A] rounded-xl px-3 py-2.5 text-sm text-[#F5F5F0] focus:outline-none focus:border-[#B5F23A]">
          <option value="">Все статусы</option>
          {STATUSES.slice(1).map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      <div className="bg-[#1A3A1A] border border-[#2A4A2A] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[#2A4A2A]">
              <tr className="text-xs text-[#8FAD8F]">
                <th className="px-4 py-3 text-left font-medium">Клиент</th>
                <th className="px-4 py-3 text-left font-medium">Арена</th>
                <th className="px-4 py-3 text-left font-medium">Дата / Время</th>
                <th className="px-4 py-3 text-left font-medium">Тип</th>
                <th className="px-4 py-3 text-left font-medium">Сумма</th>
                <th className="px-4 py-3 text-left font-medium">Статус</th>
                <th className="px-4 py-3 text-left font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-[#2A4A2A]">
                    {Array(7).fill(0).map((__, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-3 bg-[#2A4A2A] rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.map(b => (
                <tr key={b.id} className="border-b border-[#2A4A2A] hover:bg-[#2A4A2A]/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-[#F5F5F0]">{b.clientName}</div>
                    <div className="text-xs text-[#8FAD8F]">{b.clientPhone}</div>
                  </td>
                  <td className="px-4 py-3 text-[#8FAD8F]">{b.arena?.name || b.arenaId.slice(-8)}</td>
                  <td className="px-4 py-3">
                    <div className="text-[#F5F5F0]">{b.date}</div>
                    <div className="text-xs text-[#8FAD8F]">{b.startHour}:00 · {b.duration}ч</div>
                  </td>
                  <td className="px-4 py-3 text-[#8FAD8F] text-xs">{CLIENT_TYPE_LABELS[b.clientType]}</td>
                  <td className="px-4 py-3">
                    <div className="text-[#F5F5F0] font-medium">{formatMoney(b.totalAmount)}</div>
                    <div className="text-xs text-[#B5F23A]">Предоплата {formatMoney(b.prepayAmount)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-lg font-medium ${STATUS_COLORS[b.status]}`}>
                      {STATUS_LABELS[b.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {b.status === 'PENDING' && (
                        <button onClick={() => updateStatus(b.id, 'CONFIRMED')}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#B5F23A]/10 text-[#B5F23A] hover:bg-[#B5F23A]/20 transition-colors" title="Подтвердить">
                          <CheckCircle size={14} />
                        </button>
                      )}
                      {['PENDING','CONFIRMED'].includes(b.status) && (
                        <button onClick={() => updateStatus(b.id, 'CANCELLED')}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Отменить">
                          <XCircle size={14} />
                        </button>
                      )}
                      {b.contractUrl && (
                        <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${b.contractUrl}`}
                          target="_blank" className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors" title="Договор">
                          📄
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-[#8FAD8F]">Бронирования не найдены</div>
        )}
      </div>
    </div>
  )
}
