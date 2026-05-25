import { prisma } from '../db.js'

const MENU_RU = `Привет! Я бот Match ⚽

Что хотите сделать?
1️⃣ Посмотреть свободные слоты
2️⃣ Узнать цены
3️⃣ Забронировать поле
4️⃣ Мои бронирования
5️⃣ Связаться с оператором

Напишите номер или ключевое слово.`

const MENU_KZ = `Сәлем! Мен Match боты ⚽

Не істегіңіз келеді?
1️⃣ Бос слоттарды көру
2️⃣ Бағаларды білу
3️⃣ Алаңды брондау
4️⃣ Менің брондауларым
5️⃣ Операторға хабарласу

Нөмірін немесе кілт сөзді жазыңыз.`

export async function processMessage({ channel, senderId, text, lang = 'ru' }) {
  const t = text.trim().toLowerCase()
  const menu = lang === 'kz' ? MENU_KZ : MENU_RU

  if (t === '' || t === 'старт' || t === 'start' || t === 'привет' || t === 'сәлем') {
    return menu
  }

  if (t === '1' || t.includes('слот') || t.includes('свободн') || t.includes('расписание') || t.includes('hочь')) {
    const arenas = await prisma.arena.findMany({ where: { isActive: true }, take: 5 })
    const today = new Date().toISOString().slice(0, 10)
    const slots = await prisma.timeSlot.findMany({
      where: { date: today, status: 'FREE' },
      include: { arena: { select: { name: true } } },
      take: 10
    })
    if (slots.length === 0) return `На сегодня (${today}) свободных слотов нет.\n\nЧтобы посмотреть другой день — перейдите на сайт: https://match.kz`
    const list = slots.map(s => `• ${s.arena.name} — ${s.hour}:00–${s.hour + 1}:00`).join('\n')
    return `Свободные слоты на сегодня:\n\n${list}\n\nДля брони перейдите на сайт: https://match.kz`
  }

  if (t === '2' || t.includes('цен') || t.includes('прайс') || t.includes('стоимост') || t.includes('сколько')) {
    const arenas = await prisma.arena.findMany({ where: { isActive: true } })
    if (arenas.length === 0) return `Цены уточняйте на сайте: https://match.kz`
    const list = arenas.map(a => `• ${a.name}: ${a.pricePerHour.toLocaleString('ru')} ₸/час`).join('\n')
    return `💰 Цены на поля:\n\n${list}\n\nКорпоративным клиентам — скидка 15%\nАбонемент — скидка 10%`
  }

  if (t === '3' || t.includes('забронир') || t.includes('аренда') || t.includes('хочу') || t.includes('поле')) {
    return `Для бронирования перейдите на сайт:\n\n🌐 https://match.kz\n\nИли позвоните: +7 (777) 123-45-67\nРаботаем с 8:00 до 23:00`
  }

  if (t === '4' || t.includes('мои бронир') || t.includes('история')) {
    return `Ваши бронирования можно посмотреть в личном кабинете:\n\n🌐 https://match.kz/my-bookings\n\nВойдите через номер телефона.`
  }

  if (t === '5' || t.includes('оператор') || t.includes('помощ') || t.includes('вопрос')) {
    return `Соединяю с оператором...\n\nПока ожидаете, можете позвонить:\n📞 +7 (777) 123-45-67\n\nОтветим в течение 5 минут.`
  }

  if (t.includes('адрес') || t.includes('где') || t.includes('карта')) {
    return `📍 Адрес: ул. Спортивная, 10, Алматы\n\nКарта: https://2gis.kz/almaty/search/match\n\nРежим работы: 08:00 – 23:00 ежедневно`
  }

  return `Не понял вопрос 🤔\n\n${menu}`
}
