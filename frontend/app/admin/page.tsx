import Link from 'next/link'
import { Users, Calendar, BarChart3, MessageSquare, Settings, Trophy, FileSpreadsheet, Bot } from 'lucide-react'

const sections = [
  { href: '/admin/bookings', icon: Calendar, label: 'Бронирования', desc: 'Управление всеми бронями' },
  { href: '/admin/clients', icon: Users, label: 'CRM — Клиенты', desc: 'База клиентов, теги, история' },
  { href: '/admin/analytics', icon: BarChart3, label: 'Аналитика', desc: 'Выручка, загруженность, отчёты' },
  { href: '/admin/bots', icon: Bot, label: 'Чат-боты', desc: 'Сообщения WhatsApp, Instagram, сайт' },
  { href: '/tournaments', icon: Trophy, label: 'Турниры', desc: 'Управление турнирными слотами' },
  { href: '/admin/settings', icon: Settings, label: 'Настройки', desc: 'Арены, цены, промокоды' },
]

export default function AdminPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <div className="text-xs font-semibold tracking-widest uppercase text-[#B5F23A] mb-2">Управление</div>
        <h1 className="font-['Bebas_Neue'] text-5xl sm:text-6xl tracking-wide mb-2">Панель администратора</h1>
        <p className="text-[#8FAD8F]">Match Admin · match.kz</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map(s => (
          <Link key={s.href} href={s.href}
            className="group bg-[#1A3A1A] border border-[#2A4A2A] rounded-2xl p-6 hover:border-[#B5F23A]/40 transition-colors">
            <div className="w-12 h-12 bg-[#B5F23A]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#B5F23A]/20 transition-colors">
              <s.icon size={24} className="text-[#B5F23A]" />
            </div>
            <h3 className="font-semibold text-[#F5F5F0] mb-1">{s.label}</h3>
            <p className="text-sm text-[#8FAD8F]">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
