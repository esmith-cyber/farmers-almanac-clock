import { useEffect, useState } from 'react'

function AnnualEventsClock({ currentDate, events }) {
  const [rotation, setRotation] = useState(0)

  // Zodiac sign data with date ranges and colors
  const zodiacSigns = [
    { name: 'Aries', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19, color: '#ef4444' },
    { name: 'Taurus', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20, color: '#4ade80' },
    { name: 'Gemini', startMonth: 5, startDay: 21, endMonth: 6, endDay: 20, color: '#fbbf24' },
    { name: 'Cancer', startMonth: 6, startDay: 21, endMonth: 7, endDay: 22, color: '#e0e7ff' },
    { name: 'Leo', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22, color: '#fb923c' },
    { name: 'Virgo', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22, color: '#a78bfa' },
    { name: 'Libra', startMonth: 9, startDay: 23, endMonth: 10, endDay: 22, color: '#f472b6' },
    { name: 'Scorpio', startMonth: 10, startDay: 23, endMonth: 11, endDay: 21, color: '#dc2626' },
    { name: 'Sagittarius', startMonth: 11, startDay: 22, endMonth: 12, endDay: 21, color: '#a855f7' },
    { name: 'Capricorn', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19, color: '#94a3b8' },
    { name: 'Aquarius', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18, color: '#22d3ee' },
    { name: 'Pisces', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20, color: '#2dd4bf' },
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
    <div className="flex justify-center items-center w-full h-full">
      <div className="relative w-full h-full">
        {/* Rotating Annual Events Disk */}
        <div
          className="absolute inset-0 transition-transform duration-1000 ease-linear"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* Main Annual Circle */}
          <div className="relative w-full h-full rounded-full border-2 border-slate-700/20 shadow-2xl overflow-hidden" style={{ background: 'linear-gradient(to bottom right, #0a1628, #1e293b)' }}>

            {/* Star field background */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 900 900">
              {stars.map((star, i) => (
                <circle
                  key={i}
                  cx={star.x}
                  cy={star.y}
                  r={star.r}
                  fill="#e0f2fe"
                  opacity={star.opacity}
                  style={{ pointerEvents: 'none' }}
                />
              ))}

              {/* Zodiac division markers - subtle lines at sign boundaries */}
              {zodiacSigns.map((sign, i) => {
                // Draw line at the START of each zodiac sign
                const angle = dateToAngle(sign.startMonth, sign.startDay)
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
                    style={{ pointerEvents: 'none' }}
                  />
                )
              })}

              {/* Zodiac Constellations */}
              {zodiacSigns.map((sign) => {
                // Calculate the midpoint date of this zodiac sign for positioning
                const year = currentDate.getFullYear()
                const startDate = new Date(year, sign.startMonth - 1, sign.startDay)
                const endDate = new Date(year, sign.endMonth - 1, sign.endDay)

                // Handle Capricorn which crosses year boundary
                if (sign.endMonth < sign.startMonth) {
                  endDate.setFullYear(year + 1)
                }

                const midDate = new Date((startDate.getTime() + endDate.getTime()) / 2)
                const startOfYear = new Date(year, 0, 1)
                const dayOfYear = Math.floor((midDate - startOfYear) / (1000 * 60 * 60 * 24)) + 1
                const totalDays = 365 + (isLeapYear(year) ? 1 : 0)

                // Calculate angle for this zodiac's midpoint (negative for counterclockwise)
                const signAngle = -(dayOfYear / totalDays) * 360
                const radius = 340 // Adjusted to center in ring area (250-450 range)
                const rad = ((signAngle - 90) * Math.PI) / 180
                const x = 450 + radius * Math.cos(rad)
                const y = 450 + radius * Math.sin(rad)

                // Format date range for tooltip
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                const startMonth = months[sign.startMonth - 1]
                const endMonth = months[sign.endMonth - 1]
                const dateRange = `${startMonth} ${sign.startDay} - ${endMonth} ${sign.endDay}`

                return (
                  <g
                    key={sign.name}
                    transform={`translate(${x}, ${y}) rotate(${-rotation - signAngle}) scale(6.5)`}
                    opacity="0.18"
                    style={{ color: sign.color, cursor: 'pointer' }}
                    className="zodiac-sign"
                  >
                    <title>{sign.name}: {dateRange}</title>
                    {constellations[sign.name]}
                  </g>
                )
              })}

              {/* Event markers */}
              {events.map((event) => {
                const angle = dateToAngle(event.month, event.day)
                const pos = getEventPosition(angle)

                // Check if this event is today
                const isToday = event.month === currentDate.getMonth() + 1 &&
                                event.day === currentDate.getDate()

                // Check event type
                const isAstronomical = event.name.includes('Solstice') || event.name.includes('Equinox')
                const isSolarEclipse = event.type === 'solar-eclipse'
                const isLunarEclipse = event.type === 'lunar-eclipse'

                // Format date for tooltip
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                const eventDate = `${months[event.month - 1]} ${event.day}`

                // For radial labels: rotate by angle to point outward
                // Normalize angle to 0-360 range
                const normalizedAngle = ((angle % 360) + 360) % 360
                // Flip text if it's on the left half (would be upside down or sideways)
                const needsFlip = normalizedAngle > 90 && normalizedAngle < 270
                const radialRotation = needsFlip ? normalizedAngle - 180 : normalizedAngle

                return (
                  <g key={event.id} className="event-marker" style={{ cursor: 'pointer' }}>
                    <title>{event.name} ({eventDate})</title>

                    {/* Event marker - different shapes for different event types */}
                    {isSolarEclipse ? (
                      // Star burst for solar eclipses
                      <g>
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={isToday ? "8" : "5"}
                          fill={event.color}
                          stroke="#fff"
                          strokeWidth={isToday ? "2" : "1.5"}
                          opacity="0.9"
                        />
                        {/* Sun rays */}
                        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
                          const rayLength = isToday ? 12 : 8
                          const innerR = isToday ? 8 : 5
                          const rad = (angle * Math.PI) / 180
                          const x1 = pos.x + innerR * Math.cos(rad)
                          const y1 = pos.y + innerR * Math.sin(rad)
                          const x2 = pos.x + (innerR + rayLength) * Math.cos(rad)
                          const y2 = pos.y + (innerR + rayLength) * Math.sin(rad)
                          return (
                            <line
                              key={angle}
                              x1={x1}
                              y1={y1}
                              x2={x2}
                              y2={y2}
                              stroke={event.color}
                              strokeWidth={isToday ? "2.5" : "2"}
                              strokeLinecap="round"
                            />
                          )
                        })}
                      </g>
                    ) : isLunarEclipse ? (
                      // Crescent for lunar eclipses
                      <g>
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={isToday ? "9" : "6"}
                          fill={event.color}
                          stroke="#fff"
                          strokeWidth={isToday ? "2.5" : "2"}
                          opacity="0.9"
                        />
                        <circle
                          cx={pos.x + (isToday ? 5 : 3)}
                          cy={pos.y}
                          r={isToday ? "9" : "6"}
                          fill="#0a1628"
                          opacity="0.8"
                        />
                      </g>
                    ) : isAstronomical ? (
                      // Diamond shape for solstices and equinoxes
                      <rect
                        x={pos.x}
                        y={pos.y}
                        width={isToday ? "20" : "12"}
                        height={isToday ? "20" : "12"}
                        transform={`translate(${isToday ? -10 : -6}, ${isToday ? -10 : -6}) rotate(45, ${pos.x}, ${pos.y})`}
                        fill={event.color}
                        stroke="#fff"
                        strokeWidth={isToday ? "3" : "2"}
                        opacity={isToday ? "1" : "0.9"}
                      >
                        {/* Pulse animation for today's events */}
                        {isToday && (
                          <>
                            <animate
                              attributeName="width"
                              values="20;24;20"
                              dur="2s"
                              repeatCount="indefinite"
                            />
                            <animate
                              attributeName="height"
                              values="20;24;20"
                              dur="2s"
                              repeatCount="indefinite"
                            />
                          </>
                        )}
                      </rect>
                    ) : (
                      // Circle for personal events
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={isToday ? "10" : "6"}
                        fill={event.color}
                        stroke="#fff"
                        strokeWidth={isToday ? "3" : "2"}
                        opacity={isToday ? "1" : "0.9"}
                      >
                        {/* Pulse animation for today's events */}
                        {isToday && (
                          <animate
                            attributeName="r"
                            values="10;12;10"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                        )}
                      </circle>
                    )}

                    {/* Event label - only visible for today's events */}
                    {isToday && (
                      <g transform={`translate(${pos.x}, ${pos.y}) rotate(${radialRotation})`}>
                        <text
                          x="0"
                          y={needsFlip ? "22" : "-22"}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="13"
                          fontWeight="700"
                          style={{ userSelect: 'none', pointerEvents: 'none' }}
                        >
                          {event.name}
                        </text>
                      </g>
                    )}
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
                <div className="text-slate-300 font-semibold bg-slate-900/80 rounded-lg backdrop-blur border border-slate-700/50" style={{
                  fontSize: 'min(1.56vmin, 14px)',
                  padding: 'min(1.33vmin, 12px) min(1.78vmin, 16px)'
                }}>
                  <div style={{ fontSize: 'min(1.78vmin, 16px)' }}>Annual Cycle</div>
                  <div className="text-slate-400" style={{ fontSize: 'min(1.33vmin, 12px)', marginTop: 'min(0.44vmin, 4px)' }}>
                    Day {calculateDayOfYear(currentDate)} of {365 + (isLeapYear(currentDate.getFullYear()) ? 1 : 0)}
                  </div>
                  {currentSign && (
                    <div className="text-slate-500" style={{ fontSize: 'min(1.33vmin, 12px)', marginTop: 'min(0.44vmin, 4px)' }}>
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
