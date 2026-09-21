import { useState } from 'react'
import { formatDayDate, landmarkImageUrl } from '../data.js'

function LandmarkImage({ day }) {
  const [failed, setFailed] = useState(false)
  const initials = day.city
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return (
    <span className="node-image" aria-hidden="true">
      {failed ? (
        <span className="node-image-fallback">{initials}</span>
      ) : (
        <img
          src={landmarkImageUrl(day)}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  )
}

export default function JourneyFlowchart({ days, selectedDayId, onSelect }) {
  return (
    <div className="flow-scroll" tabIndex={0} role="group" aria-label="Journey flowchart, 10 days, horizontally scrollable">
      <ol className="flow-track">
        {days.map((day, i) => {
          const selected = day.day_id === selectedDayId
          return (
            <li className="flow-item" key={day.day_id} style={{ '--i': i }}>
              {i > 0 && (
                <span className="flow-connector" aria-hidden="true">
                  <span className="flow-connector-line" />
                  <span className="flow-connector-arrow" />
                </span>
              )}
              <button
                type="button"
                className={`flow-node${selected ? ' is-selected' : ''}`}
                aria-pressed={selected}
                aria-label={`Day ${day.day_number}: ${day.city}, ${day.country}, ${formatDayDate(day.date)}. Landmark: ${day.iconic_landmark}. Show itinerary`}
                onClick={() => onSelect(day.day_id)}
              >
                <span className="node-badge">{day.day_number}</span>
                <LandmarkImage day={day} />
                <span className="node-city">{day.city}</span>
                <span className="node-date">{formatDayDate(day.date)}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
