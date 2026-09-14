import { useEffect } from 'react'
import JourneyTimeline from './components/JourneyTimeline.jsx'
import ExpenseExplorer from './components/ExpenseExplorer.jsx'
import { dateRangeLabel, formatUsd, grandTotal, stats } from './lib/trip-data.js'

export default function App() {
  useEffect(() => {
    document.title = 'Ten Days in Europe · A Visual Travel Journal'
  }, [])

  return (
    <div className="page">
      <header className="masthead">
        <p className="masthead-kicker">A Visual Travel Journal</p>
        <h1>Ten Days in Europe</h1>
        <p className="masthead-route">
          {stats.firstCity} → {stats.lastCity} · {dateRangeLabel}
        </p>
        <div className="masthead-rule" aria-hidden="true">
          <span />
        </div>
        <ul className="masthead-stats">
          <li>
            <strong>{stats.dayCount}</strong>
            <span>Days</span>
          </li>
          <li>
            <strong>{stats.cityCount}</strong>
            <span>Cities</span>
          </li>
          <li>
            <strong>{stats.countryCount}</strong>
            <span>Countries</span>
          </li>
          <li>
            <strong>{formatUsd(grandTotal)}</strong>
            <span>Spent</span>
          </li>
        </ul>
      </header>
      <main>
        <JourneyTimeline />
        <ExpenseExplorer />
      </main>
      <footer className="colophon">
        Compiled from the trip logbook — route, daily itineraries, and expenses.
      </footer>
    </div>
  )
}
