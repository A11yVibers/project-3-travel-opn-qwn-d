import { parseCsv } from './csv.js'

export const CATEGORY_META = Object.freeze([
  { key: 'lodging', label: 'Lodging', color: '#355070' },
  { key: 'food', label: 'Food', color: '#e56b6f' },
  { key: 'entertainment', label: 'Entertainment', color: '#e9a03c' },
  { key: 'travel', label: 'Travel', color: '#6a994e' },
])

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function dateParts(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return { y, m, d, date: new Date(Date.UTC(y, m - 1, d)) }
}

export function formatDateShort(iso) {
  const { m, d, date } = dateParts(iso)
  return `${WEEKDAYS[date.getUTCDay()].slice(0, 3)} · ${MONTHS[m - 1].slice(0, 3)} ${d}`
}

export function formatDateLong(iso) {
  const { y, m, d, date } = dateParts(iso)
  return `${WEEKDAYS[date.getUTCDay()]}, ${MONTHS[m - 1]} ${d}, ${y}`
}

export function formatDateDayMonth(iso) {
  const { m, d } = dateParts(iso)
  return `${MONTHS[m - 1]} ${d}`
}

export function formatMoney(value) {
  const rounded = Math.round(value * 100) / 100
  return `$${rounded.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export function buildTripData({ tripDaysCsv, itineraryCsv, expensesCsv }) {
  const tripRows = parseCsv(tripDaysCsv)
  const itineraryRows = parseCsv(itineraryCsv)
  const expenseRows = parseCsv(expensesCsv)

  const itineraryByDay = new Map()
  for (const row of itineraryRows) {
    if (!itineraryByDay.has(row.day_id)) itineraryByDay.set(row.day_id, [])
    itineraryByDay.get(row.day_id).push({
      order: Number(row.item_order),
      time: row.time,
      place: row.place,
      activity: row.activity,
    })
  }

  const expensesByDay = new Map()
  for (const row of expenseRows) {
    if (!expensesByDay.has(row.day_id)) expensesByDay.set(row.day_id, [])
    expensesByDay.get(row.day_id).push({
      order: Number(row.expense_order),
      category: row.category.trim().toLowerCase(),
      subcategory: row.subcategory,
      description: row.description,
      amount: Number(row.amount_usd),
    })
  }

  const days = tripRows
    .map((row) => ({
      dayId: row.day_id,
      dayNumber: Number(row.day_number),
      date: row.date,
      city: row.city,
      country: row.country,
      landmark: row.iconic_landmark,
      imageUrl: row.landmark_image_url,
      itinerary: (itineraryByDay.get(row.day_id) ?? []).slice().sort((a, b) => a.order - b.order),
      expenses: (expensesByDay.get(row.day_id) ?? []).slice().sort((a, b) => a.order - b.order),
    }))
    .sort((a, b) => a.dayNumber - b.dayNumber)
    .map((day) => {
      const totalsByCategory = Object.fromEntries(CATEGORY_META.map((c) => [c.key, 0]))
      for (const expense of day.expenses) {
        if (expense.category in totalsByCategory) {
          totalsByCategory[expense.category] = Math.round((totalsByCategory[expense.category] + expense.amount) * 100) / 100
        }
      }
      const dayTotal = Math.round(Object.values(totalsByCategory).reduce((sum, v) => sum + v, 0) * 100) / 100
      return { ...day, totalsByCategory, dayTotal }
    })

  const categoryTotals = Object.fromEntries(
    CATEGORY_META.map((c) => [
      c.key,
      Math.round(days.reduce((sum, day) => sum + day.totalsByCategory[c.key], 0) * 100) / 100,
    ]),
  )
  const grandTotal = Math.round(Object.values(categoryTotals).reduce((sum, v) => sum + v, 0) * 100) / 100
  const countryCount = new Set(days.map((day) => day.country)).size

  return { days, categoryTotals, grandTotal, countryCount }
}
