import { useState } from 'react'
import { categoryTotals, dailyCategoryTotals, grandTotal } from '../lib/trip-data.js'

const CX = 170
const CY = 170
const R_OUT = 138
const R_IN = 84
const PAD_DEG = 1.6
const POP = 10

const VALUE_ZONE = 22
const TRACK_H = 240
const AREA_H = VALUE_ZONE + TRACK_H
const GRID_FRACTIONS = [1, 0.5, 0]

const money = (n) => `$${Math.round(n).toLocaleString('en-US')}`

function polar(r, angleDeg) {
  const a = ((angleDeg - 90) * Math.PI) / 180
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)]
}

function ringPath(startAngle, endAngle) {
  const sweep = endAngle - startAngle
  if (sweep >= 359.99) {
    const half = startAngle + 180
    return `${ringPath(startAngle, half)} ${ringPath(half, startAngle + 359.98)}`
  }
  const large = sweep > 180 ? 1 : 0
  const [x1, y1] = polar(R_OUT, startAngle)
  const [x2, y2] = polar(R_OUT, endAngle)
  const [x3, y3] = polar(R_IN, endAngle)
  const [x4, y4] = polar(R_IN, startAngle)
  const f = (v) => v.toFixed(2)
  return `M ${f(x1)} ${f(y1)} A ${R_OUT} ${R_OUT} 0 ${large} 1 ${f(x2)} ${f(y2)} L ${f(x3)} ${f(y3)} A ${R_IN} ${R_IN} 0 ${large} 0 ${f(x4)} ${f(y4)} Z`
}

const slices = (() => {
  let angle = 0
  return categoryTotals.map((cat) => {
    const sweep = (cat.total / grandTotal) * 360
    const slice = { ...cat, start: angle, end: angle + sweep, mid: angle + sweep / 2, pct: (cat.total / grandTotal) * 100 }
    angle += sweep
    return slice
  })
})()

function Donut({ selectedKey, onSelect }) {
  const selected = slices.find((s) => s.key === selectedKey)
  return (
    <svg className="donut-svg" viewBox="0 0 340 340" role="group" aria-label="Total spending by category">
      {slices.map((s) => {
        const isSelected = s.key === selectedKey
        const dx = isSelected ? POP * Math.sin((s.mid * Math.PI) / 180) : 0
        const dy = isSelected ? -POP * Math.cos((s.mid * Math.PI) / 180) : 0
        const pad = s.end - s.start > 8 ? PAD_DEG : 0
        return (
          <path
            key={s.key}
            className={`slice${isSelected ? ' selected' : ''}`}
            d={ringPath(s.start + pad, s.end - pad)}
            fill={s.color}
            style={{ transform: `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px)` }}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            aria-label={`${s.label}: ${money(s.total)}, ${s.pct.toFixed(1)} percent of total spending. Show daily comparison.`}
            onClick={() => onSelect(s.key)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect(s.key)
              }
            }}
          >
            <title>{`${s.label} — ${money(s.total)} (${s.pct.toFixed(1)}%)`}</title>
          </path>
        )
      })}
      <g className="donut-center" aria-hidden="true">
        <text className="donut-label" x={CX} y={CY - 26} textAnchor="middle">
          {selected.label.toUpperCase()}
        </text>
        <text className="donut-amount" x={CX} y={CY + 8} textAnchor="middle">
          {money(selected.total)}
        </text>
        <text className="donut-pct" x={CX} y={CY + 32} textAnchor="middle">
          {selected.pct.toFixed(1)}% of {money(grandTotal)}
        </text>
      </g>
    </svg>
  )
}

function DailyBars({ slice }) {
  const perDay = dailyCategoryTotals[slice.key]
  const max = Math.max(...perDay.map((d) => d.amount))
  const niceMax = Math.max(Math.ceil(max / 50) * 50, 50)
  const summary = perDay.map((d) => `${d.city} ${money(d.amount)}`).join(', ')
  return (
    <div className="chart-scroll">
      <div className="bar-chart" key={slice.key}>
        <div className="chart-area" style={{ height: AREA_H }}>
          <div className="grid" aria-hidden="true">
            {GRID_FRACTIONS.map((f) => (
              <div
                className="grid-line"
                key={f}
                style={{ top: VALUE_ZONE + (1 - f) * TRACK_H }}
              >
                <span className="grid-label">{money(f * niceMax)}</span>
              </div>
            ))}
          </div>
          <div
            className="bars"
            role="img"
            aria-label={`${slice.label} spending by day. ${summary}.`}
            style={{ height: AREA_H }}
          >
            {perDay.map((d, i) => (
              <div className="bar-col" key={d.dayNumber}>
                <span className="bar-value">{money(d.amount)}</span>
                <div className="bar-track">
                  <div
                    className="bar"
                    style={{
                      '--bar-h': `${((d.amount / niceMax) * 100).toFixed(2)}%`,
                      '--i': i,
                      background: slice.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bar-labels" aria-hidden="true">
          {perDay.map((d) => (
            <div className="bar-label-col" key={d.dayNumber}>
              <span className="bar-city">{d.city}</span>
              <span className="bar-day">Day {d.dayNumber}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ExpenseExplorer() {
  const [selectedKey, setSelectedKey] = useState(categoryTotals[0].key)
  const selected = slices.find((s) => s.key === selectedKey)
  return (
    <div className="expense-grid">
      <div className="card donut-card">
        <p className="eyebrow">Overall distribution</p>
        <h3 className="card-title">Spending by category</h3>
        <div className="donut-wrap">
          <Donut selectedKey={selectedKey} onSelect={setSelectedKey} />
        </div>
        <div className="legend">
          {slices.map((s) => {
            const isSelected = s.key === selectedKey
            return (
              <button
                type="button"
                key={s.key}
                className="legend-item"
                aria-pressed={isSelected}
                onClick={() => setSelectedKey(s.key)}
                style={
                  isSelected
                    ? { borderColor: s.color, background: `${s.color}14` }
                    : undefined
                }
              >
                <span className="legend-top">
                  <span className="legend-swatch" style={{ background: s.color }} />
                  <span className="legend-label">{s.label}</span>
                </span>
                <span className="legend-value">
                  {money(s.total)} · {s.pct.toFixed(1)}%
                </span>
              </button>
            )
          })}
        </div>
      </div>
      <div className="card detail-panel">
        <header className="detail-head">
          <p className="eyebrow">Daily comparison</p>
          <h3>
            <span className="detail-swatch" style={{ background: selected.color }} aria-hidden="true" />
            {selected.label} across the 10 cities
          </h3>
          <p className="detail-sub">
            How much went to {selected.label.toLowerCase()} on each day of the trip —
            total {money(selected.total)}. Select another slice to compare a different
            category.
          </p>
        </header>
        <DailyBars slice={selected} />
      </div>
    </div>
  )
}
