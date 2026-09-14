import { days, formatDate } from '../lib/trip-data.js'

export default function ItineraryPanel({ day, items }) {
  return (
    <article className="panel-card" aria-live="polite">
      <header className="panel-head">
        <span className="panel-day-badge" aria-hidden="true">
          {day.dayNumber}
        </span>
        <div className="panel-head-text">
          <p className="panel-kicker">Day {day.dayNumber} itinerary</p>
          <h3>{day.city}</h3>
          <p className="panel-meta">
            {formatDate(day.date, { weekday: true })} · {day.country} · {day.landmark}
          </p>
        </div>
      </header>
      <table className="itinerary-table">
        <thead>
          <tr>
            <th scope="col">Time</th>
            <th scope="col">Place</th>
            <th scope="col">Activity</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={`${day.dayId}-${item.order ?? idx}`}>
              <td className="cell-time">{item.time}</td>
              <td className="cell-place">{item.place}</td>
              <td>{item.activity}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <footer className="panel-foot">
        {items.length} stops · Day {day.dayNumber} of {days.length}
      </footer>
    </article>
  )
}
