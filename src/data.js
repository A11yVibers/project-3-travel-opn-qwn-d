import tripDaysCsv from '../project-assets/trip_days.csv?raw'
import itineraryCsv from '../project-assets/itinerary.csv?raw'
import expensesCsv from '../project-assets/expenses.csv?raw'
import { APPROVED_IMAGES } from './approved-images.js'

function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (c !== '\r') {
      field += c
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((cells) => cells.length > 1 || cells[0] !== '')
}

function csvToObjects(text) {
  const [header, ...body] = parseCsv(text)
  return body.map((cells) =>
    Object.fromEntries(header.map((name, i) => [name, cells[i] ?? ''])),
  )
}

export const tripDays = csvToObjects(tripDaysCsv)
  .map((d) => ({ ...d, day_number: Number(d.day_number) }))
  .sort((a, b) => a.day_number - b.day_number)

const dayById = Object.fromEntries(tripDays.map((d) => [d.day_id, d]))

export const itineraryByDay = Object.fromEntries(
  tripDays.map((d) => [d.day_id, []]),
)
for (const item of csvToObjects(itineraryCsv)) {
  if (!itineraryByDay[item.day_id]) itineraryByDay[item.day_id] = []
  itineraryByDay[item.day_id].push(item)
}
for (const items of Object.values(itineraryByDay)) {
  items.sort((a, b) => Number(a.item_order) - Number(b.item_order))
}

export const expensesByDay = Object.fromEntries(
  tripDays.map((d) => [d.day_id, []]),
)
for (const row of csvToObjects(expensesCsv)) {
  if (!expensesByDay[row.day_id]) expensesByDay[row.day_id] = []
  expensesByDay[row.day_id].push({ ...row, amount_usd: Number(row.amount_usd) })
}
for (const items of Object.values(expensesByDay)) {
  items.sort((a, b) => Number(a.expense_order) - Number(b.expense_order))
}

export const EXPENSE_CATEGORIES = [
  { key: 'lodging', label: 'Lodging', color: '#b0603a' },
  { key: 'food', label: 'Food', color: '#b3861d' },
  { key: 'entertainment', label: 'Entertainment', color: '#7d6aa8' },
  { key: 'travel', label: 'Travel', color: '#4f7cac' },
]

const sum = (values) => values.reduce((acc, v) => acc + v, 0)

export const categoryTotals = Object.fromEntries(
  EXPENSE_CATEGORIES.map(({ key }) => [
    key,
    sum(
      Object.values(expensesByDay)
        .flat()
        .filter((e) => e.category === key)
        .map((e) => e.amount_usd),
    ),
  ]),
)

export const grandTotal = sum(Object.values(categoryTotals))

export const categoryAmountByDay = Object.fromEntries(
  EXPENSE_CATEGORIES.map(({ key }) => [
    key,
    Object.fromEntries(
      tripDays.map((d) => [
        d.day_id,
        sum(
          (expensesByDay[d.day_id] || [])
            .filter((e) => e.category === key)
            .map((e) => e.amount_usd),
        ),
      ]),
    ),
  ]),
)

export const landmarkImageUrl = (day) =>
  APPROVED_IMAGES[day.city] ?? APPROVED_IMAGES[day.iconic_landmark] ?? day.landmark_image_url

export function formatDayDate(iso) {
  const d = new Date(`${iso}T00:00:00Z`)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function formatDayDateLong(iso) {
  const d = new Date(`${iso}T00:00:00Z`)
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function formatTime(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`
}

export function formatUsd(value) {
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

export function formatPercent(value) {
  return `${value.toLocaleString('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`
}
