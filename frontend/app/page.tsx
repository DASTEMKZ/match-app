import Link from 'next/link'
import { ArrowRight, Zap, Clock, Shield, BarChart3 } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(181,242,58,0.07) 0%, transparent 70%)' }} />

        <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm mb-8" style={{ background: 'rgba(181,242,58,0.1)', border: '1px solid rgba(181,242,58,0.3)', color: '#B5F23A' }}>
          ⚽ match.kz · Версия 1.1
        </div>

        <h1 className="font-['Bebas_Neue'] leading-none tracking-widest mb-4" style={{ fontSize: 'clamp(72px,12vw,140px)' }}>
          MAT<span style={{ color: '#B5F23A' }}>CH</span>
        </h1>

        <p className="text-[#8FAD8F] max-w-lg mb-4" style={{ fontSize: 'clamp(16px,2.5vw,22px)' }}>
          Твоё поле. Твой матч.
        </p>
        <p className="text-[#8FAD8F] max-w-md mb-10 text-sm opacity-70">
          Онлайн-платформа аренды футбольных полей в Алматы. Бронируйте за 2 минуты, платите через Kaspi Pay.
        </p>

        <div className="flex flex-wrap gap-4 justify-center mb-16">
          <Link href="/schedule" className="flex items-center gap-2 font-bold px-8 py-4 rounded-xl text-base" style={{ background: '#B5F23A', color: '#0A1F0A' }}>
            Смотреть расписание <ArrowRight size={18} />
          </Link>
          <Link href="/arenas" className="flex items-center gap-2 px-8 py-4 rounded-xl text-base border text-[#F5F5F0]" style={{ borderColor: '#2A4A2A' }}>
            Все арены
          </Link>
        </div>

        <div className="flex gap-12 flex-wrap justify-center">
          {[
            { value: '80%', label: 'броней онлайн' },
            { value: '2 мин', label: 'время брони' },
            { value: '24/7', label: 'без оператора' },
            { value: '−60%', label: 'нагрузка на админа' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="font-['Bebas_Neue'] text-5xl leading-none" style={{ color: '#B5F23A' }}>{s.value}</div>
              <div className="text-xs mt-1" style={{ color: '#8FAD8F' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#B5F23A' }}>Платформа</div>
        <h2 className="font-['Bebas_Neue'] text-5xl sm:text-6xl tracking-wide mb-4">Всё в одном месте</h2>
        <p className="max-w-lg mb-12 text-[#8FAD8F]">Каталог арен, онлайн-расписание, бронирование с Kaspi Pay, CRM, аналитика и чат-боты.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Zap, title: 'Real-time расписание', desc: 'Сетка слотов обновляется мгновенно через WebSocket. Видите доступность прямо сейчас.', href: '/schedule' },
            { icon: Clock, title: 'Бронь за 2 минуты', desc: 'Выберите поле, время, оплатите предоплату через Kaspi Pay — и готово.', href: '/book' },
            { icon: Shield, title: 'CRM и договора', desc: 'База клиентов с историей, тегами, автогенерацией PDF-договора для корп. клиентов.', href: '/admin/clients' },
            { icon: BarChart3, title: 'Аналитика', desc: 'Дашборд выручки, загруженности, экспорт в Excel и выгрузка в 1C.', href: '/admin/analytics' },
          ].map(f => (
            <Link key={f.title} href={f.href} className="group rounded-2xl p-6 transition-colors" style={{ background: '#1A3A1A', border: '1px solid #2A4A2A' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(181,242,58,0.1)' }}>
                <f.icon size={20} style={{ color: '#B5F23A' }} />
              </div>
              <h3 className="font-semibold text-[#F5F5F0] mb-2">{f.title}</h3>
              <p className="text-sm text-[#8FAD8F]">{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="rounded-3xl p-12 text-center" style={{ background: '#1A3A1A', border: '1px solid #2A4A2A' }}>
          <h2 className="font-['Bebas_Neue'] text-5xl tracking-wide mb-4">Готовы к игре?</h2>
          <p className="text-[#8FAD8F] mb-8">Выберите арену и забронируйте прямо сейчас</p>
          <Link href="/book" className="inline-flex items-center gap-2 font-bold px-10 py-4 rounded-xl text-lg" style={{ background: '#B5F23A', color: '#0A1F0A' }}>
            Забронировать поле <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  )
}
