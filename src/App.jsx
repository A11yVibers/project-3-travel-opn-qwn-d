import { useState } from 'react'
import JourneyFlowchart from './components/JourneyFlowchart.jsx'
import ItineraryPanel from './components/ItineraryPanel.jsx'
import ExpenseExplorer from './components/ExpenseExplorer.jsx'
import {
  formatDayDate,
  grandTotal,
  itineraryByDay,
  tripDays,
  formatUsd,
} from './data.js'

export default function App() {
  const [selectedDayId, setSelectedDayId] = useState(tripDays[0].day_id)
  const selectedDay =
    tripDays.find((d) => d.day_id === selectedDayId) ?? tripDays[0]
  const countryCount = new Set(tripDays.map((d) => d.country)).size
  const stopCount = Object.values(itineraryByDay).reduce(
    (acc, items) => acc + items.length,
    0,
  )

  return (
    <div className="page">
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <header className="hero">
        <p className="hero-kicker">A visual travel journal</p>
        <h1 className="hero-title">Ten Days in Europe</h1>
        <p className="hero-route">
          {tripDays[0].city} to {tripDays[tripDays.length - 1].city} &middot;{' '}
          {formatDayDate(tripDays[0].date)} &ndash;{' '}
          {formatDayDate(tripDays[tripDays.length - 1].date)}
        </p>
        <div className="hero-divider" aria-hidden="true">
          <span className="hero-rule" />
          <span className="hero-diamond" />
          <span className="hero-rule" />
        </div>
        <ul className="hero-stats">
          <li>
            <strong>{tripDays.length}</strong> cities
          </li>
          <li>
            <strong>{countryCount}</strong> countries
          </li>
          <li>
            <strong>{stopCount}</strong> itinerary stops
          </li>
          <li>
            <strong>{formatUsd(grandTotal)}</strong> spent
          </li>
        </ul>
      </header>

      <main id="main">
        <section className="section" aria-labelledby="journey-heading">
          <div className="section-head">
            <h2 id="journey-heading">The Journey</h2>
            <p className="section-note">
              One new city each day. Select a day to read its itinerary.
            </p>
          </div>
          <JourneyFlowchart
            days={tripDays}
            selectedDayId={selectedDayId}
            onSelect={setSelectedDayId}
          />
          <ItineraryPanel day={selectedDay} />
        </section>

        <section className="section" aria-labelledby="expenses-heading">
          <div className="section-head">
            <h2 id="expenses-heading">The Expenses</h2>
            <p className="section-note">
              Every euro, forint and penny of the trip, in four categories.
              Select a slice to compare daily spending across the cities.
            </p>
          </div>
          <ExpenseExplorer />
        </section>
      </main>

      <footer className="footer">
        <p>
          Trip data from <code>trip_days.csv</code>,{' '}
          <code>itinerary.csv</code> and <code>expenses.csv</code>. Landmark
          photos via Wikimedia Commons.
        </p>
      </footer>
    </div>
  )
}
