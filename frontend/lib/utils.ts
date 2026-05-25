export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ')
}

export function formatMoney(amount: number) {
  return amount.toLocaleString('ru-RU') + ' ₸'
}

export function formatHour(h: number) {
  return `${h.toString().padStart(2, '0')}:00`
}

export function today() {
  return new Date().toISOString().slice(0, 10)
}

export function addDays(date: string, n: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

export const WEEKDAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

export const TAG_LABELS: Record<string, string> = {
  FAN: 'Болельщик', TEAM: 'Команда', CORPORATE: 'Корпоративный', TOURNAMENT: 'Организатор'
}

export const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Ожидание', CONFIRMED: 'Подтверждён', PAID: 'Оплачен',
  CANCELLED: 'Отменён', COMPLETED: 'Завершён'
}

export const STATUS_COLORS: Record<string, string> = {
  PENDING: 'text-yellow-400 bg-yellow-400/10',
  CONFIRMED: 'text-blue-400 bg-blue-400/10',
  PAID: 'text-lime-400 bg-lime-400/10',
  CANCELLED: 'text-red-400 bg-red-400/10',
  COMPLETED: 'text-gray-400 bg-gray-400/10',
}

export const CLIENT_TYPE_LABELS: Record<string, string> = {
  PRIVATE: 'Частный', CORPORATE: 'Корпоративный', SUBSCRIPTION: 'Абонемент'
}
