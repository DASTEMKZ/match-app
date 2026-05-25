'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X, Calendar, Shield } from 'lucide-react'

const navLinks = [
  { href: '/', label: 'Главная' },
  { href: '/arenas', label: 'Арены' },
  { href: '/schedule', label: 'Расписание' },
  { href: '/tournaments', label: 'Турниры' },
  { href: '/my-bookings', label: 'Мои брони' },
]

export function Navbar() {
  const path = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#0A1F0A]/95 backdrop-blur-md border-b border-[#2A4A2A]' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-['Bebas_Neue'] text-2xl tracking-widest">
            MAT<span className="text-[#B5F23A]">CH</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href}
                className={`text-sm font-medium transition-colors ${
                  path === l.href ? 'text-[#B5F23A]' : 'text-[#8FAD8F] hover:text-[#F5F5F0]'
                }`}>
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-1.5 text-xs text-[#8FAD8F] hover:text-[#B5F23A] transition-colors">
              <Shield size={14} /> Админ
            </Link>
            <Link href="/book" className="flex items-center gap-1.5 bg-[#B5F23A] text-[#0A1F0A] font-semibold text-sm px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
              <Calendar size={14} /> Забронировать
            </Link>
          </div>

          <button className="md:hidden text-[#F5F5F0]" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-[#0A1F0A] border-b border-[#2A4A2A] px-4 py-4 space-y-3">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className={`block text-sm font-medium py-2 ${
                path === l.href ? 'text-[#B5F23A]' : 'text-[#8FAD8F]'
              }`}>
              {l.label}
            </Link>
          ))}
          <Link href="/book" onClick={() => setOpen(false)}
            className="block bg-[#B5F23A] text-[#0A1F0A] font-semibold text-sm px-4 py-3 rounded-lg text-center mt-4">
            Забронировать
          </Link>
        </div>
      )}
    </nav>
  )
}
