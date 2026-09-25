import { useState } from 'react'
import JourneyFlow from './components/JourneyFlow.jsx'
import ItineraryPanel from './components/ItineraryPanel.jsx'
import ExpenseExplorer from './components/ExpenseExplorer.jsx'
import {
  days,
  categoryTotals,
  grandTotal,
  countryCount,
  formatDateDayMonth,
  formatMoney,
} from './data.js'

export default function App() {
  const [selectedDayId, setSelectedDayId] = useState(days[0].dayId)
  const selectedDay = days.find((day) => day.dayId === selectedDayId) ?? days[0]

  return (
    <main className="app">
      <header className="hero">
        <p className="eyebrow">A visual travel journal</p>
        <h1>Ten Days in Europe</h1>
        <p className="subtitle">
          {formatDateDayMonth(days[0].date)} – {formatDateDayMonth(days[days.length - 1].date)}, 2026
          {' · '}
          {days.length} cities
          {' · '}
          {countryCount} countries
          {' · '}
          {formatMoney(grandTotal)} spent
        </p>
      </header>

      <section className="section" aria-labelledby="journey-heading">
        <div className="section-head">
          <h2 id="journey-heading">The Journey</h2>
          <p className="section-hint">Select a day to read that day&rsquo;s itinerary.</p>
        </div>
        <div className="card flow-card">
          <div className="flow-scroll">
            <JourneyFlow days={days} selectedDayId={selectedDayId} onSelect={setSelectedDayId} />
          </div>
        </div>
        <ItineraryPanel key={selectedDay.dayId} day={selectedDay} />
      </section>

      <section className="section" aria-labelledby="expenses-heading">
        <div className="section-head">
          <h2 id="expenses-heading">The Spending</h2>
          <p className="section-hint">Select a slice to compare that category across all ten cities.</p>
        </div>
        <ExpenseExplorer days={days} categoryTotals={categoryTotals} grandTotal={grandTotal} />
      </section>

      <footer className="footer">
        Ten days, {countryCount} countries, one journal — built from trip records in project-assets.
      </footer>
    </main>
  )
}
