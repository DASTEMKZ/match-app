import { prisma } from '../db.js'
import ExcelJS from 'exceljs'

export async function exportRoutes(app) {
  // Financial Excel report
  app.get('/finance', async (req, reply) => {
    const { from, to } = req.query
    const bookings = await prisma.booking.findMany({
      where: {
        status: { not: 'CANCELLED' },
        ...(from && { date: { gte: from } }),
        ...(to && { date: { lte: to } })
      },
      include: { arena: { select: { name: true } } },
      orderBy: { date: 'asc' }
    })

    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet('Финансовый отчёт Match')

    ws.columns = [
      { header: 'Дата', key: 'date', width: 14 },
      { header: 'Клиент', key: 'client', width: 24 },
      { header: 'Телефон', key: 'phone', width: 16 },
      { header: 'Арена', key: 'arena', width: 18 },
      { header: 'Тип', key: 'type', width: 14 },
      { header: 'Часов', key: 'hours', width: 8 },
      { header: 'Скидка %', key: 'discount', width: 10 },
      { header: 'Сумма (₸)', key: 'total', width: 14 },
      { header: 'Предоплата (₸)', key: 'prepay', width: 16 },
      { header: 'Статус', key: 'status', width: 12 },
    ]

    // Header style
    ws.getRow(1).font = { bold: true, color: { argb: 'FF0A1F0A' } }
    ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB5F23A' } }

    const typeMap = { PRIVATE: 'Частный', CORPORATE: 'Корпоративный', SUBSCRIPTION: 'Абонемент' }
    const statusMap = { PENDING: 'Ожидание', CONFIRMED: 'Подтверждён', PAID: 'Оплачен', CANCELLED: 'Отменён', COMPLETED: 'Завершён' }

    bookings.forEach(b => {
      ws.addRow({
        date: b.date,
        client: b.clientName,
        phone: b.clientPhone,
        arena: b.arena.name,
        type: typeMap[b.clientType] || b.clientType,
        hours: b.duration,
        discount: b.discount,
        total: b.totalAmount,
        prepay: b.prepayAmount,
        status: statusMap[b.status] || b.status
      })
    })

    // Totals
    const totalRow = ws.addRow({
      date: 'ИТОГО',
      total: bookings.reduce((s, b) => s + b.totalAmount, 0),
      prepay: bookings.reduce((s, b) => s + b.prepayAmount, 0),
      hours: bookings.reduce((s, b) => s + b.duration, 0)
    })
    totalRow.font = { bold: true }

    const buf = await wb.xlsx.writeBuffer()
    reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    reply.header('Content-Disposition', `attachment; filename=match-finance-${from || 'all'}.xlsx`)
    return reply.send(buf)
  })

  // CRM clients Excel
  app.get('/clients', async (req, reply) => {
    const users = await prisma.user.findMany({
      include: { bookings: { select: { totalAmount: true, status: true } } },
      orderBy: { createdAt: 'desc' }
    })

    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet('Клиенты Match')

    ws.columns = [
      { header: 'Имя', key: 'name', width: 24 },
      { header: 'Телефон', key: 'phone', width: 16 },
      { header: 'Тег', key: 'tag', width: 16 },
      { header: 'Instagram', key: 'insta', width: 20 },
      { header: 'Всего броней', key: 'bookings', width: 14 },
      { header: 'Потрачено (₸)', key: 'spent', width: 16 },
      { header: 'Дата регистрации', key: 'date', width: 20 },
    ]

    ws.getRow(1).font = { bold: true, color: { argb: 'FF0A1F0A' } }
    ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB5F23A' } }

    const tagMap = { FAN: 'Болельщик', TEAM: 'Команда', CORPORATE: 'Корпоративный', TOURNAMENT: 'Организатор' }
    users.forEach(u => {
      const spent = u.bookings.filter(b => b.status !== 'CANCELLED').reduce((s, b) => s + b.totalAmount, 0)
      ws.addRow({
        name: u.name, phone: u.phone,
        tag: tagMap[u.tag] || u.tag,
        insta: u.instagram || '',
        bookings: u.bookings.length,
        spent,
        date: new Date(u.createdAt).toLocaleDateString('ru-RU')
      })
    })

    const buf = await wb.xlsx.writeBuffer()
    reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    reply.header('Content-Disposition', 'attachment; filename=match-clients.xlsx')
    return reply.send(buf)
  })
}
