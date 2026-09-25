import { formatDate } from '../data.js'

export default function JourneyFlow({ days, selectedDayId, onSelectDay }) {
  return (
    <ol className="timeline" aria-label="Trip journey, day by day">
      <li className="timeline-cap" aria-hidden="true">
        <span className="cap-dot" />
        <span className="rail" />
      </li>
      {days.map((day, i) => {
        const selected = day.dayId === selectedDayId
        return (
          <li
            key={day.dayId}
            className={`timeline-node${selected ? ' selected' : ''}`}
            style={{ '--i': i }}
          >
            {i > 0 && (
              <span className="rail" aria-hidden="true">
                <span className="rail-arrow" />
              </span>
            )}
            <button
              type="button"
              className="node-card"
              onClick={() => onSelectDay(day.dayId)}
              aria-pressed={selected}
              aria-label={`Day ${day.dayNumber}, ${day.city}, ${formatDate(day.date, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}. Show itinerary.`}
            >
              <span className="node-badge">Day {day.dayNumber}</span>
              <span className="node-frame">
                <img
                  src={day.imageUrl}
                  alt={`${day.landmark}, ${day.city}`}
                  loading="lazy"
                  decoding="async"
                />
              </span>
              <span className="node-city">{day.city}</span>
              <span className="node-date">
                {formatDate(day.date, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </button>
          </li>
        )
      })}
      <li className="timeline-cap" aria-hidden="true">
        <span className="rail">
          <span className="rail-arrow" />
        </span>
        <span className="cap-dot cap-dot-end" />
      </li>
    </ol>
  )
}
