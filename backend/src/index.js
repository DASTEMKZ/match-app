import Fastify from 'fastify'
import cors from '@fastify/cors'
import websocket from '@fastify/websocket'
import multipart from '@fastify/multipart'
import dotenv from 'dotenv'

import { arenaRoutes } from './routes/arenas.js'
import { bookingRoutes } from './routes/bookings.js'
import { userRoutes } from './routes/users.js'
import { authRoutes } from './routes/auth.js'
import { analyticsRoutes } from './routes/analytics.js'
import { botRoutes } from './routes/bots.js'
import { exportRoutes } from './routes/exports.js'
import { subscriptionRoutes } from './routes/subscriptions.js'
import { tournamentRoutes } from './routes/tournaments.js'
import { wsHandler } from './ws.js'

dotenv.config()

const app = Fastify({ logger: true })

await app.register(cors, { origin: true })
await app.register(websocket)
await app.register(multipart)

app.register(authRoutes, { prefix: '/api/auth' })
app.register(arenaRoutes, { prefix: '/api/arenas' })
app.register(bookingRoutes, { prefix: '/api/bookings' })
app.register(userRoutes, { prefix: '/api/users' })
app.register(analyticsRoutes, { prefix: '/api/analytics' })
app.register(botRoutes, { prefix: '/api/bots' })
app.register(exportRoutes, { prefix: '/api/export' })
app.register(subscriptionRoutes, { prefix: '/api/subscriptions' })
app.register(tournamentRoutes, { prefix: '/api/tournaments' })

app.get('/ws', { websocket: true }, wsHandler)

app.get('/health', async () => ({ status: 'ok', version: '1.1.0' }))

const port = process.env.PORT || 4000
await app.listen({ port, host: '0.0.0.0' })
console.log(`Match API running on http://localhost:${port}`)
