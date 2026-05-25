import { prisma } from '../db.js'

export async function subscriptionRoutes(app) {
  app.get('/', async () => prisma.subscription.findMany({ include: { user: { select: { name: true, phone: true } } } }))

  app.post('/', async (req) => {
    const { userId, arenaId, type, totalSessions, months } = req.body
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + (months || 3))

    const sub = await prisma.subscription.create({
      data: { userId, arenaId, type, totalSessions, expiresAt }
    })
    await prisma.user.update({ where: { id: userId }, data: { tag: 'TEAM' } })
    return sub
  })

  app.patch('/:id/use', async (req) => {
    return prisma.subscription.update({
      where: { id: req.params.id },
      data: { usedSessions: { increment: 1 } }
    })
  })

  app.get('/user/:userId', async (req) => {
    return prisma.subscription.findMany({
      where: { userId: req.params.userId },
      include: { user: true }
    })
  })
}
