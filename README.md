# MATCH ⚽ — Платформа аренды футбольных полей

> match.kz · PRD v1.1 · Полный продукт

## Стек

| Уровень | Технология |
|---|---|
| Frontend | Next.js 16 (App Router) + Tailwind CSS |
| Backend | Fastify + WebSocket |
| БД | SQLite + Prisma 5 |
| Авторизация | JWT по номеру телефона |
| Оплата | Kaspi Pay API |
| Боты | WhatsApp Cloud API + Instagram Graph API |
| Экспорт | Excel (ExcelJS) + PDF (PDFKit) + 1C XML |

## Быстрый старт

### 1. Backend

```bash
cd backend
npm install
npx prisma db push
node src/seed.js      # заполнить тестовыми данными
npm run dev           # запускает на :4000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev           # запускает на :3000
```

## Страницы

| URL | Описание |
|---|---|
| `/` | Главная — Hero, фичи, CTA |
| `/arenas` | Каталог арен с фильтрами |
| `/schedule` | Расписание-сетка (WebSocket real-time) |
| `/book` | Форма бронирования + Kaspi Pay |
| `/my-bookings` | Мои бронирования по телефону |
| `/tournaments` | Турниры и регистрация команд |
| `/admin` | Панель администратора |
| `/admin/bookings` | Управление бронированиями |
| `/admin/clients` | CRM — база клиентов |
| `/admin/analytics` | Аналитика + экспорт Excel/1C |
| `/admin/bots` | Чат-боты (WhatsApp, Instagram, сайт) |

## Переменные окружения

### backend/.env
```
PORT=4000
JWT_SECRET=your-secret
WHATSAPP_TOKEN=           # WhatsApp Business Cloud API
WHATSAPP_PHONE_ID=
INSTAGRAM_TOKEN=          # Instagram Graph API
```

### frontend/.env.local
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Функциональность

- **Каталог арен** — фото, характеристики, статус, фильтры
- **Расписание** — сетка 8:00–22:00, WebSocket обновление, цветовое кодирование
- **Бронирование** — скидки (корп. −15%, абонемент −10%), промокоды, Kaspi Pay
- **Уведомления** — WhatsApp/SMS при бронировании и за 2 часа до игры
- **CRM** — база клиентов с тегами, историей, экспорт Excel
- **PDF-договор** — автогенерация для корпоративных клиентов
- **Аналитика** — выручка, загруженность, пиковые часы, экспорт Excel + 1C XML
- **Чат-боты** — WhatsApp 24/7, Instagram DM, виджет на сайте (рус/каз)
- **Турниры** — создание слотов, регистрация команд
- **Абонементы** — учёт сессий, скидки

---
*© 2026 Match Sports · match.kz*
