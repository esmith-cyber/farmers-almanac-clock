import { useEffect, useState } from 'react'

function AnnualEventsClock({ currentDate, onEventsChange }) {
  const [rotation, setRotation] = useState(0)
  const [events, setEvents] = useState(() => {
    // Load events from localStorage
    const saved = localStorage.getItem('annualEvents')
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'New Year', month: 1, day: 1, color: '#60a5fa' },
      { id: 2, name: 'Valentine\'s Day', month: 2, day: 14, color: '#f472b6' },
      { id: 3, name: 'Spring Equinox', month: 3, day: 20, color: '#4ade80' },
      { id: 4, name: 'Summer Solstice', month: 6, day: 21, color: '#fbbf24' },
      { id: 5, name: 'Autumn Equinox', month: 9, day: 22, color: '#fb923c' },
      { id: 6, name: 'Winter Solstice', month: 12, day: 21, color: '#a78bfa' },
    ]
  })

  // Save events to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('annualEvents', JSON.stringify(events))
    if (onEventsChange) {
      onEventsChange(events)
    }
  }, [events, onEventsChange])

  // Zodiac sign data with date ranges and colors
  const zodiacSigns = [
    { name: 'Aries', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19, angle: 0, color: '#ef4444' },
    { name: 'Taurus', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20, angle: 30, color: '#4ade80' },
    { name: 'Gemini', startMonth: 5, startDay: 21, endMonth: 6, endDay: 20, angle: 60, color: '#fbbf24' },
    { name: 'Cancer', startMonth: 6, startDay: 21, endMonth: 7, endDay: 22, angle: 90, color: '#e0e7ff' },
    { name: 'Leo', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22, angle: 120, color: '#fb923c' },
    { name: 'Virgo', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22, angle: 150, color: '#a78bfa' },
    { name: 'Libra', startMonth: 9, startDay: 23, endMonth: 10, endDay: 22, angle: 180, color: '#f472b6' },
    { name: 'Scorpio', startMonth: 10, startDay: 23, endMonth: 11, endDay: 21, angle: 210, color: '#dc2626' },
    { name: 'Sagittarius', startMonth: 11, startDay: 22, endMonth: 12, endDay: 21, angle: 240, color: '#a855f7' },
    { name: 'Capricorn', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19, angle: 270, color: '#94a3b8' },
    { name: 'Aquarius', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18, angle: 300, color: '#22d3ee' },
    { name: 'Pisces', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20, angle: 330, color: '#2dd4bf' },
  ]

  // Helper functions
  const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
  }

  const calculateDayOfYear = (date) => {
    const startOfYear = new Date(date.getFullYear(), 0, 1)
    return Math.floor((date - startOfYear) / (1000 * 60 * 60 * 24)) + 1
  }

  // Get current zodiac sign
  const getCurrentSign = () => {
    const month = currentDate.getMonth() + 1
    const day = currentDate.getDate()

    return zodiacSigns.find(s => {
      if (s.startMonth === s.endMonth) {
        return month === s.startMonth && day >= s.startDay && day <= s.endDay
      } else if (s.startMonth < s.endMonth) {
        return (month === s.startMonth && day >= s.startDay) ||
               (month === s.endMonth && day <= s.endDay)
      } else {
        // Crosses year boundary (Capricorn)
        return (month === s.startMonth && day >= s.startDay) ||
               (month === s.endMonth && day <= s.endDay)
      }
    })
  }

  const currentSign = getCurrentSign()

  useEffect(() => {
    // Calculate rotation based on current day of year
    const dayOfYear = calculateDayOfYear(currentDate)
    const totalDays = 365 + (isLeapYear(currentDate.getFullYear()) ? 1 : 0)

    // Convert day of year to degrees (full circle = full year)
    // Use POSITIVE angle for CLOCKWISE rotation
    // Events are positioned counterclockwise (negative angles)
    // Clockwise rotation brings future events from left to top
    const currentAngle = (dayOfYear / totalDays) * 360

    // Rotate CLOCKWISE to put current day at top
    // Future events approach from left, past recede to right
    setRotation(currentAngle)
  }, [currentDate])

  // Calculate angle for a specific date in the year
  const dateToAngle = (month, day) => {
    const year = currentDate.getFullYear()
    const eventDate = new Date(year, month - 1, day)
    const startOfYear = new Date(year, 0, 1)
    const dayOfYear = Math.floor((eventDate - startOfYear) / (1000 * 60 * 60 * 24)) + 1
    const totalDays = 365 + (isLeapYear(year) ? 1 : 0)
    // Use negative angle to reverse time direction (counterclockwise progression)
    return -(dayOfYear / totalDays) * 360
  }

  // Calculate position on the ring for an event
  const getEventPosition = (angle) => {
    const radius = 410 // Position for events in the outer part of ring
    const rad = ((angle - 90) * Math.PI) / 180 // -90 to start at top
    return {
      x: 450 + radius * Math.cos(rad), // Center at 450, 450
      y: 450 + radius * Math.sin(rad),
    }
  }

  // Constellation patterns - simplified star maps
  const constellations = {
    Aries: <g><circle cx="0" cy="-8" r="1.5" fill="currentColor" /><circle cx="2" cy="-4" r="1.5" fill="currentColor" /><circle cx="0" cy="0" r="2" fill="currentColor" /><circle cx="-2" cy="4" r="1.5" fill="currentColor" /><line x1="0" y1="-8" x2="2" y2="-4" stroke="currentColor" strokeWidth="0.5" /><line x1="2" y1="-4" x2="0" y2="0" stroke="currentColor" strokeWidth="0.5" /><line x1="0" y1="0" x2="-2" y2="4" stroke="currentColor" strokeWidth="0.5" /></g>,
    Taurus: <g><circle cx="0" cy="6" r="2" fill="currentColor" /><circle cx="-5" cy="-4" r="1.5" fill="currentColor" /><circle cx="5" cy="-4" r="1.5" fill="currentColor" /><circle cx="-6" cy="-8" r="1" fill="currentColor" /><circle cx="6" cy="-8" r="1" fill="currentColor" /><line x1="-5" y1="-4" x2="0" y2="6" stroke="currentColor" strokeWidth="0.5" /><line x1="5" y1="-4" x2="0" y2="6" stroke="currentColor" strokeWidth="0.5" /><line x1="-5" y1="-4" x2="-6" y2="-8" stroke="currentColor" strokeWidth="0.5" /><line x1="5" y1="-4" x2="6" y2="-8" stroke="currentColor" strokeWidth="0.5" /></g>,
    Gemini: <g><circle cx="-4" cy="-8" r="1.5" fill="currentColor" /><circle cx="-4" cy="0" r="1.5" fill="currentColor" /><circle cx="-4" cy="8" r="1.5" fill="currentColor" /><circle cx="4" cy="-8" r="1.5" fill="currentColor" /><circle cx="4" cy="0" r="1.5" fill="currentColor" /><circle cx="4" cy="8" r="1.5" fill="currentColor" /><line x1="-4" y1="-8" x2="-4" y2="8" stroke="currentColor" strokeWidth="0.5" /><line x1="4" y1="-8" x2="4" y2="8" stroke="currentColor" strokeWidth="0.5" /><line x1="-4" y1="8" x2="4" y2="8" stroke="currentColor" strokeWidth="0.5" /><line x1="-4" y1="-8" x2="4" y2="-8" stroke="currentColor" strokeWidth="0.5" /></g>,
    Cancer: <g><circle cx="0" cy="0" r="2" fill="currentColor" /><circle cx="-5" cy="-3" r="1.5" fill="currentColor" /><circle cx="5" cy="-3" r="1.5" fill="currentColor" /><circle cx="-7" cy="-6" r="1" fill="currentColor" /><circle cx="7" cy="-6" r="1" fill="currentColor" /><circle cx="0" cy="5" r="1.5" fill="currentColor" /><line x1="0" y1="0" x2="-5" y2="-3" stroke="currentColor" strokeWidth="0.5" /><line x1="0" y1="0" x2="5" y2="-3" stroke="currentColor" strokeWidth="0.5" /><line x1="-5" y1="-3" x2="-7" y2="-6" stroke="currentColor" strokeWidth="0.5" /><line x1="5" y1="-3" x2="7" y2="-6" stroke="currentColor" strokeWidth="0.5" /><line x1="0" y1="0" x2="0" y2="5" stroke="currentColor" strokeWidth="0.5" /></g>,
    Leo: <g><circle cx="0" cy="-6" r="2" fill="currentColor" /><circle cx="-4" cy="-3" r="1.5" fill="currentColor" /><circle cx="4" cy="-3" r="1.5" fill="currentColor" /><circle cx="0" cy="2" r="1.5" fill="currentColor" /><circle cx="-3" cy="6" r="1.5" fill="currentColor" /><circle cx="3" cy="6" r="1.5" fill="currentColor" /><line x1="0" y1="-6" x2="-4" y2="-3" stroke="currentColor" strokeWidth="0.5" /><line x1="0" y1="-6" x2="4" y2="-3" stroke="currentColor" strokeWidth="0.5" /><line x1="0" y1="-6" x2="0" y2="2" stroke="currentColor" strokeWidth="0.5" /><line x1="0" y1="2" x2="-3" y2="6" stroke="currentColor" strokeWidth="0.5" /><line x1="0" y1="2" x2="3" y2="6" stroke="currentColor" strokeWidth="0.5" /></g>,
    Virgo: <g><circle cx="-6" cy="-6" r="1.5" fill="currentColor" /><circle cx="-3" cy="-2" r="1.5" fill="currentColor" /><circle cx="0" cy="2" r="1.5" fill="currentColor" /><circle cx="3" cy="6" r="1.5" fill="currentColor" /><circle cx="6" cy="4" r="1" fill="currentColor" /><line x1="-6" y1="-6" x2="-3" y2="-2" stroke="currentColor" strokeWidth="0.5" /><line x1="-3" y1="-2" x2="0" y2="2" stroke="currentColor" strokeWidth="0.5" /><line x1="0" y1="2" x2="3" y2="6" stroke="currentColor" strokeWidth="0.5" /><line x1="3" y1="6" x2="6" y2="4" stroke="currentColor" strokeWidth="0.5" /></g>,
    Libra: <g><circle cx="-5" cy="3" r="1.5" fill="currentColor" /><circle cx="5" cy="3" r="1.5" fill="currentColor" /><circle cx="0" cy="-5" r="1.5" fill="currentColor" /><circle cx="-6" cy="6" r="1" fill="currentColor" /><circle cx="6" cy="6" r="1" fill="currentColor" /><line x1="-5" y1="3" x2="5" y2="3" stroke="currentColor" strokeWidth="0.5" /><line x1="0" y1="-5" x2="0" y2="3" stroke="currentColor" strokeWidth="0.5" /><line x1="-5" y1="3" x2="-6" y2="6" stroke="currentColor" strokeWidth="0.5" /><line x1="5" y1="3" x2="6" y2="6" stroke="currentColor" strokeWidth="0.5" /></g>,
    Scorpio: <g><circle cx="-6" cy="-4" r="1.5" fill="currentColor" /><circle cx="-3" cy="0" r="1.5" fill="currentColor" /><circle cx="0" cy="3" r="1.5" fill="currentColor" /><circle cx="3" cy="5" r="1.5" fill="currentColor" /><circle cx="6" cy="3" r="1.5" fill="currentColor" /><line x1="-6" y1="-4" x2="-3" y2="0" stroke="currentColor" strokeWidth="0.5" /><line x1="-3" y1="0" x2="0" y2="3" stroke="currentColor" strokeWidth="0.5" /><line x1="0" y1="3" x2="3" y2="5" stroke="currentColor" strokeWidth="0.5" /><line x1="3" y1="5" x2="6" y2="3" stroke="currentColor" strokeWidth="0.5" /></g>,
    Sagittarius: <g><circle cx="-6" cy="6" r="1.5" fill="currentColor" /><circle cx="-2" cy="2" r="1.5" fill="currentColor" /><circle cx="2" cy="-2" r="1.5" fill="currentColor" /><circle cx="6" cy="-6" r="1.5" fill="currentColor" /><circle cx="4" cy="-8" r="1" fill="currentColor" /><circle cx="8" cy="-4" r="1" fill="currentColor" /><line x1="-6" y1="6" x2="6" y2="-6" stroke="currentColor" strokeWidth="0.5" /><line x1="6" y1="-6" x2="4" y2="-8" stroke="currentColor" strokeWidth="0.5" /><line x1="6" y1="-6" x2="8" y2="-4" stroke="currentColor" strokeWidth="0.5" /></g>,
    Capricorn: <g><circle cx="-5" cy="-5" r="1.5" fill="currentColor" /><circle cx="0" cy="-3" r="1.5" fill="currentColor" /><circle cx="3" cy="0" r="1.5" fill="currentColor" /><circle cx="5" cy="4" r="1.5" fill="currentColor" /><circle cx="2" cy="7" r="1" fill="currentColor" /><line x1="-5" y1="-5" x2="0" y2="-3" stroke="currentColor" strokeWidth="0.5" /><line x1="0" y1="-3" x2="3" y2="0" stroke="currentColor" strokeWidth="0.5" /><line x1="3" y1="0" x2="5" y2="4" stroke="currentColor" strokeWidth="0.5" /><line x1="5" y1="4" x2="2" y2="7" stroke="currentColor" strokeWidth="0.5" /></g>,
    Aquarius: <g><circle cx="-6" cy="-3" r="1.5" fill="currentColor" /><circle cx="-3" cy="0" r="1.5" fill="currentColor" /><circle cx="0" cy="-3" r="1.5" fill="currentColor" /><circle cx="3" cy="0" r="1.5" fill="currentColor" /><circle cx="6" cy="-3" r="1.5" fill="currentColor" /><circle cx="-3" cy="5" r="1.5" fill="currentColor" /><circle cx="3" cy="5" r="1.5" fill="currentColor" /><line x1="-6" y1="-3" x2="-3" y2="0" stroke="currentColor" strokeWidth="0.5" /><line x1="-3" y1="0" x2="0" y2="-3" stroke="currentColor" strokeWidth="0.5" /><line x1="0" y1="-3" x2="3" y2="0" stroke="currentColor" strokeWidth="0.5" /><line x1="3" y1="0" x2="6" y2="-3" stroke="currentColor" strokeWidth="0.5" /><line x1="-3" y1="5" x2="3" y2="5" stroke="currentColor" strokeWidth="0.5" /></g>,
    Pisces: <g><circle cx="-5" cy="-5" r="1.5" fill="currentColor" /><circle cx="-3" cy="-2" r="1" fill="currentColor" /><circle cx="0" cy="0" r="1.5" fill="currentColor" /><circle cx="3" cy="2" r="1" fill="currentColor" /><circle cx="5" cy="5" r="1.5" fill="currentColor" /><circle cx="-6" cy="-7" r="1" fill="currentColor" /><circle cx="6" cy="7" r="1" fill="currentColor" /><line x1="-5" y1="-5" x2="0" y2="0" stroke="currentColor" strokeWidth="0.5" /><line x1="0" y1="0" x2="5" y2="5" stroke="currentColor" strokeWidth="0.5" /><line x1="-5" y1="-5" x2="-6" y2="-7" stroke="currentColor" strokeWidth="0.5" /><line x1="5" y1="5" x2="6" y2="7" stroke="currentColor" strokeWidth="0.5" /></g>,
  }

  // Generate star field for background
  const generateStars = () => {
    const stars = []
    for (let i = 0; i < 150; i++) {
      const angle = Math.random() * 360 // Random angle for even distribution
      const radius = 250 + Math.random() * 200 // Within the ring (250-450)
      const rad = ((angle - 90) * Math.PI) / 180
      const x = 450 + radius * Math.cos(rad)
      const y = 450 + radius * Math.sin(rad)
      stars.push({
        x,
        y,
        r: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.7 + 0.3,
      })
    }
    return stars
  }

  const stars = generateStars()

  return (
    <div className="flex justify-center items-center">
      <div className="relative w-[900px] h-[900px]">
        {/* Fixed NOW indicator at top */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8 z-20">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-blue-400"></div>
        </div>

        {/* Rotating Annual Events Disk */}
        <div
          className="absolute inset-0 transition-transform duration-1000 ease-linear"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* Main Annual Circle */}
          <div className="relative w-full h-full rounded-full border-2 border-slate-700/20 shadow-2xl overflow-hidden" style={{ background: 'linear-gradient(to bottom right, #0a1628, #1e293b)' }}>

            {/* Star field background */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 900 900">
              {stars.map((star, i) => (
                <circle
                  key={i}
                  cx={star.x}
                  cy={star.y}
                  r={star.r}
                  fill="#e0f2fe"
                  opacity={star.opacity}
                />
              ))}

              {/* Month division markers - subtle lines */}
              {Array.from({ length: 12 }).map((_, i) => {
                // Reverse time direction for month markers
                const angle = -(i / 12) * 360
                const innerRadius = 250
                const outerRadius = 450
                const rad = ((angle - 90) * Math.PI) / 180
                const x1 = 450 + innerRadius * Math.cos(rad)
                const y1 = 450 + innerRadius * Math.sin(rad)
                const x2 = 450 + outerRadius * Math.cos(rad)
                const y2 = 450 + outerRadius * Math.sin(rad)

                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#475569"
                    strokeWidth="1"
                    opacity="0.3"
                  />
                )
              })}

              {/* Zodiac Constellations */}
              {zodiacSigns.map((sign) => {
                // Reverse time direction and offset by 15° to position between month division lines
                const signAngle = -(sign.angle + 15)
                const radius = 320 // Inner part of ring for constellations
                const rad = ((signAngle - 90) * Math.PI) / 180
                const x = 450 + radius * Math.cos(rad)
                const y = 450 + radius * Math.sin(rad)

                return (
                  <g
                    key={sign.name}
                    transform={`translate(${x}, ${y}) rotate(${-rotation - signAngle}) scale(6.5)`}
                    opacity="0.18"
                    style={{ color: sign.color }}
                  >
                    {constellations[sign.name]}
                  </g>
                )
              })}

              {/* Event markers */}
              {events.map((event) => {
                const angle = dateToAngle(event.month, event.day)
                const pos = getEventPosition(angle)

                // For radial labels: rotate by angle to point outward
                // Normalize angle to 0-360 range
                const normalizedAngle = ((angle % 360) + 360) % 360
                // Flip text if it's on the left half (would be upside down or sideways)
                const needsFlip = normalizedAngle > 90 && normalizedAngle < 270
                const radialRotation = needsFlip ? normalizedAngle - 180 : normalizedAngle

                return (
                  <g key={event.id}>
                    {/* Event dot */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="6"
                      fill={event.color}
                      stroke="#fff"
                      strokeWidth="2"
                      opacity="0.9"
                    />

                    {/* Event label - radial (pointing outward from center) */}
                    <g transform={`translate(${pos.x}, ${pos.y}) rotate(${radialRotation})`}>
                      <text
                        x="0"
                        y={needsFlip ? "22" : "-22"}
                        textAnchor="middle"
                        fill="#e2e8f0"
                        fontSize="11"
                        fontWeight="500"
                        style={{ userSelect: 'none' }}
                      >
                        {event.name}
                      </text>
                    </g>
                  </g>
                )
              })}
            </svg>

            {/* Center info - kept upright */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="text-center"
                style={{ transform: `rotate(${-rotation}deg)` }}
              >
                <div className="text-slate-300 text-sm font-semibold bg-slate-900/80 px-4 py-3 rounded-lg backdrop-blur border border-slate-700/50">
                  <div className="text-base">Annual Cycle</div>
                  <div className="text-xs text-slate-400 mt-1">
                    Day {calculateDayOfYear(currentDate)} of {365 + (isLeapYear(currentDate.getFullYear()) ? 1 : 0)}
                  </div>
                  {currentSign && (
                    <div className="text-xs text-slate-500 mt-1">
                      {currentSign.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnnualEventsClock
