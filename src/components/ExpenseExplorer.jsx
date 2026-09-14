import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { categoryTotals, formatPct, formatUsd, grandTotal, spendMatrix } from '../lib/trip-data.js'

const PANEL_BG = '#fbf6ea'

const TOOLTIP_PROPS = {
  contentStyle: {
    background: '#fffdf6',
    border: '1px solid #e2d8c2',
    borderRadius: 10,
    fontSize: 13,
    boxShadow: '0 8px 20px rgba(60,48,25,0.12)',
  },
  labelStyle: { fontWeight: 700, color: '#2f2a23' },
}

const categoryKeyOf = (datum) => datum?.payload?.key ?? datum?.key ?? null

export default function ExpenseExplorer() {
  const [selectedKey, setSelectedKey] = useState(categoryTotals[0].key)
  const [hoveredKey, setHoveredKey] = useState(null)
  const selected = categoryTotals.find((c) => c.key === selectedKey) ?? categoryTotals[0]
  const focused = categoryTotals.find((c) => c.key === hoveredKey) ?? selected
  const perDay = spendMatrix[selected.key] ?? []

  return (
    <section className="section" aria-labelledby="expense-heading">
      <header className="section-head">
        <p className="section-kicker">The Ledger</p>
        <h2 id="expense-heading">Where the Money Went</h2>
        <p className="section-sub">
          Every expense from the trip, grouped into four categories. Select a slice to compare that
          category across the ten cities.
        </p>
      </header>
      <div className="expense-layout">
        <div className="panel-card donut-card">
          <div className="donut-wrap">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryTotals}
                  dataKey="value"
                  nameKey="label"
                  innerRadius="58%"
                  outerRadius="84%"
                  paddingAngle={2}
                  cursor="pointer"
                  onClick={(datum) => {
                    const key = categoryKeyOf(datum)
                    if (key) setSelectedKey(key)
                  }}
                  onMouseEnter={(datum) => setHoveredKey(categoryKeyOf(datum))}
                  onMouseLeave={() => setHoveredKey(null)}
                >
                  {categoryTotals.map((cat) => (
                    <Cell
                      key={cat.key}
                      className="donut-slice"
                      fill={cat.color}
                      stroke={cat.key === selectedKey ? cat.ink : PANEL_BG}
                      strokeWidth={cat.key === selectedKey ? 3 : 2}
                      opacity={cat.key === selectedKey ? 1 : 0.55}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${formatUsd(value)} · ${formatPct(value, grandTotal)}`, name]}
                  {...TOOLTIP_PROPS}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-center">
              <span className="dc-label" style={{ color: focused.ink }}>
                {focused.label}
              </span>
              <span className="dc-value">{formatUsd(focused.value)}</span>
              <span className="dc-pct">
                {formatPct(focused.value, grandTotal)} of {formatUsd(grandTotal)}
              </span>
            </div>
          </div>
          <ul className="cat-chips">
            {categoryTotals.map((cat) => (
              <li key={cat.key}>
                <button
                  type="button"
                  className={cat.key === selectedKey ? 'chip active' : 'chip'}
                  aria-pressed={cat.key === selectedKey}
                  onClick={() => setSelectedKey(cat.key)}
                  style={
                    cat.key === selectedKey
                      ? { borderColor: cat.color, background: `${cat.color}12` }
                      : undefined
                  }
                >
                  <span className="chip-dot" style={{ background: cat.color }} />
                  <span className="chip-label">{cat.label}</span>
                  <span className="chip-value">
                    {formatUsd(cat.value)} · {formatPct(cat.value, grandTotal)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="panel-card compare-card" aria-live="polite">
          <header className="compare-head">
            <h3>
              <span className="compare-swatch" style={{ background: selected.color }} aria-hidden="true" />
              {selected.label} by city
            </h3>
            <p className="panel-meta">
              What each of the ten stops cost for {selected.label.toLowerCase()} — {formatUsd(selected.value)}{' '}
              in total.
            </p>
          </header>
          <ResponsiveContainer width="100%" height={430}>
            <BarChart data={perDay} layout="vertical" margin={{ top: 6, right: 64, bottom: 6, left: 6 }}>
              <CartesianGrid strokeDasharray="3 4" horizontal={false} stroke="#e9e0cb" />
              <XAxis
                type="number"
                tickFormatter={(v) => `$${v}`}
                tick={{ fontSize: 12, fill: '#7d7364' }}
                axisLine={{ stroke: '#e2d8c2' }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="city"
                width={94}
                tick={{ fontSize: 12.5, fill: '#2f2a23' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => [formatUsd(value), selected.label]}
                cursor={{ fill: 'rgba(122,113,99,0.08)' }}
                {...TOOLTIP_PROPS}
              />
              <Bar dataKey="amount" fill={selected.color} radius={[0, 7, 7, 0]} maxBarSize={20} animationDuration={450}>
                <LabelList
                  dataKey="amount"
                  position="right"
                  formatter={(v) => formatUsd(Number(v))}
                  style={{ fontSize: 11.5, fill: '#7d7363' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  )
}
