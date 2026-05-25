import jwt from 'jsonwebtoken'
import { prisma } from '../db.js'

const JWT_SECRET = process.env.JWT_SECRET || 'match-secret-2026'
const otpStore = new Map() // phone -> { otp, expires }

export async function authRoutes(app) {
  // Send OTP
  app.post('/send-otp', async (req, reply) => {
    const { phone } = req.body
    if (!phone) return reply.status(400).send({ error: 'Phone required' })

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    otpStore.set(phone, { otp, expires: Date.now() + 5 * 60 * 1000 })

    // In production: send via SMS/WhatsApp
    console.log(`OTP for ${phone}: ${otp}`)
    return { success: true, message: 'OTP sent', ...(process.env.NODE_ENV !== 'production' && { otp }) }
  })

  // Verify OTP
  app.post('/verify-otp', async (req, reply) => {
    const { phone, otp, name } = req.body
    const record = otpStore.get(phone)

    if (!record || record.otp !== otp || Date.now() > record.expires) {
      return reply.status(401).send({ error: 'Invalid or expired OTP' })
    }

    otpStore.delete(phone)

    let user = await prisma.user.findUnique({ where: { phone } })
    if (!user) {
      user = await prisma.user.create({ data: { phone, name: name || 'Пользователь', role: 'CLIENT' } })
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' })
    return { token, user }
  })

  // Me
  app.get('/me', async (req, reply) => {
    const auth = req.headers.authorization
    if (!auth) return reply.status(401).send({ error: 'No token' })
    try {
      const payload = jwt.verify(auth.replace('Bearer ', ''), JWT_SECRET)
      const user = await prisma.user.findUnique({ where: { id: payload.userId } })
      return user
    } catch {
      return reply.status(401).send({ error: 'Invalid token' })
    }
  })
}
