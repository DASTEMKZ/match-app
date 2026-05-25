const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

async function req<T>(path: string, opts?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('match_token') : null
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...opts,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

export const api = {
  // Auth
  sendOtp: (phone: string) => req('/api/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone }) }),
  verifyOtp: (phone: string, otp: string, name?: string) =>
    req<{ token: string; user: User }>('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phone, otp, name }) }),
  me: () => req<User>('/api/auth/me'),

  // Arenas
  arenas: (params?: Record<string, string>) =>
    req<Arena[]>(`/api/arenas${params ? '?' + new URLSearchParams(params) : ''}`),
  arena: (id: string) => req<Arena>(`/api/arenas/${id}`),
  arenaSchedule: (id: string, date: string) => req<TimeSlot[]>(`/api/arenas/${id}/schedule?date=${date}`),
  createArena: (data: Partial<Arena>) => req<Arena>('/api/arenas', { method: 'POST', body: JSON.stringify(data) }),
  updateArena: (id: string, data: Partial<Arena>) => req<Arena>(`/api/arenas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Bookings
  bookings: (params?: Record<string, string>) =>
    req<Booking[]>(`/api/bookings${params ? '?' + new URLSearchParams(params) : ''}`),
  booking: (id: string) => req<Booking>(`/api/bookings/${id}`),
  createBooking: (data: CreateBookingData) =>
    req<Booking & { kaspiLink: string }>('/api/bookings', { method: 'POST', body: JSON.stringify(data) }),
  updateBookingStatus: (id: string, status: string) =>
    req<Booking>(`/api/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Users / CRM
  users: (params?: Record<string, string>) =>
    req<User[]>(`/api/users${params ? '?' + new URLSearchParams(params) : ''}`),
  user: (id: string) => req<User>(`/api/users/${id}`),
  createUser: (data: Partial<User>) => req<User>('/api/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: string, data: Partial<User>) => req<User>(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  userStats: (id: string) => req<UserStats>(`/api/users/${id}/stats`),

  // Analytics
  dashboard: (params?: Record<string, string>) =>
    req<DashboardData>(`/api/analytics/dashboard${params ? '?' + new URLSearchParams(params) : ''}`),

  // Subscriptions
  subscriptions: () => req<Subscription[]>('/api/subscriptions'),
  createSubscription: (data: Partial<Subscription>) =>
    req<Subscription>('/api/subscriptions', { method: 'POST', body: JSON.stringify(data) }),

  // Tournaments
  tournaments: () => req<Tournament[]>('/api/tournaments'),
  tournament: (id: string) => req<Tournament>(`/api/tournaments/${id}`),
  createTournament: (data: Partial<Tournament>) =>
    req<Tournament>('/api/tournaments', { method: 'POST', body: JSON.stringify(data) }),
  registerTournament: (id: string, teamName: string, phone: string) =>
    req<Tournament>(`/api/tournaments/${id}/register`, { method: 'POST', body: JSON.stringify({ teamName, phone }) }),

  // Chat bot
  chat: (senderId: string, text: string, lang?: string) =>
    req<{ response: string }>('/api/bots/chat', { method: 'POST', body: JSON.stringify({ senderId, text, lang }) }),

  // Exports
  exportFinance: (from?: string, to?: string) => {
    const params = new URLSearchParams()
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    window.open(`${BASE}/api/export/finance?${params}`)
  },
  exportClients: () => window.open(`${BASE}/api/export/clients`),
  export1C: (from?: string, to?: string) => {
    const params = new URLSearchParams()
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    window.open(`${BASE}/api/analytics/export-1c?${params}`)
  },
}

// Types
export interface User {
  id: string; phone: string; name: string; role: 'GUEST'|'CLIENT'|'ADMIN'|'OWNER'
  tag: 'FAN'|'TEAM'|'CORPORATE'|'TOURNAMENT'; instagram?: string; createdAt: string
  bookings?: Booking[]
}

export interface Arena {
  id: string; name: string; description?: string; size: string; surface: string
  lighting: boolean; capacity: number; pricePerHour: number; photos: string; isActive: boolean
}

export interface TimeSlot {
  id: string; arenaId: string; date: string; hour: number
  status: 'FREE'|'BOOKED'|'MINE'|'SOON_FREE'
  booking?: { clientName: string; clientType: string; status: string }
}

export interface Booking {
  id: string; arenaId: string; userId?: string; clientName: string; clientPhone: string
  clientInsta?: string; clientType: 'PRIVATE'|'CORPORATE'|'SUBSCRIPTION'
  date: string; startHour: number; duration: number; totalAmount: number; prepayAmount: number
  discount: number; status: 'PENDING'|'CONFIRMED'|'PAID'|'CANCELLED'|'COMPLETED'
  paymentRef?: string; notes?: string; contractUrl?: string; createdAt: string
  arena?: { name: string }
}

export interface CreateBookingData {
  arenaId: string; clientName: string; clientPhone: string; clientInsta?: string
  clientType: string; date: string; startHour: number; duration: number
  userId?: string; notes?: string; promoCode?: string
}

export interface Subscription {
  id: string; userId: string; arenaId?: string; type: string
  totalSessions: number; usedSessions: number; discount: number; expiresAt: string
  user?: User
}

export interface Tournament {
  id: string; name: string; date: string; arenas: string
  maxTeams: number; teams: TournamentTeam[]; status: string
}

export interface TournamentTeam { teamName: string; phone: string; registeredAt: string }

export interface UserStats { totalBookings: number; totalSpent: number; completed: number }

export interface DashboardData {
  revenue: number; prepaid: number; totalBookings: number
  byDay: { date: string; amount: number }[]
  byType: { PRIVATE: number; CORPORATE: number; SUBSCRIPTION: number }
  arenaLoad: { arenaId: string; name: string; hours: number; load: number }[]
  peakHours: { hour: number; count: number }[]
  topWeekdays: { day: number; count: number }[]
}
