import { useState } from 'react'
import JourneyFlowchart from './components/JourneyFlowchart.jsx'
import ItineraryPanel from './components/ItineraryPanel.jsx'
import ExpenseExplorer from './components/ExpenseExplorer.jsx'
import { countryCount, days, grandTotal, itineraryByDay } from './lib/trip-data.js'

const stopCount = Object.values(itineraryByDay).reduce((n, items) => n + items.length, 0)

export default function App() {
  const [selectedDayId, setSelectedDayId] = useState(days[0].dayId)
  const selectedDay = days.find((d) => d.dayId === selectedDayId) ?? days[0]

  return (
    <div className="page">
      <header className="masthead">
        <p className="eyebrow">A visual travel journal</p>
        <h1>Ten Days in Europe</h1>
        <p className="tagline">London to Rome · June 1–10, 2026 · one new city every day</p>
        <ul className="stat-chips">
          <li>{days.length} cities</li>
          <li>{countryCount} countries</li>
          <li>{stopCount} itinerary stops</li>
          <li>{`$${grandTotal.toLocaleString('en-US')}`} total spend</li>
        </ul>
      </header>

      <main>
        <section className="section" aria-labelledby="journey-title">
          <div className="section-head">
            <p className="eyebrow">The route</p>
            <h2 id="journey-title">Journey flowchart</h2>
            <p className="section-sub">
              Ten days connected in order, each framed around an iconic landmark.
              Select a city to reveal that day&rsquo;s itinerary.
            </p>
          </div>
          <div className="card flow-card">
            <JourneyFlowchart selectedDayId={selectedDayId} onSelectDay={setSelectedDayId} />
          </div>
          <div className="card itinerary-card">
            <ItineraryPanel day={selectedDay} />
          </div>
        </section>

        <section className="section" aria-labelledby="expense-title">
          <div className="section-head">
            <p className="eyebrow">The money</p>
            <h2 id="expense-title">Expense breakdown</h2>
            <p className="section-sub">
              Total spending grouped into four categories. Select a slice to compare
              that category across all ten days and cities.
            </p>
          </div>
          <ExpenseExplorer />
        </section>
      </main>

      <footer className="footer">
        <p>
          Landmark photos via Wikimedia Commons · Built from trip_days.csv,
          itinerary.csv, and expenses.csv
        </p>
      </footer>
    </div>
  )
}
