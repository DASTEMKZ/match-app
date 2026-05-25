'use client'
import { useEffect, useState } from 'react'
import { Save, Plus, Trash2, Tag } from 'lucide-react'
import { api, Arena } from '@/lib/api'
import { formatMoney } from '@/lib/utils'

export default function SettingsPage() {
  const [arenas, setArenas] = useState<Arena[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', description: '', city: 'Алматы', size: '', surface: '', capacity: 10, pricePerHour: 8000, lighting: true })
  const [promoForm, setPromoForm] = useState({ code: '', discount: 5, usageLimit: 100 })
  const [showPromo, setShowPromo] = useState(false)

  useEffect(() => {
    api.arenas().then(setArenas).finally(() => setLoading(false))
  }, [])

  async function saveArena() {
    if (editing === 'new') {
      await api.createArena(form)
    } else if (editing) {
      await api.updateArena(editing, form)
    }
    setEditing(null)
    api.arenas().then(setArenas)
  }

  async function createPromo() {
    const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
    await fetch(`${BASE}/api/promo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(promoForm)
    })
    setShowPromo(false)
  }

  function startEdit(a: Arena) {
    setEditing(a.id)
    setForm({ name: a.name, description: a.description || '', city: a.city || 'Алматы', size: a.size, surface: a.surface, capacity: a.capacity, pricePerHour: a.pricePerHour, lighting: a.lighting })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <div className="text-xs font-semibold tracking-widest uppercase text-[#B5F23A] mb-2">Конфигурация</div>
        <h1 className="font-['Bebas_Neue'] text-4xl sm:text-5xl tracking-wide">Настройки</h1>
      </div>

      {/* Arenas */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[#F5F5F0] text-lg">Арены</h2>
          <button onClick={() => { setEditing('new'); setForm({ name: '', description: '', city: 'Алматы', size: '', surface: '', capacity: 10, pricePerHour: 8000, lighting: true }) }}
            className="flex items-center gap-1.5 bg-[#B5F23A] text-[#0A1F0A] font-semibold px-4 py-2 rounded-lg text-sm hover:opacity-90">
            <Plus size={14} /> Добавить арену
          </button>
        </div>

        {editing && (
          <div className="bg-[#1A3A1A] border border-[#B5F23A]/30 rounded-2xl p-6 mb-4">
            <h3 className="font-medium text-[#F5F5F0] mb-4">{editing === 'new' ? 'Новая арена' : 'Редактирование'}</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-[#8FAD8F] mb-1.5">Название</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-[#0A1F0A] border border-[#2A4A2A] rounded-xl px-3 py-2.5 text-sm text-[#F5F5F0] focus:outline-none focus:border-[#B5F23A]" />
              </div>
              <div>
                <label className="block text-xs text-[#8FAD8F] mb-1.5">Размер (напр. 40×20)</label>
                <input value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))}
                  className="w-full bg-[#0A1F0A] border border-[#2A4A2A] rounded-xl px-3 py-2.5 text-sm text-[#F5F5F0] focus:outline-none focus:border-[#B5F23A]" />
              </div>
              <div>
                <label className="block text-xs text-[#8FAD8F] mb-1.5">Город</label>
                <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  className="w-full bg-[#0A1F0A] border border-[#2A4A2A] rounded-xl px-3 py-2.5 text-sm text-[#F5F5F0] focus:outline-none focus:border-[#B5F23A]" />
              </div>
              <div>
                <label className="block text-xs text-[#8FAD8F] mb-1.5">Покрытие</label>
                <input value={form.surface} onChange={e => setForm(f => ({ ...f, surface: e.target.value }))}
                  className="w-full bg-[#0A1F0A] border border-[#2A4A2A] rounded-xl px-3 py-2.5 text-sm text-[#F5F5F0] focus:outline-none focus:border-[#B5F23A]" />
              </div>
              <div>
                <label className="block text-xs text-[#8FAD8F] mb-1.5">Вместимость</label>
                <input type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: +e.target.value }))}
                  className="w-full bg-[#0A1F0A] border border-[#2A4A2A] rounded-xl px-3 py-2.5 text-sm text-[#F5F5F0] focus:outline-none focus:border-[#B5F23A]" />
              </div>
              <div>
                <label className="block text-xs text-[#8FAD8F] mb-1.5">Цена за час (₸)</label>
                <input type="number" value={form.pricePerHour} onChange={e => setForm(f => ({ ...f, pricePerHour: +e.target.value }))}
                  className="w-full bg-[#0A1F0A] border border-[#2A4A2A] rounded-xl px-3 py-2.5 text-sm text-[#F5F5F0] focus:outline-none focus:border-[#B5F23A]" />
              </div>
              <div className="flex items-center gap-3 pt-5">
                <input type="checkbox" checked={form.lighting} onChange={e => setForm(f => ({ ...f, lighting: e.target.checked }))} id="lighting" className="w-4 h-4 accent-[#B5F23A]" />
                <label htmlFor="lighting" className="text-sm text-[#F5F5F0]">Освещение</label>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(null)} className="flex-1 border border-[#2A4A2A] text-[#8FAD8F] py-2 rounded-lg text-sm hover:text-[#F5F5F0] transition-colors">Отмена</button>
              <button onClick={saveArena} className="flex-1 flex items-center justify-center gap-1.5 bg-[#B5F23A] text-[#0A1F0A] font-semibold py-2 rounded-lg text-sm hover:opacity-90">
                <Save size={14} /> Сохранить
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {arenas.map(a => (
            <div key={a.id} className="bg-[#1A3A1A] border border-[#2A4A2A] rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <span className="font-medium text-[#F5F5F0]">{a.name}</span>
                <span className="text-xs text-[#8FAD8F] ml-3">{a.city || 'Алматы'} · {a.size} · {a.surface}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#B5F23A] font-medium text-sm">{formatMoney(a.pricePerHour)}/ч</span>
                <button onClick={() => startEdit(a)} className="text-xs text-[#8FAD8F] border border-[#2A4A2A] hover:border-[#B5F23A] hover:text-[#B5F23A] px-2.5 py-1 rounded-lg transition-colors">Изменить</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Promo codes */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[#F5F5F0] text-lg">Промокоды</h2>
          <button onClick={() => setShowPromo(true)}
            className="flex items-center gap-1.5 border border-[#2A4A2A] text-[#8FAD8F] hover:text-[#B5F23A] hover:border-[#B5F23A] px-4 py-2 rounded-lg text-sm transition-colors">
            <Tag size={14} /> Создать промокод
          </button>
        </div>

        {showPromo && (
          <div className="bg-[#1A3A1A] border border-[#B5F23A]/30 rounded-2xl p-6 mb-4">
            <h3 className="font-medium text-[#F5F5F0] mb-4">Новый промокод</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs text-[#8FAD8F] mb-1.5">Код</label>
                <input value={promoForm.code} onChange={e => setPromoForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="MATCH10"
                  className="w-full bg-[#0A1F0A] border border-[#2A4A2A] rounded-xl px-3 py-2.5 text-sm text-[#F5F5F0] font-mono focus:outline-none focus:border-[#B5F23A]" />
              </div>
              <div>
                <label className="block text-xs text-[#8FAD8F] mb-1.5">Скидка %</label>
                <input type="number" value={promoForm.discount} onChange={e => setPromoForm(f => ({ ...f, discount: +e.target.value }))}
                  className="w-full bg-[#0A1F0A] border border-[#2A4A2A] rounded-xl px-3 py-2.5 text-sm text-[#F5F5F0] focus:outline-none focus:border-[#B5F23A]" />
              </div>
              <div>
                <label className="block text-xs text-[#8FAD8F] mb-1.5">Лимит использований</label>
                <input type="number" value={promoForm.usageLimit} onChange={e => setPromoForm(f => ({ ...f, usageLimit: +e.target.value }))}
                  className="w-full bg-[#0A1F0A] border border-[#2A4A2A] rounded-xl px-3 py-2.5 text-sm text-[#F5F5F0] focus:outline-none focus:border-[#B5F23A]" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowPromo(false)} className="flex-1 border border-[#2A4A2A] text-[#8FAD8F] py-2 rounded-lg text-sm">Отмена</button>
              <button onClick={createPromo} className="flex-1 bg-[#B5F23A] text-[#0A1F0A] font-semibold py-2 rounded-lg text-sm hover:opacity-90">Создать</button>
            </div>
          </div>
        )}

        <div className="bg-[#1A3A1A] border border-[#2A4A2A] rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-[#B5F23A]">MATCH5</span>
            <span className="text-xs text-[#8FAD8F]">Скидка 5% · Лимит 1000</span>
          </div>
          <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-lg">Активен</span>
        </div>
      </section>
    </div>
  )
}
