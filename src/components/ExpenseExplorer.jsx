import { useState } from 'react'
import { CATEGORY_META, formatMoney } from '../tripData.js'

const DONUT_SIZE = 300
const CX = DONUT_SIZE / 2
const CY = DONUT_SIZE / 2
const R_OUT = 132
const R_IN = 84
const PAD_ANGLE = 1.4
const POP = 8

const BAR_W = 860
const BAR_H = 360
const PAD_L = 60
const PAD_R = 16
const PAD_T = 34
const PAD_B = 72

function polar(cx, cy, r, angleDeg) {
  const a = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
}

function slicePath(startAngle, endAngle) {
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  const o1 = polar(CX, CY, R_OUT, startAngle)
  const o2 = polar(CX, CY, R_OUT, endAngle)
  const i2 = polar(CX, CY, R_IN, endAngle)
  const i1 = polar(CX, CY, R_IN, startAngle)
  return [
    `M ${o1.x} ${o1.y}`,
    `A ${R_OUT} ${R_OUT} 0 ${largeArc} 1 ${o2.x} ${o2.y}`,
    `L ${i2.x} ${i2.y}`,
    `A ${R_IN} ${R_IN} 0 ${largeArc} 0 ${i1.x} ${i1.y}`,
    'Z',
  ].join(' ')
}

function niceStep(rough) {
  if (rough <= 0) return 25
  const mag = Math.pow(10, Math.floor(Math.log10(rough)))
  const norm = rough / mag
  const mult = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10
  return mult * mag
}

function roundedTopBar(x, y, w, base, r) {
  const radius = Math.max(0, Math.min(r, w / 2, base - y))
  return [
    `M ${x} ${base}`,
    `L ${x} ${y + radius}`,
    `Q ${x} ${y} ${x + radius} ${y}`,
    `L ${x + w - radius} ${y}`,
    `Q ${x + w} ${y} ${x + w} ${y + radius}`,
    `L ${x + w} ${base}`,
    'Z',
  ].join(' ')
}

function DonutChart({ slices, selectedKey, onSelect, centerLines }) {
  return (
    <svg
      className="donut"
      viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}
      role="group"
      aria-label="Total spending by category"
    >
      {slices.map((slice) => {
        const selected = slice.key === selectedKey
        const mid = (slice.startAngle + slice.endAngle) / 2
        const offset = selected ? polar(0, 0, POP, mid) : { x: 0, y: 0 }
        return (
          <path
            key={slice.key}
            className={`donut-slice${selected ? ' selected' : ''}`}
            d={slicePath(slice.startAngle, slice.endAngle)}
            fill={slice.color}
            style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
            tabIndex={0}
            role="button"
            aria-pressed={selected}
            aria-label={`${slice.label}: ${formatMoney(slice.total)}, ${slice.percent}% of trip spending. Show daily comparison.`}
            onClick={() => onSelect(slice.key)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect(slice.key)
              }
            }}
          >
            <title>{`${slice.label} — ${formatMoney(slice.total)} (${slice.percent}%)`}</title>
          </path>
        )
      })}
      {centerLines.map((line, i) => (
        <text
          key={i}
          className={line.className}
          x={CX}
          y={CY + line.dy}
          textAnchor="middle"
        >
          {line.text}
        </text>
      ))}
    </svg>
  )
}

function CityBars({ days, category, color }) {
  const values = days.map((day) => day.totalsByCategory[category.key])
  const rawMax = Math.max(...values)
  const step = niceStep(rawMax / 4)
  const niceMax = Math.max(step * 4, rawMax > 0 ? step : 100)

  const plotW = BAR_W - PAD_L - PAD_R
  const plotH = BAR_H - PAD_T - PAD_B
  const base = PAD_T + plotH
  const slot = plotW / days.length
  const barW = Math.min(46, slot * 0.6)

  const ticks = [0, 1, 2, 3, 4].map((t) => (niceMax / 4) * t)

  return (
    <svg
      className="bars"
      viewBox={`0 0 ${BAR_W} ${BAR_H}`}
      role="img"
      aria-label={`${category.label} spending per city, bar chart`}
    >
      {ticks.map((tick) => {
        const y = base - (tick / niceMax) * plotH
        return (
          <g key={tick}>
            <line className="grid-line" x1={PAD_L} y1={y} x2={BAR_W - PAD_R} y2={y} />
            <text className="tick-label" x={PAD_L - 10} y={y + 4} textAnchor="end">
              {formatMoney(tick)}
            </text>
          </g>
        )
      })}
      <line className="axis-line" x1={PAD_L} y1={base} x2={BAR_W - PAD_R} y2={base} />
      {days.map((day, i) => {
        const value = values[i]
        const barH = niceMax > 0 ? (value / niceMax) * plotH : 0
        const x = PAD_L + i * slot + (slot - barW) / 2
        const y = base - barH
        const isMax = value === rawMax && rawMax > 0
        return (
          <g key={day.dayId} className="bar-group">
            <path
              className={`bar${isMax ? ' bar-max' : ''}`}
              d={roundedTopBar(x, y, barW, base, 6)}
              fill={color}
            >
              <title>{`${day.city} (Day ${day.dayNumber}) — ${category.label}: ${formatMoney(value)}`}</title>
            </path>
            <text className="bar-value" x={x + barW / 2} y={y - 8} textAnchor="middle">
              {formatMoney(value)}
            </text>
            <text className="bar-city" x={x + barW / 2} y={base + 24} textAnchor="middle">
              {day.city}
            </text>
            <text className="bar-day" x={x + barW / 2} y={base + 43} textAnchor="middle">
              Day {day.dayNumber}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function ExpenseExplorer({ days, categoryTotals, grandTotal }) {
  const [selectedKey, setSelectedKey] = useState(CATEGORY_META[0].key)

  const slices = (() => {
    let angle = 0
    return CATEGORY_META.map((category) => {
      const total = categoryTotals[category.key]
      const sweep = grandTotal > 0 ? (total / grandTotal) * 360 : 0
      const startAngle = angle + PAD_ANGLE / 2
      const endAngle = Math.max(angle + sweep - PAD_ANGLE / 2, angle + PAD_ANGLE / 2)
      angle += sweep
      return {
        ...category,
        total,
        percent: grandTotal > 0 ? Math.round((total / grandTotal) * 100) : 0,
        startAngle,
        endAngle,
      }
    })
  })()

  const selectedMeta = CATEGORY_META.find((c) => c.key === selectedKey)
  const selectedSlice = slices.find((s) => s.key === selectedKey)
  const perDay = days.map((day) => ({ day, amount: day.totalsByCategory[selectedKey] }))
  const highest = perDay.reduce((best, cur) => (cur.amount > best.amount ? cur : best), perDay[0])

  const centerLines = selectedSlice
    ? [
        { className: 'donut-center-label', dy: -14, text: selectedSlice.label.toUpperCase() },
        { className: 'donut-center-value', dy: 16, text: formatMoney(selectedSlice.total) },
        { className: 'donut-center-sub', dy: 40, text: `${selectedSlice.percent}% of trip` },
      ]
    : [
        { className: 'donut-center-label', dy: -8, text: 'TOTAL SPENT' },
        { className: 'donut-center-value', dy: 22, text: formatMoney(grandTotal) },
      ]

  return (
    <div className="expense-grid">
      <div className="card donut-card">
        <h3 className="card-title">Spending by category</h3>
        <DonutChart slices={slices} selectedKey={selectedKey} onSelect={setSelectedKey} centerLines={centerLines} />
        <ul className="legend">
          {slices.map((slice) => (
            <li key={slice.key}>
              <button
                type="button"
                className={`legend-chip${slice.key === selectedKey ? ' selected' : ''}`}
                style={{ '--cat-color': slice.color }}
                aria-pressed={slice.key === selectedKey}
                onClick={() => setSelectedKey(slice.key)}
              >
                <span className="legend-dot" aria-hidden="true" />
                <span className="legend-label">{slice.label}</span>
                <span className="legend-value">{formatMoney(slice.total)}</span>
                <span className="legend-pct">{slice.percent}%</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="card compare-card">
        <div className="compare-head">
          <h3 className="card-title">
            <span className="legend-dot" style={{ '--cat-color': selectedMeta.color }} aria-hidden="true" />
            {selectedMeta.label} by city
          </h3>
          <p className="compare-meta">
            Trip total {formatMoney(selectedSlice.total)} · Highest: {highest.day.city} ({formatMoney(highest.amount)})
          </p>
        </div>
        <CityBars days={days} category={selectedMeta} color={selectedMeta.color} />
      </div>
    </div>
  )
}
