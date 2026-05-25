'use client'
import { useEffect, useState } from 'react'
import { Download, TrendingUp, Users, Calendar, Percent } from 'lucide-react'
import { api, DashboardData } from '@/lib/api'
import { formatMoney, WEEKDAYS } from '@/lib/utils'

const PERIODS = [
  { label: 'Неделя', days: 7 },
  { label: 'Месяц', days: 30 },
  { label: '3 месяца', days: 90 },
]

function Bar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="w-16 text-[#8FAD8F] text-xs shrink-0">{label}</div>
      <div className="flex-1 bg-[#0A1F0A] rounded-full h-2 overflow-hidden">
        <div className="h-full bg-[#B5F23A] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="w-20 text-right text-[#F5F5F0] text-xs">{formatMoney(value)}</div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState(30)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  useEffect(() => {
    setLoading(true)
    const params: Record<string, string> = {}
    if (from) params.from = from
    if (to) params.to = to
    else if (period) {
      const d = new Date()
      params.to = d.toISOString().slice(0, 10)
      d.setDate(d.getDate() - period)
      params.from = d.toISOString().slice(0, 10)
    }
    api.dashboard(params).then(setData).finally(() => setLoading(false))
  }, [period, from, to])

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array(4).fill(0).map((_, i) => <div key={i} className="h-28 bg-[#1A3A1A] border border-[#2A4A2A] rounded-2xl animate-pulse" />)}
      </div>
    </div>
  )

  if (!data) return null

  const maxDay = Math.max(...data.byDay.map(d => d.amount), 1)
  const maxHour = Math.max(...data.peakHours.map(h => h.count), 1)
  const typeTotal = data.byType.PRIVATE + data.byType.CORPORATE + data.byType.SUBSCRIPTION

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="text-xs font-semibold tracking-widest uppercase text-[#B5F23A] mb-2">Финансы</div>
          <h1 className="font-['Bebas_Neue'] text-4xl sm:text-5xl tracking-wide">Аналитика</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {PERIODS.map(p => (
            <button key={p.days} onClick={() => { setPeriod(p.days); setFrom(''); setTo('') }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                period === p.days && !from ? 'bg-[#B5F23A] text-[#0A1F0A] border-[#B5F23A]' : 'bg-[#1A3A1A] text-[#8FAD8F] border-[#2A4A2A] hover:border-[#B5F23A]'
              }`}>{p.label}</button>
          ))}
          <button onClick={() => api.exportFinance(from, to)}
            className="flex items-center gap-1.5 border border-[#2A4A2A] text-[#8FAD8F] hover:text-[#B5F23A] hover:border-[#B5F23A] px-3 py-1.5 rounded-lg text-xs transition-colors">
            <Download size={12} /> Excel
          </button>
          <button onClick={() => api.export1C(from, to)}
            className="flex items-center gap-1.5 border border-[#2A4A2A] text-[#8FAD8F] hover:text-[#B5F23A] hover:border-[#B5F23A] px-3 py-1.5 rounded-lg text-xs transition-colors">
            <Download size={12} /> 1C XML
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: TrendingUp, label: 'Выручка', value: formatMoney(data.revenue), sub: `Предоплаты: ${formatMoney(data.prepaid)}` },
          { icon: Calendar, label: 'Бронирований', value: data.totalBookings.toString(), sub: 'За период' },
          { icon: Users, label: 'Средний чек', value: formatMoney(data.totalBookings ? Math.round(data.revenue / data.totalBookings) : 0), sub: 'На бронирование' },
          { icon: Percent, label: 'Загруженность', value: `${data.arenaLoad.length ? Math.round(data.arenaLoad.reduce((s, a) => s + a.load, 0) / data.arenaLoad.length) : 0}%`, sub: 'В среднем' },
        ].map(c => (
          <div key={c.label} className="bg-[#1A3A1A] border border-[#2A4A2A] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-[#B5F23A]/10 rounded-lg flex items-center justify-center">
                <c.icon size={16} className="text-[#B5F23A]" />
              </div>
              <span className="text-xs text-[#8FAD8F]">{c.label}</span>
            </div>
            <div className="font-['Bebas_Neue'] text-3xl text-[#F5F5F0]">{c.value}</div>
            <div className="text-xs text-[#8FAD8F] mt-1">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue by day */}
        <div className="bg-[#1A3A1A] border border-[#2A4A2A] rounded-2xl p-6">
          <h3 className="font-semibold text-[#F5F5F0] mb-4">Выручка по дням</h3>
          {data.byDay.length === 0 ? (
            <p className="text-[#8FAD8F] text-sm">Нет данных за период</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {data.byDay.slice(-14).map(d => (
                <Bar key={d.date} label={d.date.slice(5)} value={d.amount} max={maxDay} />
              ))}
            </div>
          )}
        </div>

        {/* Arena load */}
        <div className="bg-[#1A3A1A] border border-[#2A4A2A] rounded-2xl p-6">
          <h3 className="font-semibold text-[#F5F5F0] mb-4">Загруженность арен</h3>
          <div className="space-y-3">
            {data.arenaLoad.map(a => (
              <div key={a.arenaId}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#F5F5F0]">{a.name}</span>
                  <span className="text-[#B5F23A]">{a.load}%</span>
                </div>
                <div className="bg-[#0A1F0A] rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-[#B5F23A] rounded-full transition-all duration-500" style={{ width: `${a.load}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak hours */}
        <div className="bg-[#1A3A1A] border border-[#2A4A2A] rounded-2xl p-6">
          <h3 className="font-semibold text-[#F5F5F0] mb-4">Пиковые часы</h3>
          {data.peakHours.length === 0 ? (
            <p className="text-[#8FAD8F] text-sm">Нет данных</p>
          ) : (
            <div className="space-y-2">
              {data.peakHours.slice(0, 8).map(h => (
                <div key={h.hour} className="flex items-center gap-3 text-sm">
                  <div className="w-12 text-[#8FAD8F] text-xs">{h.hour}:00</div>
                  <div className="flex-1 bg-[#0A1F0A] rounded-full h-2">
                    <div className="h-full bg-[#B5F23A] rounded-full" style={{ width: `${(h.count / maxHour) * 100}%` }} />
                  </div>
                  <div className="w-8 text-right text-[#F5F5F0] text-xs">{h.count}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Client types */}
        <div className="bg-[#1A3A1A] border border-[#2A4A2A] rounded-2xl p-6">
          <h3 className="font-semibold text-[#F5F5F0] mb-4">Типы клиентов</h3>
          <div className="space-y-4">
            {[
              { key: 'PRIVATE', label: 'Частные', color: '#B5F23A' },
              { key: 'CORPORATE', label: 'Корпоративные', color: '#5FAD1E' },
              { key: 'SUBSCRIPTION', label: 'Абонементы', color: '#8FAD8F' },
            ].map(t => {
              const count = data.byType[t.key as keyof typeof data.byType] || 0
              const pct = typeTotal > 0 ? Math.round((count / typeTotal) * 100) : 0
              return (
                <div key={t.key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#F5F5F0]">{t.label}</span>
                    <span style={{ color: t.color }}>{count} ({pct}%)</span>
                  </div>
                  <div className="bg-[#0A1F0A] rounded-full h-2">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: t.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
