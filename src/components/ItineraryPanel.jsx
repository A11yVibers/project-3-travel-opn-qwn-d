import { itineraryByDay } from '../lib/trip-data.js'

export default function ItineraryPanel({ day }) {
  const items = itineraryByDay[day.dayId] ?? []
  return (
    <section
      className="itinerary"
      aria-label={`Itinerary for day ${day.dayNumber}, ${day.city}`}
      aria-live="polite"
    >
      <header className="itinerary-head">
        <div>
          <p className="eyebrow">Day {day.dayNumber} of 10 · Itinerary</p>
          <h3>
            {day.city}, {day.country}
          </h3>
          <p className="itinerary-meta">
            {day.dateLabel} · Landmark of the day: {day.landmark}
          </p>
        </div>
        <p className="itinerary-hint">{items.length} stops</p>
      </header>
      <div className="table-wrap">
        <table className="itinerary-table">
          <thead>
            <tr>
              <th scope="col">Time</th>
              <th scope="col">Place</th>
              <th scope="col">Activity</th>
            </tr>
          </thead>
          <tbody key={day.dayId}>
            {items.map((item) => (
              <tr key={item.order} style={{ '--i': item.order - 1 }}>
                <td className="t-time">{item.time}</td>
                <td className="t-place">{item.place}</td>
                <td className="t-activity">{item.activity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
