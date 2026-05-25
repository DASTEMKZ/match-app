import { prisma } from './db.js'

async function seed() {
  console.log('Seeding database...')

  const arenas = await prisma.arena.createMany({
    data: [
      {
        name: 'Арена Альфа',
        description: 'Современное крытое поле с искусственным покрытием',
        size: '40×20',
        surface: 'Искусственная трава',
        lighting: true,
        capacity: 10,
        pricePerHour: 8000,
        photos: JSON.stringify(['/photos/alpha1.jpg', '/photos/alpha2.jpg', '/photos/alpha3.jpg'])
      },
      {
        name: 'Арена Бета',
        description: 'Открытое поле с натуральным газоном',
        size: '50×30',
        surface: 'Натуральная трава',
        lighting: true,
        capacity: 14,
        pricePerHour: 6000,
        photos: JSON.stringify(['/photos/beta1.jpg', '/photos/beta2.jpg', '/photos/beta3.jpg'])
      },
      {
        name: 'Арена Гамма',
        description: 'Крытый мини-футбольный зал',
        size: '30×15',
        surface: 'Паркет',
        lighting: true,
        capacity: 8,
        pricePerHour: 5000,
        photos: JSON.stringify(['/photos/gamma1.jpg', '/photos/gamma2.jpg', '/photos/gamma3.jpg'])
      },
      {
        name: 'Арена Дельта',
        description: 'VIP-поле с трибунами и раздевалками',
        size: '60×40',
        surface: 'Искусственная трава 5-го поколения',
        lighting: true,
        capacity: 22,
        pricePerHour: 15000,
        photos: JSON.stringify(['/photos/delta1.jpg', '/photos/delta2.jpg', '/photos/delta3.jpg'])
      }
    ]
  })

  // Admin user
  await prisma.user.upsert({
    where: { phone: '+77001234567' },
    update: {},
    create: {
      phone: '+77001234567',
      name: 'Администратор Match',
      role: 'ADMIN',
      tag: 'FAN'
    }
  })

  // Owner
  await prisma.user.upsert({
    where: { phone: '+77007654321' },
    update: {},
    create: {
      phone: '+77007654321',
      name: 'Владелец Match',
      role: 'OWNER',
      tag: 'FAN'
    }
  })

  // Demo promo code
  await prisma.promoCode.create({
    data: { code: 'MATCH5', discount: 5, usageLimit: 1000, isActive: true }
  })

  // Initialize today's slots for all arenas
  const allArenas = await prisma.arena.findMany()
  const today = new Date().toISOString().slice(0, 10)
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10)

  for (const arena of allArenas) {
    for (const date of [today, tomorrow]) {
      for (let hour = 8; hour < 23; hour++) {
        await prisma.timeSlot.upsert({
          where: { arenaId_date_hour: { arenaId: arena.id, date, hour } },
          update: {},
          create: { arenaId: arena.id, date, hour, status: 'FREE' }
        })
      }
    }
  }

  console.log('Seed complete!')
}

seed().catch(console.error).finally(() => prisma.$disconnect())
