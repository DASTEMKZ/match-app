import { prisma } from '../db.js'
import { broadcast } from '../ws.js'
import { generateContract } from '../services/contract.js'
import { sendNotification } from '../services/notifications.js'

const DISCOUNTS = { PRIVATE: 0, CORPORATE: 15, SUBSCRIPTION: 10 }

export async function bookingRoutes(app) {
  app.get('/', async (req) => {
    const { status, date, arenaId, phone } = req.query
    const where = {}
    if (status) where.status = status
    if (date) where.date = date
    if (arenaId) where.arenaId = arenaId
    if (phone) where.clientPhone = phone
    return prisma.booking.findMany({
      where,
      include: { arena: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    })
  })

  app.get('/:id', async (req, reply) => {
    const b = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { arena: true, user: true }
    })
    if (!b) return reply.status(404).send({ error: 'Not found' })
    return b
  })

  app.post('/', async (req, reply) => {
    const { arenaId, clientName, clientPhone, clientInsta, clientType,
            date, startHour, duration, userId, notes, promoCode } = req.body

    if (!arenaId || !clientName || !clientPhone || !date || !startHour || !duration) {
      return reply.status(400).send({ error: 'Missing required fields' })
    }

    const arena = await prisma.arena.findUnique({ where: { id: arenaId } })
    if (!arena) return reply.status(404).send({ error: 'Arena not found' })

    // Check slot availability
    const hours = Array.from({ length: duration }, (_, i) => startHour + i)
    const conflicts = await prisma.timeSlot.findMany({
      where: { arenaId, date, hour: { in: hours }, status: { not: 'FREE' } }
    })
    if (conflicts.length > 0) {
      return reply.status(409).send({ error: 'Some slots already booked' })
    }

    // Calculate price
    const discount = DISCOUNTS[clientType] || 0
    let totalAmount = arena.pricePerHour * duration
    if (promoCode) {
      const promo = await prisma.promoCode.findFirst({
        where: { code: promoCode, isActive: true, usedCount: { lt: prisma.promoCode.fields.usageLimit } }
      })
      if (promo) {
        totalAmount = Math.round(totalAmount * (1 - promo.discount / 100))
        await prisma.promoCode.update({ where: { id: promo.id }, data: { usedCount: { increment: 1 } } })
      }
    } else {
      totalAmount = Math.round(totalAmount * (1 - discount / 100))
    }
    const prepayAmount = Math.round(totalAmount * 0.5)

    const booking = await prisma.booking.create({
      data: {
        arenaId, clientName, clientPhone, clientInsta,
        clientType: clientType || 'PRIVATE',
        date, startHour, duration, userId,
        totalAmount, prepayAmount, discount, notes,
        status: 'PENDING'
      }
    })

    // Reserve slots
    await prisma.timeSlot.createMany({
      data: hours.map(h => ({ arenaId, date, hour: h, status: 'BOOKED', bookingId: booking.id })),
      skipDuplicates: true
    })
    // Update existing free slots
    await prisma.timeSlot.updateMany({
      where: { arenaId, date, hour: { in: hours } },
      data: { status: 'BOOKED', bookingId: booking.id }
    })

    // Update/link user
    if (userId) {
      await prisma.user.update({ where: { id: userId }, data: { tag: clientType === 'CORPORATE' ? 'CORPORATE' : 'FAN' } })
    }

    // Generate contract for corporate
    if (clientType === 'CORPORATE') {
      const url = await generateContract(booking, arena)
      await prisma.booking.update({ where: { id: booking.id }, data: { contractUrl: url } })
    }

    // Send confirmation
    await sendNotification({ phone: clientPhone, channel: 'whatsapp', bookingId: booking.id, type: 'confirmation' })

    broadcast('booking_created', { ...booking, arenaName: arena.name })
    return { ...booking, totalAmount, prepayAmount, kaspiLink: generateKaspiLink(prepayAmount, booking.id) }
  })

  app.patch('/:id/status', async (req, reply) => {
    const { status } = req.body
    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status }
    })

    if (status === 'CANCELLED') {
      await prisma.timeSlot.updateMany({
        where: { bookingId: req.params.id },
        data: { status: 'FREE', bookingId: null }
      })
    }

    broadcast('booking_updated', booking)
    return booking
  })

  app.delete('/:id', async (req, reply) => {
    await prisma.timeSlot.updateMany({
      where: { bookingId: req.params.id },
      data: { status: 'FREE', bookingId: null }
    })
    await prisma.booking.delete({ where: { id: req.params.id } })
    broadcast('booking_deleted', { id: req.params.id })
    return { success: true }
  })
}

function generateKaspiLink(amount, bookingId) {
  return `https://kaspi.kz/pay?amount=${amount}&ref=${bookingId}`
}
