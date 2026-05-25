'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MapPin, Users, Zap, Filter, Search, Calendar } from 'lucide-react'
import { api, Arena } from '@/lib/api'
import { formatMoney } from '@/lib/utils'

const SURFACES = ['Все', 'Искусственная трава', 'Натуральная трава', 'Паркет']

export default function ArenasPage() {
  const [arenas, setArenas] = useState<Arena[]>([])
  const [filtered, setFiltered] = useState<Arena[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [surface, setSurface] = useState('Все')

  useEffect(() => {
    api.arenas().then(data => { setArenas(data); setFiltered(data) }).catch(console.error).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let res = arenas
    if (search) res = res.filter(a => a.name.toLowerCase().includes(search.toLowerCase()))
    if (surface !== 'Все') res = res.filter(a => a.surface.includes(surface.split(' ')[0]))
    setFiltered(res)
  }, [search, surface, arenas])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <div className="text-xs font-semibold tracking-widest uppercase text-[#B5F23A] mb-2">Каталог</div>
        <h1 className="font-['Bebas_Neue'] text-5xl sm:text-6xl tracking-wide mb-4">Наши арены</h1>
        <p className="text-[#8FAD8F]">{arenas.length} поля доступно для бронирования в Алматы</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8FAD8F]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск арены..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#1A3A1A] border border-[#2A4A2A] rounded-xl text-sm text-[#F5F5F0] placeholder-[#8FAD8F] focus:outline-none focus:border-[#B5F23A]"
          />
        </div>
        <div className="flex gap-2">
          {SURFACES.map(s => (
            <button key={s} onClick={() => setSurface(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${
                surface === s
                  ? 'bg-[#B5F23A] text-[#0A1F0A] border-[#B5F23A]'
                  : 'bg-[#1A3A1A] text-[#8FAD8F] border-[#2A4A2A] hover:border-[#B5F23A] hover:text-[#B5F23A]'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-[#1A3A1A] border border-[#2A4A2A] rounded-2xl overflow-hidden animate-pulse">
              <div className="h-48 bg-[#2A4A2A]" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-[#2A4A2A] rounded w-3/4" />
                <div className="h-3 bg-[#2A4A2A] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-[#8FAD8F]">
          <Filter size={40} className="mx-auto mb-4 opacity-40" />
          <p>Арены не найдены</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(arena => {
            const photos = JSON.parse(arena.photos || '[]')
            return (
              <div key={arena.id} className="bg-[#1A3A1A] border border-[#2A4A2A] rounded-2xl overflow-hidden hover:border-[#B5F23A]/40 transition-colors group">
                <div className="relative h-48 bg-[#2A4A2A] overflow-hidden">
                  {photos[0] ? (
                    <img src={photos[0]} alt={arena.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">⚽</div>
                  )}
                  <div className="absolute top-3 right-3 bg-[#B5F23A] text-[#0A1F0A] text-xs font-bold px-2 py-1 rounded-lg">
                    Свободно
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-[#F5F5F0] mb-1">{arena.name}</h3>
                  <p className="text-xs text-[#8FAD8F] mb-3 line-clamp-2">{arena.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="flex items-center gap-1 text-xs text-[#8FAD8F]">
                      <MapPin size={11} /> {arena.size}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#8FAD8F]">
                      <Users size={11} /> {arena.capacity} чел.
                    </span>
                    {arena.lighting && (
                      <span className="flex items-center gap-1 text-xs text-[#B5F23A]">
                        <Zap size={11} /> Освещение
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-[#8FAD8F] mb-1">{arena.surface}</div>
                  <div className="font-['Bebas_Neue'] text-2xl text-[#B5F23A] mb-4">
                    {formatMoney(arena.pricePerHour)}<span className="text-sm text-[#8FAD8F] font-['DM_Sans']">/час</span>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/arenas/${arena.id}`}
                      className="flex-1 text-center text-xs border border-[#2A4A2A] text-[#8FAD8F] hover:border-[#B5F23A] hover:text-[#B5F23A] py-2 rounded-lg transition-colors">
                      Подробнее
                    </Link>
                    <Link href={`/book?arenaId=${arena.id}`}
                      className="flex-1 flex items-center justify-center gap-1 text-xs bg-[#B5F23A] text-[#0A1F0A] font-semibold py-2 rounded-lg hover:opacity-90">
                      <Calendar size={12} /> Забронировать
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
