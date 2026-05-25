import { prisma } from '../db.js'

export async function analyticsRoutes(app) {
  app.get('/dashboard', async (req) => {
    const { from, to } = req.query
    const dateFilter = {}
    if (from) dateFilter.gte = from
    if (to) dateFilter.lte = to

    const where = Object.keys(dateFilter).length ? { date: dateFilter } : {}

    const [bookings, allArenas] = await Promise.all([
      prisma.booking.findMany({
        where: { ...where, status: { not: 'CANCELLED' } },
        include: { arena: { select: { name: true } } }
      }),
      prisma.arena.findMany({ where: { isActive: true } })
    ])

    const revenue = bookings.reduce((s, b) => s + b.totalAmount, 0)
    const prepaid = bookings.filter(b => b.status === 'PAID').reduce((s, b) => s + b.prepayAmount, 0)

    // Revenue by day
    const byDay = {}
    bookings.forEach(b => {
      byDay[b.date] = (byDay[b.date] || 0) + b.totalAmount
    })

    // By client type
    const byType = { PRIVATE: 0, CORPORATE: 0, SUBSCRIPTION: 0 }
    bookings.forEach(b => { byType[b.clientType] = (byType[b.clientType] || 0) + 1 })

    // Arena load
    const arenaLoad = allArenas.map(a => {
      const ab = bookings.filter(b => b.arenaId === a.id)
      const hours = ab.reduce((s, b) => s + b.duration, 0)
      const workingHours = 14 // 8:00 - 22:00
      const days = Object.keys(byDay).length || 1
      const load = Math.min(100, Math.round((hours / (workingHours * days)) * 100))
      return { arenaId: a.id, name: a.name, hours, load }
    })

    // Peak hours
    const peakHours = {}
    bookings.forEach(b => {
      for (let h = b.startHour; h < b.startHour + b.duration; h++) {
        peakHours[h] = (peakHours[h] || 0) + 1
      }
    })

    // Top weekdays
    const weekdays = {}
    bookings.forEach(b => {
      const day = new Date(b.date).getDay()
      weekdays[day] = (weekdays[day] || 0) + 1
    })

    return {
      revenue,
      prepaid,
      totalBookings: bookings.length,
      byDay: Object.entries(byDay).map(([date, amount]) => ({ date, amount })).sort((a, b) => a.date.localeCompare(b.date)),
      byType,
      arenaLoad,
      peakHours: Object.entries(peakHours).map(([hour, count]) => ({ hour: parseInt(hour), count })).sort((a, b) => b.count - a.count),
      topWeekdays: Object.entries(weekdays).map(([day, count]) => ({ day: parseInt(day), count }))
    }
  })

  app.get('/export-1c', async (req) => {
    const { from, to } = req.query
    const bookings = await prisma.booking.findMany({
      where: {
        status: { not: 'CANCELLED' },
        ...(from && { date: { gte: from } }),
        ...(to && { date: { lte: to } })
      },
      include: { arena: { select: { name: true } } }
    })

    // 1C XML format
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<КоммерческаяИнформация ВерсияФормата="2.99" ДатаФормирования="${new Date().toISOString()}">
${bookings.map(b => `  <Документ>
    <Ид>${b.id}</Ид>
    <Номер>${b.id.slice(-8).toUpperCase()}</Номер>
    <Дата>${b.date}</Дата>
    <Контрагент>${b.clientName}</Контрагент>
    <Телефон>${b.clientPhone}</Телефон>
    <Арена>${b.arena.name}</Арена>
    <Сумма>${b.totalAmount}</Сумма>
    <Предоплата>${b.prepayAmount}</Предоплата>
    <Статус>${b.status}</Статус>
  </Документ>`).join('\n')}
</КоммерческаяИнформация>`

    req.raw.res.setHeader('Content-Type', 'application/xml')
    req.raw.res.setHeader('Content-Disposition', `attachment; filename=match-1c-${from || 'all'}.xml`)
    return xml
  })
}
