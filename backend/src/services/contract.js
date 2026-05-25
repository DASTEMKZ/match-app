import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'

export async function generateContract(booking, arena) {
  const dir = './public/contracts'
  fs.mkdirSync(dir, { recursive: true })
  const filename = `contract-${booking.id}.pdf`
  const filepath = path.join(dir, filename)

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 60 })
    const stream = fs.createWriteStream(filepath)
    doc.pipe(stream)

    const date = new Date().toLocaleDateString('ru-RU')
    const bookingDate = booking.date
    const amount = booking.totalAmount.toLocaleString('ru')
    const prepay = booking.prepayAmount.toLocaleString('ru')

    doc.fontSize(18).font('Helvetica-Bold').text('ДОГОВОР АРЕНДЫ СПОРТИВНОГО ПОЛЯ', { align: 'center' })
    doc.moveDown(0.5)
    doc.fontSize(12).font('Helvetica').text(`г. Алматы, ${date}`, { align: 'center' })
    doc.moveDown(1.5)

    doc.font('Helvetica-Bold').text('Стороны договора:')
    doc.font('Helvetica').moveDown(0.3)
    doc.text(`Арендодатель: Match Sports, ИИН 123456789012`)
    doc.text(`Арендатор: ${booking.clientName}`)
    doc.text(`Контакт: ${booking.clientPhone}`)
    doc.moveDown(1)

    doc.font('Helvetica-Bold').text('Предмет договора:')
    doc.font('Helvetica').moveDown(0.3)
    doc.text(`Арендодатель предоставляет Арендатору во временное пользование`)
    doc.text(`спортивное поле: ${arena.name}`)
    doc.text(`Дата: ${bookingDate}`)
    doc.text(`Время: ${booking.startHour}:00 – ${booking.startHour + booking.duration}:00`)
    doc.text(`Продолжительность: ${booking.duration} ч.`)
    doc.moveDown(1)

    doc.font('Helvetica-Bold').text('Стоимость и оплата:')
    doc.font('Helvetica').moveDown(0.3)
    doc.text(`Общая сумма: ${amount} ₸`)
    doc.text(`Предоплата (50%): ${prepay} ₸`)
    doc.text(`Остаток: ${(booking.totalAmount - booking.prepayAmount).toLocaleString('ru')} ₸ — оплата по факту`)
    doc.moveDown(1)

    doc.font('Helvetica-Bold').text('Условия:')
    doc.font('Helvetica').moveDown(0.3)
    doc.text('1. Отмена за 24 часа — предоплата возвращается.')
    doc.text('2. Отмена менее чем за 24 часа — предоплата не возвращается.')
    doc.text('3. Арендатор несёт ответственность за сохранность имущества.')
    doc.text('4. Курение и алкоголь на территории запрещены.')
    doc.moveDown(2)

    doc.font('Helvetica-Bold').text('Подписи сторон:')
    doc.moveDown(2)
    doc.text('Арендодатель: _________________    Арендатор: _________________')
    doc.moveDown(0.5)
    doc.font('Helvetica').fontSize(10).text(`Match Sports                                ${booking.clientName}`)

    doc.end()
    stream.on('finish', () => resolve(`/contracts/${filename}`))
    stream.on('error', reject)
  })
}
