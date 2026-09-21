import { formatDayDateLong, formatTime, itineraryByDay } from '../data.js'

export default function ItineraryPanel({ day }) {
  const items = itineraryByDay[day.day_id] ?? []
  return (
    <section
      className="panel itinerary-panel"
      aria-live="polite"
      aria-label={`Itinerary for day ${day.day_number}`}
    >
      <header className="panel-header">
        <p className="panel-kicker">
          Day {day.day_number} of 10 &middot; {formatDayDateLong(day.date)}
        </p>
        <h3 className="panel-title">
          {day.city}
          <span className="panel-country">, {day.country}</span>
        </h3>
        <p className="panel-subtitle">
          Landmark of the day: {day.iconic_landmark}
        </p>
      </header>
      <div
        className="table-scroll"
        tabIndex={0}
        role="group"
        aria-label="Itinerary table, horizontally scrollable"
      >
        <table className="itinerary-table">
          <caption className="visually-hidden">
            Itinerary for day {day.day_number} in {day.city}: time, place, and
            activity for each stop
          </caption>
          <thead>
            <tr>
              <th scope="col">Time</th>
              <th scope="col">Place</th>
              <th scope="col">Activity</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={`${item.day_id}-${item.item_order}`}>
                <td className="cell-time">{formatTime(item.time)}</td>
                <td className="cell-place">{item.place}</td>
                <td className="cell-activity">{item.activity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
