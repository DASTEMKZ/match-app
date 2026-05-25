import { prisma } from '../db.js'
import { processMessage } from '../services/bot-engine.js'

export async function botRoutes(app) {
  // WhatsApp webhook
  app.get('/whatsapp', async (req) => {
    const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) return challenge
    return 'OK'
  })

  app.post('/whatsapp', async (req) => {
    const body = req.body
    try {
      const entry = body?.entry?.[0]?.changes?.[0]?.value
      const msg = entry?.messages?.[0]
      if (!msg) return { status: 'no_message' }

      const phone = msg.from
      const text = msg.text?.body || ''

      const response = await processMessage({ channel: 'whatsapp', senderId: phone, text })
      await prisma.botMessage.create({ data: { channel: 'whatsapp', senderId: phone, message: text, response } })

      // Send reply via WhatsApp Cloud API
      if (process.env.WHATSAPP_TOKEN) {
        await sendWhatsApp(phone, response)
      }
    } catch (e) {
      console.error('WhatsApp webhook error:', e)
    }
    return { status: 'ok' }
  })

  // Instagram webhook
  app.get('/instagram', async (req) => {
    const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query
    if (mode === 'subscribe' && token === process.env.INSTAGRAM_VERIFY_TOKEN) return challenge
    return 'OK'
  })

  app.post('/instagram', async (req) => {
    const body = req.body
    try {
      const entry = body?.entry?.[0]
      const messaging = entry?.messaging?.[0]
      if (!messaging) return { status: 'no_message' }

      const senderId = messaging.sender?.id
      const text = messaging.message?.text || ''

      const response = await processMessage({ channel: 'instagram', senderId, text })
      await prisma.botMessage.create({ data: { channel: 'instagram', senderId, message: text, response } })

      if (process.env.INSTAGRAM_TOKEN) {
        await sendInstagramDM(senderId, response)
      }
    } catch (e) {
      console.error('Instagram webhook error:', e)
    }
    return { status: 'ok' }
  })

  // Site chatbot
  app.post('/chat', async (req) => {
    const { senderId, text, lang = 'ru' } = req.body
    const response = await processMessage({ channel: 'site', senderId, text, lang })
    await prisma.botMessage.create({ data: { channel: 'site', senderId: senderId || 'anonymous', message: text, response } })
    return { response }
  })

  // Bot message history
  app.get('/messages', async (req) => {
    const { channel } = req.query
    return prisma.botMessage.findMany({
      where: channel ? { channel } : {},
      orderBy: { createdAt: 'desc' },
      take: 100
    })
  })
}

async function sendWhatsApp(to, text) {
  const url = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`
  await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: text } })
  })
}

async function sendInstagramDM(recipientId, text) {
  const url = `https://graph.facebook.com/v18.0/me/messages`
  await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.INSTAGRAM_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipient: { id: recipientId }, message: { text } })
  })
}
