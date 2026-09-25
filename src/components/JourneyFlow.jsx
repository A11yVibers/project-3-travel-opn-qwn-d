import { Fragment, useState } from 'react'
import { formatDateShort } from '../tripData.js'

function DayNode({ day, selected, imageFailed, onSelect, onImageError }) {
  return (
    <button
      type="button"
      className={`day-node${selected ? ' selected' : ''}`}
      onClick={() => onSelect(day.dayId)}
      aria-pressed={selected}
      title={`Day ${day.dayNumber} — ${day.city}: show itinerary`}
    >
      <span className="node-badge" aria-hidden="true">{day.dayNumber}</span>
      <span className="node-ring">
        <span className="node-img">
          <span className="node-fallback" aria-hidden="true">{day.city.charAt(0)}</span>
          {!imageFailed && (
            <img
              src={day.imageUrl}
              alt={`${day.landmark}, ${day.city}`}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={onImageError}
            />
          )}
        </span>
      </span>
      <span className="node-city">{day.city}</span>
      <span className="node-date">{formatDateShort(day.date)}</span>
    </button>
  )
}

function FlowLink({ reversed }) {
  return <span className={`flow-link${reversed ? ' reversed' : ''}`} aria-hidden="true" />
}

export default function JourneyFlow({ days, selectedDayId, onSelect }) {
  const [failedImages, setFailedImages] = useState(() => new Set())
  const markFailed = (dayId) =>
    setFailedImages((prev) => {
      if (prev.has(dayId)) return prev
      const next = new Set(prev)
      next.add(dayId)
      return next
    })

  const rows = [days.slice(0, 5), days.slice(5, 10)]

  return (
    <div className="flow" role="group" aria-label="Journey flowchart, 10 days">
      {rows.map((row, rowIndex) => (
        <Fragment key={rowIndex}>
          {rowIndex === 1 && (
            <div className="flow-turn" aria-hidden="true">
              <span className="turn-line" />
            </div>
          )}
          <div className={`flow-row${rowIndex === 1 ? ' reversed' : ''}`}>
            {row.map((day, i) => (
              <Fragment key={day.dayId}>
                {i > 0 && <FlowLink reversed={rowIndex === 1} />}
                <DayNode
                  day={day}
                  selected={day.dayId === selectedDayId}
                  imageFailed={failedImages.has(day.dayId)}
                  onSelect={onSelect}
                  onImageError={() => markFailed(day.dayId)}
                />
              </Fragment>
            ))}
          </div>
        </Fragment>
      ))}
    </div>
  )
}
