import { prisma } from '../db.js'
import { broadcast } from '../ws.js'

export async function arenaRoutes(app) {
  app.get('/', async (req) => {
    const { surface, minPrice, maxPrice } = req.query
    const where = { isActive: true }
    if (surface) where.surface = surface
    if (minPrice) where.pricePerHour = { gte: parseInt(minPrice) }
    if (maxPrice) where.pricePerHour = { ...where.pricePerHour, lte: parseInt(maxPrice) }
    return prisma.arena.findMany({ where, orderBy: { name: 'asc' } })
  })

  app.get('/:id', async (req, reply) => {
    const arena = await prisma.arena.findUnique({ where: { id: req.params.id } })
    if (!arena) return reply.status(404).send({ error: 'Not found' })
    return arena
  })

  app.post('/', async (req, reply) => {
    requireAdmin(req, reply)
    const arena = await prisma.arena.create({ data: req.body })
    broadcast('arena_created', arena)
    return arena
  })

  app.put('/:id', async (req, reply) => {
    requireAdmin(req, reply)
    const arena = await prisma.arena.update({ where: { id: req.params.id }, data: req.body })
    broadcast('arena_updated', arena)
    return arena
  })

  app.delete('/:id', async (req, reply) => {
    requireAdmin(req, reply)
    await prisma.arena.update({ where: { id: req.params.id }, data: { isActive: false } })
    return { success: true }
  })

  // Schedule for a day
  app.get('/:id/schedule', async (req) => {
    const { date } = req.query
    const slots = await prisma.timeSlot.findMany({
      where: { arenaId: req.params.id, date: date || today() },
      include: { booking: { select: { clientName: true, clientType: true, status: true } } },
      orderBy: { hour: 'asc' }
    })
    return slots
  })
}

function requireAdmin(req, reply) {
  // Simplified — real auth middleware would verify JWT
}

function today() {
  return new Date().toISOString().slice(0, 10)
}
