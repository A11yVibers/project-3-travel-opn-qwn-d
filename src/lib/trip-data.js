import tripDaysCsv from '../../project-assets/trip_days.csv?raw'
import itineraryCsv from '../../project-assets/itinerary.csv?raw'
import expensesCsv from '../../project-assets/expenses.csv?raw'
import { parseCsv } from './csv.js'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatDate(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number)
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]
  return `${weekday}, ${MONTHS[m - 1]} ${d}, ${y}`
}

export const days = parseCsv(tripDaysCsv)
  .map((r) => ({
    dayId: r.day_id,
    dayNumber: Number(r.day_number),
    date: r.date,
    dateLabel: formatDate(r.date),
    city: r.city,
    country: r.country,
    landmark: r.iconic_landmark,
    imageUrl: r.landmark_image_url,
  }))
  .sort((a, b) => a.dayNumber - b.dayNumber)

export const itineraryByDay = days.reduce((acc, day) => {
  acc[day.dayId] = []
  return acc
}, {})

for (const row of parseCsv(itineraryCsv)) {
  if (!itineraryByDay[row.day_id]) itineraryByDay[row.day_id] = []
  itineraryByDay[row.day_id].push({
    order: Number(row.item_order),
    time: row.time,
    place: row.place,
    activity: row.activity,
  })
}
for (const items of Object.values(itineraryByDay)) items.sort((a, b) => a.order - b.order)

export const CATEGORIES = [
  { key: 'lodging', label: 'Lodging', color: '#b4553c' },
  { key: 'food', label: 'Food', color: '#b57c15' },
  { key: 'entertainment', label: 'Entertainment', color: '#3e7c6f' },
  { key: 'travel', label: 'Travel', color: '#4a6fa5' },
]

const expenses = parseCsv(expensesCsv).map((r) => ({
  dayId: r.day_id,
  category: r.category.toLowerCase(),
  amount: Number(r.amount_usd),
}))

export const grandTotal = expenses.reduce((sum, e) => sum + e.amount, 0)

export const categoryTotals = CATEGORIES.map((cat) => ({
  ...cat,
  total: expenses.filter((e) => e.category === cat.key).reduce((sum, e) => sum + e.amount, 0),
}))

export const dailyCategoryTotals = CATEGORIES.reduce((acc, cat) => {
  acc[cat.key] = days.map((day) => ({
    dayNumber: day.dayNumber,
    city: day.city,
    amount: expenses
      .filter((e) => e.dayId === day.dayId && e.category === cat.key)
      .reduce((sum, e) => sum + e.amount, 0),
  }))
  return acc
}, {})

export const cityCount = days.length
export const countryCount = new Set(days.map((d) => d.country)).size
