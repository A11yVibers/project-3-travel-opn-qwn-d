import tripDaysCsv from '../project-assets/trip_days.csv?raw'
import itineraryCsv from '../project-assets/itinerary.csv?raw'
import expensesCsv from '../project-assets/expenses.csv?raw'
import { csvToObjects } from './csv.js'

export const tripDays = csvToObjects(tripDaysCsv)
  .map((r) => ({
    dayId: r.day_id,
    dayNumber: Number(r.day_number),
    date: r.date,
    city: r.city,
    country: r.country,
    landmark: r.iconic_landmark,
    imageUrl: r.landmark_image_url,
  }))
  .sort((a, b) => a.dayNumber - b.dayNumber)

const dayById = new Map(tripDays.map((d) => [d.dayId, d]))

export const itineraryByDay = new Map()
for (const item of csvToObjects(itineraryCsv)
  .map((r) => ({
    dayId: r.day_id,
    order: Number(r.item_order),
    time: r.time,
    place: r.place,
    activity: r.activity,
  }))
  .sort((a, b) => a.order - b.order)) {
  if (!itineraryByDay.has(item.dayId)) itineraryByDay.set(item.dayId, [])
  itineraryByDay.get(item.dayId).push(item)
}

export const expenses = csvToObjects(expensesCsv)
  .map((r) => ({
    dayId: r.day_id,
    order: Number(r.expense_order),
    category: r.category.trim().toLowerCase(),
    subcategory: r.subcategory,
    description: r.description,
    amount: Number(r.amount_usd),
  }))
  .sort((a, b) => a.dayId.localeCompare(b.dayId) || a.order - b.order)

export const CATEGORIES = [
  { key: 'lodging', label: 'Lodging', color: '#b96a4b' },
  { key: 'food', label: 'Food', color: '#d9a441' },
  { key: 'entertainment', label: 'Entertainment', color: '#7c9a6d' },
  { key: 'travel', label: 'Travel', color: '#5b84a6' },
]

export const tripTotal = expenses.reduce((sum, e) => sum + e.amount, 0)

export const categoryTotals = CATEGORIES.map((c) => {
  const total = expenses
    .filter((e) => e.category === c.key)
    .reduce((sum, e) => sum + e.amount, 0)
  return { ...c, total, percent: tripTotal > 0 ? (total / tripTotal) * 100 : 0 }
})

export const categoryByDay = new Map(
  CATEGORIES.map((c) => [
    c.key,
    tripDays.map((day) => ({
      dayId: day.dayId,
      dayNumber: day.dayNumber,
      city: day.city,
      date: day.date,
      amount: expenses
        .filter((e) => e.dayId === day.dayId && e.category === c.key)
        .reduce((sum, e) => sum + e.amount, 0),
    })),
  ]),
)

export function getDay(dayId) {
  return dayById.get(dayId)
}

export function getItinerary(dayId) {
  return itineraryByDay.get(dayId) ?? []
}

export function formatDate(iso, opts) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(
    'en-US',
    opts ?? { month: 'short', day: 'numeric', year: 'numeric' },
  )
}

export function formatUsd(n) {
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}
