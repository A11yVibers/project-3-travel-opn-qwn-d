export function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i += 1
      row.push(field)
      if (row.some((f) => f.trim() !== '')) rows.push(row)
      row = []
      field = ''
    } else {
      field += char
    }
  }
  row.push(field)
  if (row.some((f) => f.trim() !== '')) rows.push(row)
  if (rows.length < 2) return []
  const header = rows[0].map((h) => h.trim())
  return rows.slice(1).map((cells) =>
    Object.fromEntries(header.map((key, idx) => [key, (cells[idx] ?? '').trim()]))
  )
}

export const CATEGORIES = Object.freeze([
  { key: 'lodging', label: 'Lodging', color: '#2f6f66', ink: '#24544d' },
  { key: 'food', label: 'Food', color: '#c96f4a', ink: '#a4522f' },
  { key: 'entertainment', label: 'Entertainment', color: '#d9a441', ink: '#96701f' },
  { key: 'travel', label: 'Travel', color: '#6a5a8f', ink: '#4d3f6e' },
])

const round2 = (n) => Math.round(n * 100) / 100

export function buildTripData(tripDaysCsv, itineraryCsv, expensesCsv) {
  const days = parseCsv(tripDaysCsv)
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

  const itineraryByDayId = new Map(days.map((d) => [d.dayId, []]))
  for (const r of parseCsv(itineraryCsv)) {
    if (!itineraryByDayId.has(r.day_id)) itineraryByDayId.set(r.day_id, [])
    itineraryByDayId.get(r.day_id).push({
      order: Number(r.item_order),
      time: r.time,
      place: r.place,
      activity: r.activity,
    })
  }
  for (const items of itineraryByDayId.values()) items.sort((a, b) => a.order - b.order)

  const expenses = parseCsv(expensesCsv).map((r) => ({
    dayId: r.day_id,
    category: r.category.toLowerCase(),
    subcategory: r.subcategory,
    description: r.description,
    amount: Number(r.amount_usd),
  }))

  const sumWhere = (categoryKey, dayId) =>
    round2(
      expenses.reduce(
        (sum, e) =>
          e.category === categoryKey && (dayId == null || e.dayId === dayId)
            ? sum + e.amount
            : sum,
        0
      )
    )

  const categoryTotals = CATEGORIES.map((c) => ({ ...c, value: sumWhere(c.key) }))
  const grandTotal = round2(categoryTotals.reduce((sum, c) => sum + c.value, 0))

  const spendMatrix = Object.fromEntries(
    CATEGORIES.map((c) => [
      c.key,
      days.map((d) => ({
        dayId: d.dayId,
        dayNumber: d.dayNumber,
        city: d.city,
        amount: sumWhere(c.key, d.dayId),
      })),
    ])
  )

  const stats = {
    dayCount: days.length,
    cityCount: new Set(days.map((d) => d.city)).size,
    countryCount: new Set(days.map((d) => d.country)).size,
    firstCity: days[0]?.city ?? '',
    lastCity: days[days.length - 1]?.city ?? '',
  }

  const dateRangeLabel = days.length
    ? formatDateRange(days[0].date, days[days.length - 1].date)
    : ''

  return { days, itineraryByDayId, categoryTotals, spendMatrix, grandTotal, stats, dateRangeLabel }
}

export function formatDate(isoDate, { weekday = false } = {}) {
  const d = new Date(`${isoDate}T12:00:00Z`)
  if (Number.isNaN(d.getTime())) return isoDate
  return d.toLocaleDateString('en-US', {
    weekday: weekday ? 'short' : undefined,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function formatDateRange(isoA, isoB) {
  const a = new Date(`${isoA}T12:00:00Z`)
  const b = new Date(`${isoB}T12:00:00Z`)
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return `${isoA} – ${isoB}`
  if (a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth()) {
    const month = a.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' })
    return `${month} ${a.getUTCDate()}–${b.getUTCDate()}, ${a.getUTCFullYear()}`
  }
  const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
  return `${fmt(a)} – ${fmt(b)}, ${b.getUTCFullYear()}`
}

export function formatUsd(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return String(value)
  return Number.isInteger(n)
    ? `$${n.toLocaleString('en-US')}`
    : `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatPct(part, whole) {
  if (!whole) return '0%'
  return `${Math.round((part / whole) * 100)}%`
}
