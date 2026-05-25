'use client'
import { useEffect, useState } from 'react'
import { Search, UserPlus, Download, FileText } from 'lucide-react'
import { api, User } from '@/lib/api'
import { formatMoney, TAG_LABELS, formatDate } from '@/lib/utils'

const TAGS = ['', 'FAN', 'TEAM', 'CORPORATE', 'TOURNAMENT']
const TAG_COLORS: Record<string, string> = {
  FAN: 'text-green-400 bg-green-400/10',
  TEAM: 'text-blue-400 bg-blue-400/10',
  CORPORATE: 'text-purple-400 bg-purple-400/10',
  TOURNAMENT: 'text-yellow-400 bg-yellow-400/10',
}

export default function ClientsPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tag, setTag] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newUser, setNewUser] = useState<{ name: string; phone: string; tag: 'FAN'|'TEAM'|'CORPORATE'|'TOURNAMENT'; instagram: string }>({ name: '', phone: '', tag: 'FAN', instagram: '' })

  const load = () => {
    setLoading(true)
    const params: Record<string, string> = {}
    if (search) params.search = search
    if (tag) params.tag = tag
    api.users(params).then(setUsers).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [tag])

  async function addUser() {
    if (!newUser.name || !newUser.phone) return
    await api.createUser(newUser)
    setShowAdd(false)
    setNewUser({ name: '', phone: '', tag: 'FAN', instagram: '' })
    load()
  }

  const filtered = search ? users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search) ||
    (u.instagram || '').includes(search)
  ) : users

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="text-xs font-semibold tracking-widest uppercase text-[#B5F23A] mb-2">CRM</div>
          <h1 className="font-['Bebas_Neue'] text-4xl sm:text-5xl tracking-wide">База клиентов</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => api.exportClients()}
            className="flex items-center gap-1.5 border border-[#2A4A2A] text-[#8FAD8F] hover:text-[#B5F23A] hover:border-[#B5F23A] px-3 py-2 rounded-lg text-sm transition-colors">
            <Download size={14} /> Excel
          </button>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 bg-[#B5F23A] text-[#0A1F0A] font-semibold px-4 py-2 rounded-lg text-sm hover:opacity-90">
            <UserPlus size={14} /> Добавить
          </button>
        </div>
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-[#1A3A1A] border border-[#2A4A2A] rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-[#F5F5F0] mb-4">Новый клиент</h3>
            <div className="space-y-3">
              <input value={newUser.name} onChange={e => setNewUser(u => ({ ...u, name: e.target.value }))}
                placeholder="Имя *" className="w-full bg-[#0A1F0A] border border-[#2A4A2A] rounded-xl px-3 py-2.5 text-sm text-[#F5F5F0] placeholder-[#8FAD8F] focus:outline-none focus:border-[#B5F23A]" />
              <input value={newUser.phone} onChange={e => setNewUser(u => ({ ...u, phone: e.target.value }))}
                placeholder="Телефон *" className="w-full bg-[#0A1F0A] border border-[#2A4A2A] rounded-xl px-3 py-2.5 text-sm text-[#F5F5F0] placeholder-[#8FAD8F] focus:outline-none focus:border-[#B5F23A]" />
              <input value={newUser.instagram} onChange={e => setNewUser(u => ({ ...u, instagram: e.target.value }))}
                placeholder="Instagram" className="w-full bg-[#0A1F0A] border border-[#2A4A2A] rounded-xl px-3 py-2.5 text-sm text-[#F5F5F0] placeholder-[#8FAD8F] focus:outline-none focus:border-[#B5F23A]" />
              <select value={newUser.tag} onChange={e => setNewUser(u => ({ ...u, tag: e.target.value as 'FAN'|'TEAM'|'CORPORATE'|'TOURNAMENT' }))}
                className="w-full bg-[#0A1F0A] border border-[#2A4A2A] rounded-xl px-3 py-2.5 text-sm text-[#F5F5F0] focus:outline-none focus:border-[#B5F23A]">
                {TAGS.slice(1).map(t => <option key={t} value={t}>{TAG_LABELS[t]}</option>)}
              </select>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowAdd(false)} className="flex-1 border border-[#2A4A2A] text-[#8FAD8F] py-2 rounded-lg text-sm hover:text-[#F5F5F0] transition-colors">Отмена</button>
                <button onClick={addUser} className="flex-1 bg-[#B5F23A] text-[#0A1F0A] font-semibold py-2 rounded-lg text-sm hover:opacity-90">Добавить</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8FAD8F]" />
          <input value={search} onChange={e => { setSearch(e.target.value); load() }} placeholder="Поиск по имени, телефону, Instagram..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#1A3A1A] border border-[#2A4A2A] rounded-xl text-sm text-[#F5F5F0] placeholder-[#8FAD8F] focus:outline-none focus:border-[#B5F23A]" />
        </div>
        <div className="flex gap-2">
          {TAGS.map(t => (
            <button key={t} onClick={() => setTag(t)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${
                tag === t
                  ? 'bg-[#B5F23A] text-[#0A1F0A] border-[#B5F23A]'
                  : 'bg-[#1A3A1A] text-[#8FAD8F] border-[#2A4A2A] hover:border-[#B5F23A]'
              }`}>
              {t === '' ? 'Все' : TAG_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1A3A1A] border border-[#2A4A2A] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[#2A4A2A]">
              <tr className="text-xs text-[#8FAD8F]">
                <th className="px-4 py-3 text-left font-medium">Клиент</th>
                <th className="px-4 py-3 text-left font-medium">Тег</th>
                <th className="px-4 py-3 text-left font-medium">Instagram</th>
                <th className="px-4 py-3 text-left font-medium">Брони</th>
                <th className="px-4 py-3 text-left font-medium">Потрачено</th>
                <th className="px-4 py-3 text-left font-medium">Регистрация</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-[#2A4A2A]">
                    {Array(6).fill(0).map((__, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-3 bg-[#2A4A2A] rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.map(u => {
                const spent = (u.bookings || []).filter(b => b.status !== 'CANCELLED').reduce((s, b) => s + b.totalAmount, 0)
                return (
                  <tr key={u.id} className="border-b border-[#2A4A2A] hover:bg-[#2A4A2A]/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#F5F5F0]">{u.name}</div>
                      <div className="text-xs text-[#8FAD8F]">{u.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-lg font-medium ${TAG_COLORS[u.tag] || 'text-[#8FAD8F]'}`}>
                        {TAG_LABELS[u.tag]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#8FAD8F] text-xs">{u.instagram || '—'}</td>
                    <td className="px-4 py-3 text-[#F5F5F0]">{(u.bookings || []).length}</td>
                    <td className="px-4 py-3 text-[#B5F23A] font-medium">{spent > 0 ? formatMoney(spent) : '—'}</td>
                    <td className="px-4 py-3 text-[#8FAD8F] text-xs">{new Date(u.createdAt).toLocaleDateString('ru-RU')}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-[#8FAD8F]">Клиенты не найдены</div>
        )}
      </div>
    </div>
  )
}
