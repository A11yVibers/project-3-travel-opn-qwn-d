import { formatDate } from '../data.js'

export default function DayDetail({ day, items, panelRef }) {
  return (
    <section className="day-panel" ref={panelRef} aria-label={`Itinerary for day ${day.dayNumber}`}>
      <header className="day-panel-head" aria-live="polite">
        <p className="panel-kicker">
          Day {day.dayNumber} &middot;{' '}
          {formatDate(day.date, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
        <h3 className="panel-city">
          {day.city}
          <span className="panel-country">, {day.country}</span>
        </h3>
        <p className="panel-landmark">{day.landmark}</p>
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
          {items.map((item) => (
            <tr key={`${item.dayId}-${item.order}`}>
              <td className="cell-time">{item.time}</td>
              <td className="cell-place">{item.place}</td>
              <td className="cell-activity">{item.activity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
