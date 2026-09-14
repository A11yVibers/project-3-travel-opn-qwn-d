import { Fragment, useRef, useState } from 'react'
import { days, itineraryByDayId, formatDate } from '../lib/trip-data.js'
import ItineraryPanel from './ItineraryPanel.jsx'

function LandmarkImage({ day }) {
  const [failed, setFailed] = useState(false)
  if (failed || !day.imageUrl) {
    return <span className="diamond-fallback">{day.city.slice(0, 2).toUpperCase()}</span>
  }
  return (
    <img
      src={day.imageUrl}
      alt={`${day.landmark} in ${day.city}`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}

export default function JourneyTimeline() {
  const [selectedDayId, setSelectedDayId] = useState(days[0]?.dayId ?? null)
  const panelRef = useRef(null)
  const selectedDay = days.find((d) => d.dayId === selectedDayId) ?? days[0]

  function selectDay(dayId) {
    setSelectedDayId(dayId)
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 980px)').matches) {
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section className="section" aria-labelledby="journey-heading">
      <header className="section-head">
        <p className="section-kicker">The Route</p>
        <h2 id="journey-heading">The Journey, Day by Day</h2>
        <p className="section-sub">
          One new city every morning. Select a stop on the route to open that day's itinerary.
        </p>
      </header>
      <div className="journey-layout">
        <ol className="timeline">
          {days.map((day, index) => (
            <Fragment key={day.dayId}>
              {index > 0 && (
                <li className="route-arrow" aria-hidden="true">
                  <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                    <path
                      d="M1.5 1.5L8 8l6.5-6.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </li>
              )}
              <li className={day.dayId === selectedDay?.dayId ? 'timeline-node selected' : 'timeline-node'}>
                <button
                  type="button"
                  aria-pressed={day.dayId === selectedDay?.dayId}
                  onClick={() => selectDay(day.dayId)}
                >
                  <span className="day-badge">Day {String(day.dayNumber).padStart(2, '0')}</span>
                  <span className="diamond-frame">
                    <span className="diamond">
                      <LandmarkImage day={day} />
                    </span>
                  </span>
                  <span className="node-labels">
                    <span className="city">{day.city}</span>
                    <span className="date">{formatDate(day.date, { weekday: true })}</span>
                    <span className="country">{day.country}</span>
                  </span>
                </button>
              </li>
            </Fragment>
          ))}
        </ol>
        <div className="journey-panel" ref={panelRef}>
          {selectedDay && (
            <ItineraryPanel day={selectedDay} items={itineraryByDayId.get(selectedDay.dayId) ?? []} />
          )}
        </div>
      </div>
    </section>
  )
}
