import { useState } from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  LabelList,
} from 'recharts'
import {
  CATEGORIES,
  categoryTotals,
  categoryByDay,
  tripTotal,
  formatUsd,
} from '../data.js'

export default function ExpenseExplorer() {
  const [selectedKey, setSelectedKey] = useState(CATEGORIES[0].key)
  const active = categoryTotals.find((c) => c.key === selectedKey) ?? categoryTotals[0]
  const byDay = categoryByDay.get(active.key) ?? []
  const avg = byDay.length
    ? byDay.reduce((sum, d) => sum + d.amount, 0) / byDay.length
    : 0

  const handleSliceClick = (arg) => {
    const key = arg?.payload?.key ?? arg?.key
    if (typeof key === 'string') setSelectedKey(key)
  }

  return (
    <div className="expense-layout">
      <div className="donut-card">
        <h3 className="card-title">Overall spending</h3>
        <p className="card-sub">{formatUsd(tripTotal)} across the full trip</p>
        <div className="donut-wrap">
          <ResponsiveContainer width="100%" height={290}>
            <PieChart>
              <Pie
                data={categoryTotals}
                dataKey="total"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius="58%"
                outerRadius="86%"
                paddingAngle={2.5}
                stroke="none"
                onClick={handleSliceClick}
              >
                {categoryTotals.map((c) => {
                  const isActive = c.key === active.key
                  return (
                    <Cell
                      key={c.key}
                      fill={c.color}
                      fillOpacity={isActive ? 1 : 0.32}
                      stroke={isActive ? '#fffbf2' : 'transparent'}
                      strokeWidth={isActive ? 2 : 0}
                    />
                  )
                })}
              </Pie>
              <Tooltip
                formatter={(value, name) => [
                  `${formatUsd(value)} · ${((value / tripTotal) * 100).toFixed(1)}%`,
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="donut-center" aria-hidden="true">
            <span className="donut-center-label">{active.label}</span>
            <span className="donut-center-value">{formatUsd(active.total)}</span>
            <span className="donut-center-pct">
              {active.percent.toFixed(0)}% of trip
            </span>
          </div>
        </div>
        <ul className="cat-legend">
          {categoryTotals.map((c) => (
            <li key={c.key}>
              <button
                type="button"
                className={`legend-btn${c.key === active.key ? ' selected' : ''}`}
                onClick={() => setSelectedKey(c.key)}
                aria-pressed={c.key === active.key}
              >
                <span className="legend-swatch" style={{ background: c.color }} />
                <span className="legend-label">{c.label}</span>
                <span className="legend-value">{formatUsd(c.total)}</span>
                <span className="legend-pct">{c.percent.toFixed(0)}%</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="legend-hint">Select a slice to compare spending by city</p>
      </div>

      <div className="compare-card">
        <h3 className="card-title">
          <span className="compare-dot" style={{ background: active.color }} />
          {active.label} by city
        </h3>
        <p className="card-sub">
          Daily {active.label.toLowerCase()} spend in each of the 10 destinations
          {' · '}average {formatUsd(Math.round(avg))}
        </p>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={byDay} margin={{ top: 26, right: 10, left: 2, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 4" vertical={false} stroke="#e6d9bf" />
            <XAxis
              dataKey="city"
              interval={0}
              angle={-32}
              textAnchor="end"
              height={66}
              tick={{ fontSize: 11.5, fill: '#6f6150' }}
              tickLine={false}
              axisLine={{ stroke: '#d8c9ae' }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#6f6150' }}
              tickFormatter={(v) => `$${v}`}
              width={46}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(111, 97, 80, 0.08)' }}
              formatter={(value) => [formatUsd(value), active.label]}
              labelFormatter={(label, payload) => {
                const n = payload?.[0]?.payload?.dayNumber
                return n ? `Day ${n} · ${label}` : label
              }}
            />
            <ReferenceLine
              y={avg}
              stroke={active.color}
              strokeDasharray="6 5"
              strokeOpacity={0.75}
              label={{
                value: 'avg',
                position: 'insideTopRight',
                fill: '#6f6150',
                fontSize: 10,
              }}
            />
            <Bar
              dataKey="amount"
              fill={active.color}
              radius={[6, 6, 0, 0]}
              maxBarSize={46}
              animationDuration={450}
            >
              <LabelList
                dataKey="amount"
                position="top"
                formatter={(v) => formatUsd(v)}
                style={{ fontSize: 10, fill: '#6f6150' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
