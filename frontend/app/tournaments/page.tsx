'use client'
import { useEffect, useState } from 'react'
import { Trophy, Users, Plus, Calendar } from 'lucide-react'
import { api, Tournament } from '@/lib/api'
import { formatDate } from '@/lib/utils'

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [showReg, setShowReg] = useState<string | null>(null)
  const [regForm, setRegForm] = useState({ teamName: '', phone: '' })

  useEffect(() => {
    api.tournaments().then(setTournaments).finally(() => setLoading(false))
  }, [])

  async function register(id: string) {
    if (!regForm.teamName || !regForm.phone) return
    await api.registerTournament(id, regForm.teamName, regForm.phone)
    const updated = await api.tournaments()
    setTournaments(updated)
    setShowReg(null)
    setRegForm({ teamName: '', phone: '' })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <div className="text-xs font-semibold tracking-widest uppercase text-[#B5F23A] mb-2">Соревнования</div>
        <h1 className="font-['Bebas_Neue'] text-5xl sm:text-6xl tracking-wide mb-4">Турниры</h1>
        <p className="text-[#8FAD8F]">Регистрируйте команду на ближайшие турниры</p>
      </div>

      {showReg && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowReg(null)}>
          <div className="bg-[#1A3A1A] border border-[#2A4A2A] rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-[#F5F5F0] mb-4">Регистрация команды</h3>
            <div className="space-y-3">
              <input value={regForm.teamName} onChange={e => setRegForm(f => ({ ...f, teamName: e.target.value }))}
                placeholder="Название команды *"
                className="w-full bg-[#0A1F0A] border border-[#2A4A2A] rounded-xl px-3 py-2.5 text-sm text-[#F5F5F0] placeholder-[#8FAD8F] focus:outline-none focus:border-[#B5F23A]" />
              <input value={regForm.phone} onChange={e => setRegForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="Телефон капитана *"
                className="w-full bg-[#0A1F0A] border border-[#2A4A2A] rounded-xl px-3 py-2.5 text-sm text-[#F5F5F0] placeholder-[#8FAD8F] focus:outline-none focus:border-[#B5F23A]" />
              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowReg(null)} className="flex-1 border border-[#2A4A2A] text-[#8FAD8F] py-2 rounded-lg text-sm">Отмена</button>
                <button onClick={() => register(showReg)} className="flex-1 bg-[#B5F23A] text-[#0A1F0A] font-semibold py-2 rounded-lg text-sm">Зарегистрироваться</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(3).fill(0).map((_, i) => <div key={i} className="h-48 bg-[#1A3A1A] border border-[#2A4A2A] rounded-2xl animate-pulse" />)}
        </div>
      ) : tournaments.length === 0 ? (
        <div className="text-center py-24">
          <Trophy size={48} className="mx-auto mb-4 text-[#B5F23A] opacity-40" />
          <p className="text-[#8FAD8F]">Турниров пока нет</p>
          <p className="text-xs text-[#8FAD8F] mt-2">Следите за обновлениями</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tournaments.map(t => {
            const teams = Array.isArray(t.teams) ? t.teams : []
            const isFull = teams.length >= t.maxTeams
            return (
              <div key={t.id} className="bg-[#1A3A1A] border border-[#2A4A2A] rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-[#B5F23A]/10 rounded-xl flex items-center justify-center">
                    <Trophy size={20} className="text-[#B5F23A]" />
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-lg font-medium ${isFull ? 'bg-red-500/10 text-red-400' : 'bg-[#B5F23A]/10 text-[#B5F23A]'}`}>
                    {isFull ? 'Заполнен' : 'Открыт'}
                  </span>
                </div>
                <h3 className="font-semibold text-[#F5F5F0] mb-1">{t.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-[#8FAD8F] mb-1">
                  <Calendar size={12} /> {t.date}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#8FAD8F] mb-4">
                  <Users size={12} /> {teams.length} / {t.maxTeams} команд
                </div>
                <div className="bg-[#0A1F0A] rounded-full h-1.5 overflow-hidden mb-4">
                  <div className="h-full bg-[#B5F23A] rounded-full" style={{ width: `${(teams.length / t.maxTeams) * 100}%` }} />
                </div>
                {teams.length > 0 && (
                  <div className="space-y-1 mb-4">
                    {teams.slice(0, 3).map((team, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#8FAD8F]">
                        <span className="w-4 h-4 rounded-full bg-[#2A4A2A] flex items-center justify-center text-[10px]">{i + 1}</span>
                        {team.teamName}
                      </div>
                    ))}
                    {teams.length > 3 && <p className="text-xs text-[#8FAD8F]">+{teams.length - 3} ещё</p>}
                  </div>
                )}
                <button
                  onClick={() => setShowReg(t.id)}
                  disabled={isFull}
                  className="w-full bg-[#B5F23A] text-[#0A1F0A] font-semibold py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity">
                  {isFull ? 'Мест нет' : 'Зарегистрироваться'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
