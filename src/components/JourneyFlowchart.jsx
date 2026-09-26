import { useLayoutEffect, useRef, useState } from 'react'
import { days } from '../lib/trip-data.js'

const CANVAS_W = 1240
const CANVAS_H = 640
const MIN_SCALE = 0.42
const XS = [110, 355, 600, 845, 1090]
const ROW_1_Y = 120
const ROW_2_Y = 460

function centerFor(dayNumber) {
  return dayNumber <= 5
    ? { x: XS[dayNumber - 1], y: ROW_1_Y }
    : { x: XS[10 - dayNumber], y: ROW_2_Y }
}

function FlowConnectors() {
  const paths = []
  for (let i = 0; i < 4; i += 1) {
    paths.push(`M ${XS[i] + 92} ${ROW_1_Y} L ${XS[i + 1] - 97} ${ROW_1_Y}`)
  }
  for (let i = 0; i < 4; i += 1) {
    paths.push(`M ${XS[4 - i] - 92} ${ROW_2_Y} L ${XS[3 - i] + 97} ${ROW_2_Y}`)
  }
  paths.push(`M 1178 ${ROW_1_Y + 8} C 1236 ${ROW_1_Y + 56}, 1236 ${ROW_2_Y - 56}, 1182 ${ROW_2_Y - 6}`)
  return (
    <svg
      className="flow-connectors"
      width={CANVAS_W}
      height={CANVAS_H}
      viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <marker
          id="journey-arrow"
          markerUnits="userSpaceOnUse"
          markerWidth="12"
          markerHeight="12"
          viewBox="0 0 12 12"
          refX="9.5"
          refY="6"
          orient="auto"
        >
          <path d="M2,1.5 L10,6 L2,10.5 Z" fill="#b4553c" fillOpacity="0.7" />
        </marker>
      </defs>
      {paths.map((d) => (
        <path key={d} className="connector" d={d} markerEnd="url(#journey-arrow)" />
      ))}
    </svg>
  )
}

function FlowNode({ day, selected, onSelect }) {
  const [imgFailed, setImgFailed] = useState(false)
  const { x, y } = centerFor(day.dayNumber)
  return (
    <button
      type="button"
      className="flow-node"
      style={{ left: x - 100, top: y - 80 }}
      aria-pressed={selected}
      aria-label={`Day ${day.dayNumber}: ${day.city}, ${day.dateLabel}. Show this day's itinerary.`}
      onClick={() => onSelect(day.dayId)}
    >
      <span className="flow-badge" aria-hidden="true">
        {day.dayNumber}
      </span>
      <span className="flow-diamond" aria-hidden="true">
        <span className="flow-diamond-inner">
          <span className="flow-fallback">{day.city.charAt(0)}</span>
          {!imgFailed && (
            <img
              src={day.imageUrl}
              alt=""
              loading="lazy"
              onError={() => setImgFailed(true)}
            />
          )}
        </span>
      </span>
      <span className="flow-city" aria-hidden="true">
        {day.city}
      </span>
      <span className="flow-date" aria-hidden="true">
        {day.dateLabel}
      </span>
    </button>
  )
}

export default function JourneyFlowchart({ selectedDayId, onSelectDay }) {
  const viewportRef = useRef(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const el = viewportRef.current
    if (!el) return undefined
    const update = () => {
      const w = el.clientWidth
      setScale(Math.min(1, Math.max(w / CANVAS_W, MIN_SCALE)))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div className="flow-viewport" ref={viewportRef}>
      <div
        className="flow-sizer"
        style={{ width: CANVAS_W * scale, height: CANVAS_H * scale }}
      >
        <div
          className="flow-canvas"
          style={{ width: CANVAS_W, height: CANVAS_H, transform: `scale(${scale})` }}
          role="group"
          aria-label="Journey flowchart: ten days, ten cities, connected in order"
        >
          <FlowConnectors />
          {days.map((day) => (
            <FlowNode
              key={day.dayId}
              day={day}
              selected={day.dayId === selectedDayId}
              onSelect={onSelectDay}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
