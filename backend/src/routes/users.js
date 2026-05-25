import { prisma } from '../db.js'

export async function userRoutes(app) {
  app.get('/', async (req) => {
    const { tag, search } = req.query
    const where = {}
    if (tag) where.tag = tag
    if (search) where.OR = [
      { name: { contains: search } },
      { phone: { contains: search } },
      { instagram: { contains: search } }
    ]
    return prisma.user.findMany({
      where,
      include: {
        bookings: {
          select: { id: true, date: true, totalAmount: true, status: true, arenaId: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  })

  app.get('/:id', async (req, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { bookings: { include: { arena: { select: { name: true } } }, orderBy: { createdAt: 'desc' } } }
    })
    if (!user) return reply.status(404).send({ error: 'Not found' })
    return user
  })

  app.post('/', async (req) => {
    return prisma.user.create({ data: req.body })
  })

  app.put('/:id', async (req) => {
    return prisma.user.update({ where: { id: req.params.id }, data: req.body })
  })

  app.get('/:id/stats', async (req) => {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.params.id },
      select: { totalAmount: true, status: true, createdAt: true }
    })
    const total = bookings.reduce((s, b) => s + b.totalAmount, 0)
    const completed = bookings.filter(b => b.status === 'COMPLETED').length
    return { totalBookings: bookings.length, totalSpent: total, completed }
  })
}
