import { prisma } from '../db.js'

export async function sendNotification({ phone, channel, bookingId, type }) {
  const booking = bookingId
    ? await prisma.booking.findUnique({ where: { id: bookingId }, include: { arena: { select: { name: true } } } })
    : null

  let message = ''
  if (type === 'confirmation' && booking) {
    message = `✅ Бронирование подтверждено!\n\n📍 ${booking.arena.name}\n📅 ${booking.date} в ${booking.startHour}:00\n⏱ ${booking.duration} ч.\n💰 ${booking.totalAmount.toLocaleString('ru')} ₸\n🔑 Код: ${booking.id.slice(-6).toUpperCase()}`
  } else if (type === 'reminder' && booking) {
    message = `⏰ Напоминание!\n\nЧерез 2 часа ваша игра:\n📍 ${booking.arena.name}\n📅 ${booking.date} в ${booking.startHour}:00`
  } else if (type === 'cancellation' && booking) {
    message = `❌ Бронирование отменено\n\n📍 ${booking.arena.name}\n📅 ${booking.date}`
  }

  const notification = await prisma.notification.create({
    data: { phone, channel, message, status: 'pending' }
  })

  // Send via WhatsApp if configured
  if (channel === 'whatsapp' && process.env.WHATSAPP_TOKEN && message) {
    try {
      const url = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone.replace(/\D/g, ''),
          type: 'text',
          text: { body: message }
        })
      })
      if (res.ok) {
        await prisma.notification.update({ where: { id: notification.id }, data: { status: 'sent', sentAt: new Date() } })
      }
    } catch (e) {
      console.error('WhatsApp send error:', e)
    }
  }

  return notification
}

// Cron-like: send reminders 2h before
export async function sendReminders() {
  const now = new Date()
  const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000)
  const date = in2h.toISOString().slice(0, 10)
  const hour = in2h.getHours()

  const bookings = await prisma.booking.findMany({
    where: { date, startHour: hour, status: { in: ['CONFIRMED', 'PAID'] } }
  })

  for (const b of bookings) {
    await sendNotification({ phone: b.clientPhone, channel: 'whatsapp', bookingId: b.id, type: 'reminder' })
  }
}
