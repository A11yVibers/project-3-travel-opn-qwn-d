import { useState } from 'react'
import {
  EXPENSE_CATEGORIES,
  categoryAmountByDay,
  categoryTotals,
  formatPercent,
  formatUsd,
  grandTotal,
  tripDays,
} from '../data.js'

const CX = 120
const CY = 120
const R_OUTER = 100
const R_INNER = 62
const GAP_DEG = 1.6
const POP_PX = 8

function polar(angleDeg, radius) {
  const a = ((angleDeg - 90) * Math.PI) / 180
  return [CX + radius * Math.cos(a), CY + radius * Math.sin(a)]
}

function direction(angleDeg) {
  const a = ((angleDeg - 90) * Math.PI) / 180
  return [Math.cos(a), Math.sin(a)]
}

function slicePath(startAngle, endAngle) {
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  const [x1, y1] = polar(startAngle, R_OUTER)
  const [x2, y2] = polar(endAngle, R_OUTER)
  const [x3, y3] = polar(endAngle, R_INNER)
  const [x4, y4] = polar(startAngle, R_INNER)
  return [
    `M ${x1.toFixed(2)} ${y1.toFixed(2)}`,
    `A ${R_OUTER} ${R_OUTER} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`,
    `L ${x3.toFixed(2)} ${y3.toFixed(2)}`,
    `A ${R_INNER} ${R_INNER} 0 ${largeArc} 0 ${x4.toFixed(2)} ${y4.toFixed(2)}`,
    'Z',
  ].join(' ')
}

function buildSlices() {
  let angle = 0
  return EXPENSE_CATEGORIES.map((cat) => {
    const total = categoryTotals[cat.key]
    const sweep = (total / grandTotal) * 360
    const start = angle
    const end = angle + sweep
    angle = end
    const mid = (start + end) / 2
    const pad = Math.min(GAP_DEG / 2, sweep / 4)
    return {
      ...cat,
      total,
      share: (total / grandTotal) * 100,
      mid,
      path: slicePath(start + pad, end - pad),
      popOffset: direction(mid).map((v) => v * POP_PX),
    }
  })
}

const SLICES = buildSlices()

function activateOnEnter(event, action) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    action()
  }
}

function DailyComparison({ category }) {
  const amounts = tripDays.map((day) => ({
    day,
    amount: categoryAmountByDay[category.key][day.day_id] ?? 0,
  }))
  const max = Math.max(...amounts.map((a) => a.amount), 1)
  const total = categoryTotals[category.key]
  const peak = amounts.reduce((a, b) => (b.amount > a.amount ? b : a))

  return (
    <div className="compare" aria-live="polite">
      <div className="compare-header">
        <h3>
          <span
            className="compare-swatch"
            style={{ background: category.color }}
            aria-hidden="true"
          />
          {category.label} by day
        </h3>
        <p className="compare-summary">
          {formatUsd(total)} total &middot; {formatUsd(Math.round(total / tripDays.length))} per day on
          average &middot; most in {peak.day.city} ({formatUsd(peak.amount)})
        </p>
      </div>
      <ul className="compare-list">
        {amounts.map(({ day, amount }) => (
          <li
            className={`compare-row${amount === max ? ' is-peak' : ''}`}
            key={day.day_id}
          >
            <span className="compare-day" aria-hidden="true">
              {day.day_number}
            </span>
            <span className="compare-city">
              {day.city}
              <span className="visually-hidden">
                , day {day.day_number}
              </span>
            </span>
            <span className="compare-track" aria-hidden="true">
              <span
                className="compare-fill"
                style={{
                  width: `${(amount / max) * 100}%`,
                  background: category.color,
                }}
              />
            </span>
            <span className="compare-amount">
              {formatUsd(amount)}
              <span className="visually-hidden"> on {category.label.toLowerCase()}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function ExpenseExplorer() {
  const [selectedKey, setSelectedKey] = useState(null)
  const selected = SLICES.find((s) => s.key === selectedKey) ?? null

  const toggle = (key) =>
    setSelectedKey((current) => (current === key ? null : key))

  return (
    <div className="expense-layout">
      <div className="donut-panel panel">
        <svg
          viewBox="0 0 240 240"
          className="donut"
          role="group"
          aria-label={`Spending by category, donut chart. Total ${formatUsd(grandTotal)} across 10 days`}
        >
          {SLICES.map((slice) => {
            const isSelected = slice.key === selectedKey
            const isDimmed = selectedKey !== null && !isSelected
            const [dx, dy] = isSelected ? slice.popOffset : [0, 0]
            return (
              <path
                key={slice.key}
                d={slice.path}
                fill={slice.color}
                className={[
                  'donut-slice',
                  isSelected ? 'is-selected' : '',
                  isDimmed ? 'is-dimmed' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{ transform: `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px)` }}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                aria-label={`${slice.label}: ${formatUsd(slice.total)}, ${formatPercent(slice.share)} of total spending. ${isSelected ? 'Hide' : 'Show'} daily comparison by city`}
                onClick={() => toggle(slice.key)}
                onKeyDown={(e) => activateOnEnter(e, () => toggle(slice.key))}
              >
                <title>{`${slice.label} — ${formatUsd(slice.total)} (${formatPercent(slice.share)})`}</title>
              </path>
            )
          })}
          <text x={CX} y={CY - 12} className="donut-center-kicker" aria-hidden="true">
            {selected ? selected.label : 'Total spent'}
          </text>
          <text x={CX} y={CY + 14} className="donut-center-value" aria-hidden="true">
            {formatUsd(selected ? selected.total : grandTotal)}
          </text>
          <text x={CX} y={CY + 34} className="donut-center-sub" aria-hidden="true">
            {selected ? `${formatPercent(selected.share)} of trip` : '10 days · 9 countries'}
          </text>
        </svg>

        <ul className="legend" aria-label="Spending categories">
          {SLICES.map((slice) => {
            const isSelected = slice.key === selectedKey
            return (
              <li key={slice.key}>
                <button
                  type="button"
                  className={`legend-item${isSelected ? ' is-selected' : ''}`}
                  aria-pressed={isSelected}
                  onClick={() => toggle(slice.key)}
                >
                  <span
                    className="legend-swatch"
                    style={{ background: slice.color }}
                    aria-hidden="true"
                  />
                  <span className="legend-label">{slice.label}</span>
                  <span className="legend-amount">{formatUsd(slice.total)}</span>
                  <span className="legend-share">{formatPercent(slice.share)}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="panel compare-panel">
        {selected ? (
          <DailyComparison category={selected} />
        ) : (
          <div className="compare-empty">
            <h3>Daily spending comparison</h3>
            <p>
              Select a slice of the donut — or a category in the legend — to see
              how that category's spending compared across the 10 cities.
            </p>
            <p className="compare-empty-hint" aria-hidden="true">
              ◆ ◆ ◆ ◆
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
