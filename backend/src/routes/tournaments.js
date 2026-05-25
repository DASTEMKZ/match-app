import { prisma } from '../db.js'

export async function tournamentRoutes(app) {
  app.get('/', async () => prisma.tournamentSlot.findMany({ orderBy: { date: 'asc' } }))

  app.post('/', async (req) => {
    return prisma.tournamentSlot.create({ data: req.body })
  })

  app.post('/:id/register', async (req) => {
    const { teamName, phone } = req.body
    const t = await prisma.tournamentSlot.findUnique({ where: { id: req.params.id } })
    const teams = JSON.parse(t.teams || '[]')
    if (teams.length >= t.maxTeams) throw new Error('Турнир заполнен')
    teams.push({ teamName, phone, registeredAt: new Date().toISOString() })
    return prisma.tournamentSlot.update({
      where: { id: req.params.id },
      data: { teams: JSON.stringify(teams), status: teams.length >= t.maxTeams ? 'full' : 'open' }
    })
  })

  app.get('/:id', async (req, reply) => {
    const t = await prisma.tournamentSlot.findUnique({ where: { id: req.params.id } })
    if (!t) return reply.status(404).send({ error: 'Not found' })
    return { ...t, teams: JSON.parse(t.teams || '[]') }
  })
}
