'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Check, AlertCircle, ExternalLink } from 'lucide-react'
import { api, Arena } from '@/lib/api'
import { formatMoney, formatHour, today } from '@/lib/utils'

const TYPES = [
  { value: 'PRIVATE', label: 'Частный', discount: 0 },
  { value: 'CORPORATE', label: 'Корпоративный', discount: 15 },
  { value: 'SUBSCRIPTION', label: 'Абонемент', discount: 10 },
]

function BookForm() {
  const params = useSearchParams()
  const router = useRouter()
  const [arenas, setArenas] = useState<Arena[]>([])
  const [form, setForm] = useState({
    arenaId: params.get('arenaId') || '',
    date: params.get('date') || today(),
    startHour: parseInt(params.get('hour') || '10'),
    duration: 1,
    clientName: '',
    clientPhone: '',
    clientInsta: '',
    clientType: 'PRIVATE',
    notes: '',
    promoCode: '',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => { api.arenas().then(setArenas) }, [])

  const arena = arenas.find(a => a.id === form.arenaId)
  const typeInfo = TYPES.find(t => t.value === form.clientType)!
  const base = arena ? arena.pricePerHour * form.duration : 0
  const total = Math.round(base * (1 - typeInfo.discount / 100))
  const prepay = Math.round(total * 0.5)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.arenaId || !form.clientName || !form.clientPhone) {
      setError('Заполните обязательные поля')
      return
    }
    setLoading(true)
    try {
      const res = await api.createBooking(form)
      setResult(res)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-20 h-20 rounded-full bg-[#B5F23A]/20 flex items-center justify-center mx-auto mb-6">
          <Check size={40} className="text-[#B5F23A]" />
        </div>
        <h2 className="font-['Bebas_Neue'] text-4xl tracking-wide mb-2">Бронь создана!</h2>
        <p className="text-[#8FAD8F] mb-6">Код: <span className="text-[#B5F23A] font-mono font-bold">{result.id.slice(-6).toUpperCase()}</span></p>

        <div className="bg-[#1A3A1A] border border-[#2A4A2A] rounded-2xl p-6 text-left mb-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-[#8FAD8F]">Арена</span>
            <span className="text-[#F5F5F0]">{arena?.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#8FAD8F]">Дата и время</span>
            <span className="text-[#F5F5F0]">{result.date} {formatHour(result.startHour)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#8FAD8F]">Итого</span>
            <span className="text-[#F5F5F0] font-semibold">{formatMoney(result.totalAmount)}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-[#2A4A2A] pt-3">
            <span className="text-[#8FAD8F]">Предоплата 50%</span>
            <span className="text-[#B5F23A] font-bold">{formatMoney(result.prepayAmount)}</span>
          </div>
        </div>

        {result.contractUrl && (
          <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${result.contractUrl}`}
            target="_blank" className="flex items-center justify-center gap-2 border border-[#2A4A2A] text-[#8FAD8F] hover:text-[#B5F23A] hover:border-[#B5F23A] rounded-xl py-3 mb-3 text-sm transition-colors">
            <ExternalLink size={14} /> Скачать договор PDF
          </a>
        )}

        <a href={result.kaspiLink} target="_blank"
          className="flex items-center justify-center gap-2 w-full bg-[#B5F23A] text-[#0A1F0A] font-bold py-4 rounded-xl hover:opacity-90 transition-opacity mb-4">
          Оплатить через Kaspi {formatMoney(result.prepayAmount)}
        </a>

        <button onClick={() => router.push('/schedule')} className="text-sm text-[#8FAD8F] hover:text-[#F5F5F0] transition-colors">
          Вернуться к расписанию
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="max-w-xl mx-auto">
      <div className="mb-8">
        <div className="text-xs font-semibold tracking-widest uppercase text-[#B5F23A] mb-2">Бронирование</div>
        <h1 className="font-['Bebas_Neue'] text-4xl sm:text-5xl tracking-wide">Забронировать поле</h1>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-6 text-red-400 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Arena */}
        <div>
          <label className="block text-xs text-[#8FAD8F] mb-1.5">Арена *</label>
          <select value={form.arenaId} onChange={e => setForm(f => ({ ...f, arenaId: e.target.value }))}
            className="w-full bg-[#1A3A1A] border border-[#2A4A2A] rounded-xl px-3 py-2.5 text-sm text-[#F5F5F0] focus:outline-none focus:border-[#B5F23A]">
            <option value="">Выберите арену</option>
            {arenas.map(a => <option key={a.id} value={a.id}>{a.name} — {formatMoney(a.pricePerHour)}/ч</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#8FAD8F] mb-1.5">Дата *</label>
            <input type="date" value={form.date} min={today()}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="w-full bg-[#1A3A1A] border border-[#2A4A2A] rounded-xl px-3 py-2.5 text-sm text-[#F5F5F0] focus:outline-none focus:border-[#B5F23A]" />
          </div>
          <div>
            <label className="block text-xs text-[#8FAD8F] mb-1.5">Начало *</label>
            <select value={form.startHour} onChange={e => setForm(f => ({ ...f, startHour: parseInt(e.target.value) }))}
              className="w-full bg-[#1A3A1A] border border-[#2A4A2A] rounded-xl px-3 py-2.5 text-sm text-[#F5F5F0] focus:outline-none focus:border-[#B5F23A]">
              {Array.from({ length: 15 }, (_, i) => i + 8).map(h => (
                <option key={h} value={h}>{formatHour(h)}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs text-[#8FAD8F] mb-1.5">Длительность</label>
          <div className="flex gap-2">
            {[1,2,3,4].map(d => (
              <button key={d} type="button" onClick={() => setForm(f => ({ ...f, duration: d }))}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  form.duration === d
                    ? 'bg-[#B5F23A] text-[#0A1F0A] border-[#B5F23A]'
                    : 'bg-[#1A3A1A] text-[#8FAD8F] border-[#2A4A2A] hover:border-[#B5F23A]'
                }`}>{d} ч</button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-[#8FAD8F] mb-1.5">Тип клиента</label>
          <div className="grid grid-cols-3 gap-2">
            {TYPES.map(t => (
              <button key={t.value} type="button" onClick={() => setForm(f => ({ ...f, clientType: t.value }))}
                className={`py-2 rounded-lg text-xs font-medium transition-colors border ${
                  form.clientType === t.value
                    ? 'bg-[#B5F23A] text-[#0A1F0A] border-[#B5F23A]'
                    : 'bg-[#1A3A1A] text-[#8FAD8F] border-[#2A4A2A] hover:border-[#B5F23A]'
                }`}>
                {t.label}
                {t.discount > 0 && <span className="block text-[10px] opacity-70">−{t.discount}%</span>}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-[#8FAD8F] mb-1.5">Имя / Команда *</label>
          <input value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))}
            placeholder="Алексей / FC Nomad"
            className="w-full bg-[#1A3A1A] border border-[#2A4A2A] rounded-xl px-3 py-2.5 text-sm text-[#F5F5F0] placeholder-[#8FAD8F] focus:outline-none focus:border-[#B5F23A]" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#8FAD8F] mb-1.5">Телефон *</label>
            <input value={form.clientPhone} onChange={e => setForm(f => ({ ...f, clientPhone: e.target.value }))}
              placeholder="+7 777 123 45 67"
              className="w-full bg-[#1A3A1A] border border-[#2A4A2A] rounded-xl px-3 py-2.5 text-sm text-[#F5F5F0] placeholder-[#8FAD8F] focus:outline-none focus:border-[#B5F23A]" />
          </div>
          <div>
            <label className="block text-xs text-[#8FAD8F] mb-1.5">Instagram</label>
            <input value={form.clientInsta} onChange={e => setForm(f => ({ ...f, clientInsta: e.target.value }))}
              placeholder="@username"
              className="w-full bg-[#1A3A1A] border border-[#2A4A2A] rounded-xl px-3 py-2.5 text-sm text-[#F5F5F0] placeholder-[#8FAD8F] focus:outline-none focus:border-[#B5F23A]" />
          </div>
        </div>

        <div>
          <label className="block text-xs text-[#8FAD8F] mb-1.5">Промокод</label>
          <input value={form.promoCode} onChange={e => setForm(f => ({ ...f, promoCode: e.target.value.toUpperCase() }))}
            placeholder="MATCH5"
            className="w-full bg-[#1A3A1A] border border-[#2A4A2A] rounded-xl px-3 py-2.5 text-sm text-[#F5F5F0] placeholder-[#8FAD8F] focus:outline-none focus:border-[#B5F23A] font-mono" />
        </div>

        <div>
          <label className="block text-xs text-[#8FAD8F] mb-1.5">Заметки</label>
          <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Дополнительные пожелания..."
            rows={2}
            className="w-full bg-[#1A3A1A] border border-[#2A4A2A] rounded-xl px-3 py-2.5 text-sm text-[#F5F5F0] placeholder-[#8FAD8F] focus:outline-none focus:border-[#B5F23A] resize-none" />
        </div>

        {/* Price summary */}
        {arena && (
          <div className="bg-[#1A3A1A] border border-[#2A4A2A] rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#8FAD8F]">{formatMoney(arena.pricePerHour)} × {form.duration} ч</span>
              <span className="text-[#F5F5F0]">{formatMoney(base)}</span>
            </div>
            {typeInfo.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#8FAD8F]">Скидка {typeInfo.discount}%</span>
                <span className="text-[#B5F23A]">−{formatMoney(base - total)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-semibold border-t border-[#2A4A2A] pt-2">
              <span className="text-[#F5F5F0]">Итого</span>
              <span className="text-[#F5F5F0]">{formatMoney(total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#8FAD8F]">Предоплата 50%</span>
              <span className="text-[#B5F23A] font-bold">{formatMoney(prepay)}</span>
            </div>
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full bg-[#B5F23A] text-[#0A1F0A] font-bold py-4 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity text-base">
          {loading ? 'Создаём бронь...' : `Забронировать — ${formatMoney(prepay)}`}
        </button>
        <p className="text-xs text-center text-[#8FAD8F]">После брони придёт подтверждение в WhatsApp</p>
      </div>
    </form>
  )
}

export default function BookPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <Suspense fallback={<div className="text-[#8FAD8F]">Загрузка...</div>}>
        <BookForm />
      </Suspense>
    </div>
  )
}
