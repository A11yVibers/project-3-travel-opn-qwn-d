import { useState } from 'react'
import { formatDateLong } from '../tripData.js'

export default function ItineraryPanel({ day }) {
  const [failedImageDay, setFailedImageDay] = useState(null)
  if (!day) return null

  const showImage = failedImageDay !== day.dayId

  return (
    <section className="itinerary-card" aria-label={`Day ${day.dayNumber} itinerary — ${day.city}`}>
      <header className="itinerary-head">
        <span className="itin-thumb">
          <span className="node-fallback" aria-hidden="true">{day.city.charAt(0)}</span>
          {showImage && (
            <img
              src={day.imageUrl}
              alt={`${day.landmark}, ${day.city}`}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setFailedImageDay(day.dayId)}
            />
          )}
        </span>
        <div className="itinerary-head-text">
          <p className="eyebrow">Day {day.dayNumber} · {formatDateLong(day.date)}</p>
          <h3>{day.city}, {day.country}</h3>
          <p className="itin-landmark">{day.landmark}</p>
        </div>
      </header>
      <div className="itinerary-table-wrap">
        <table className="itinerary-table">
          <thead>
            <tr>
              <th scope="col">Time</th>
              <th scope="col">Place</th>
              <th scope="col">Activity</th>
            </tr>
          </thead>
          <tbody>
            {day.itinerary.map((item) => (
              <tr key={item.order}>
                <td><span className="time-chip">{item.time}</span></td>
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
