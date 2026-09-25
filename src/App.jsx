import { useRef, useState } from 'react'
import JourneyFlow from './components/JourneyFlow.jsx'
import DayDetail from './components/DayDetail.jsx'
import ExpenseExplorer from './components/ExpenseExplorer.jsx'
import {
  tripDays,
  getDay,
  getItinerary,
  formatDate,
  tripTotal,
  formatUsd,
} from './data.js'

export default function App() {
  const [selectedDayId, setSelectedDayId] = useState(tripDays[0].dayId)
  const panelRef = useRef(null)
  const day = getDay(selectedDayId) ?? tripDays[0]

  const countryCount = new Set(tripDays.map((d) => d.country)).size
  const first = tripDays[0]
  const last = tripDays[tripDays.length - 1]

  const selectDay = (dayId) => {
    setSelectedDayId(dayId)
    requestAnimationFrame(() => {
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }

  return (
    <div className="page">
      <header className="masthead">
        <p className="masthead-kicker">A visual travel journal</p>
        <h1 className="masthead-title">Ten Days in Europe</h1>
        <p className="masthead-route">{tripDays.map((d) => d.city).join(' → ')}</p>
        <p className="masthead-meta">
          {formatDate(first.date, { month: 'long', day: 'numeric' })} –{' '}
          {formatDate(last.date, { month: 'long', day: 'numeric', year: 'numeric' })}
          {' · '}
          {tripDays.length} cities
          {' · '}
          {countryCount} countries
          {' · '}
          {formatUsd(tripTotal)} spent
        </p>
      </header>

      <main>
        <section className="section" id="journey" aria-labelledby="journey-title">
          <div className="section-head">
            <h2 id="journey-title">The Journey</h2>
            <p className="section-blurb">
              One new city each day. Select a stop to open its itinerary.
            </p>
          </div>
          <div className="journey-layout">
            <JourneyFlow
              days={tripDays}
              selectedDayId={selectedDayId}
              onSelectDay={selectDay}
            />
            <DayDetail day={day} items={getItinerary(day.dayId)} panelRef={panelRef} />
          </div>
        </section>

        <section className="section" id="expenses" aria-labelledby="expenses-title">
          <div className="section-head">
            <h2 id="expenses-title">Trip Expenses</h2>
            <p className="section-blurb">
              Where the money went — pick a category to compare it across all ten
              destinations.
            </p>
          </div>
          <ExpenseExplorer />
        </section>
      </main>

      <footer className="colophon">
        <p>
          Kept from trip_days.csv, itinerary.csv and expenses.csv · Landmark photos
          via Wikimedia Commons
        </p>
      </footer>
    </div>
  )
}
