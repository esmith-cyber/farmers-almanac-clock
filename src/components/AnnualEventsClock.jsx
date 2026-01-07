import { useEffect, useState, useMemo } from 'react'
import { createPortal } from 'react-dom'

// Constants
const SVG_CENTER = 450
const SVG_SIZE = 900
const EVENT_RADIUS = 410
const CONSTELLATION_RADIUS = 340
const INNER_RADIUS = 250
const OUTER_RADIUS = 450
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function AnnualEventsClock({ currentDate, events }) {
  const [rotation, setRotation] = useState(0)
  const [selectedZodiac, setSelectedZodiac] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)

  // Zodiac sign data with date ranges, colors, and astronomical/mythological descriptions
  const zodiacSigns = [
    { name: 'Aries', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19, color: '#ef4444', element: 'Fire', symbol: '♈', description: 'The Ram - Named for the golden ram of Greek mythology. Contains the bright star Hamal, known to ancient astronomers.' },
    { name: 'Taurus', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20, color: '#4ade80', element: 'Earth', symbol: '♉', description: 'The Bull - Home to the Pleiades star cluster and Aldebaran, the "Eye of the Bull." One of the oldest recognized constellations.' },
    { name: 'Gemini', startMonth: 5, startDay: 21, endMonth: 6, endDay: 20, color: '#fbbf24', element: 'Air', symbol: '♊', description: 'The Twins - Represents Castor and Pollux from Greek mythology. Contains two of the brightest stars in the night sky.' },
    { name: 'Cancer', startMonth: 6, startDay: 21, endMonth: 7, endDay: 22, color: '#e0e7ff', element: 'Water', symbol: '♋', description: 'The Crab - Contains the Beehive Cluster (M44), visible to the naked eye. The faintest of the zodiac constellations.' },
    { name: 'Leo', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22, color: '#fb923c', element: 'Fire', symbol: '♌', description: 'The Lion - Features Regulus, the "Heart of the Lion." Ancient Egyptians built temples aligned with this constellation.' },
    { name: 'Virgo', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22, color: '#a78bfa', element: 'Earth', symbol: '♍', description: 'The Maiden - Contains Spica, one of the brightest stars. The constellation spans more celestial longitude than any other zodiac sign.' },
    { name: 'Libra', startMonth: 9, startDay: 23, endMonth: 10, endDay: 22, color: '#f472b6', element: 'Air', symbol: '♎', description: 'The Scales - Originally part of Scorpius, representing the scorpion\'s claws. Added as a separate constellation by the Romans.' },
    { name: 'Scorpio', startMonth: 10, startDay: 23, endMonth: 11, endDay: 21, color: '#dc2626', element: 'Water', symbol: '♏', description: 'The Scorpion - Features Antares, a red supergiant 700 times larger than our Sun. Recognized by ancient Mesopotamian astronomers.' },
    { name: 'Sagittarius', startMonth: 11, startDay: 22, endMonth: 12, endDay: 21, color: '#a855f7', element: 'Fire', symbol: '♐', description: 'The Archer - Points toward the galactic center of the Milky Way. Contains numerous star clusters and nebulae.' },
    { name: 'Capricorn', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19, color: '#94a3b8', element: 'Earth', symbol: '♑', description: 'The Sea-Goat - One of the oldest identified constellations, dating to Bronze Age Mesopotamia. Marks the winter solstice position.' },
    { name: 'Aquarius', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18, color: '#22d3ee', element: 'Air', symbol: '♒', description: 'The Water Bearer - Associated with the rainy season in ancient times. Contains the Helix Nebula, the closest planetary nebula to Earth.' },
    { name: 'Pisces', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20, color: '#2dd4bf', element: 'Water', symbol: '♓', description: 'The Fish - Contains the vernal equinox point. Represents Aphrodite and Eros transformed into fish in Greek mythology.' },
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
    const rad = ((angle - 90) * Math.PI) / 180 // -90 to start at top
    return {
      x: SVG_CENTER + EVENT_RADIUS * Math.cos(rad),
      y: SVG_CENTER + EVENT_RADIUS * Math.sin(rad),
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


  return (
    <div className="flex justify-center items-center w-full h-full">
      <div className="relative w-full h-full">
        {/* Rotating Annual Events Disk */}
        <div
          className="absolute inset-0 transition-transform duration-1000 ease-linear"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* Main Annual Circle */}
          <div className="relative w-full h-full rounded-full clock-glow overflow-hidden" style={{ background: 'transparent' }}>

            {/* Star field background - removed, using background stars instead */}
            <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}>

              {/* Zodiac division markers - subtle lines at sign boundaries */}
              {zodiacSigns.map((sign, i) => {
                // Draw line at the START of each zodiac sign
                const angle = dateToAngle(sign.startMonth, sign.startDay)
                const rad = ((angle - 90) * Math.PI) / 180
                const x1 = SVG_CENTER + INNER_RADIUS * Math.cos(rad)
                const y1 = SVG_CENTER + INNER_RADIUS * Math.sin(rad)
                const x2 = SVG_CENTER + OUTER_RADIUS * Math.cos(rad)
                const y2 = SVG_CENTER + OUTER_RADIUS * Math.sin(rad)

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

              {/* Zodiac Constellations with wedge-shaped hover areas */}
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

                // Calculate day of year, handling year wrap-around
                let dayOfYear
                const totalDays = 365 + (isLeapYear(year) ? 1 : 0)

                if (midDate.getFullYear() > year) {
                  // Midpoint is in next year, wrap it to current year for display
                  const nextYearStart = new Date(year + 1, 0, 1)
                  const dayInNextYear = Math.floor((midDate - nextYearStart) / (1000 * 60 * 60 * 24)) + 1
                  dayOfYear = dayInNextYear // Position at the beginning of year
                } else {
                  const startOfYear = new Date(year, 0, 1)
                  dayOfYear = Math.floor((midDate - startOfYear) / (1000 * 60 * 60 * 24)) + 1
                }

                // Calculate angle for this zodiac's midpoint (negative for counterclockwise)
                const signAngle = -(dayOfYear / totalDays) * 360
                const rad = ((signAngle - 90) * Math.PI) / 180
                const x = SVG_CENTER + CONSTELLATION_RADIUS * Math.cos(rad)
                const y = SVG_CENTER + CONSTELLATION_RADIUS * Math.sin(rad)

                // Format date range for tooltip
                const startMonth = MONTH_NAMES[sign.startMonth - 1]
                const endMonth = MONTH_NAMES[sign.endMonth - 1]
                const dateRange = `${startMonth} ${sign.startDay} - ${endMonth} ${sign.endDay}`

                // Calculate wedge boundaries for this sign
                // Add slight buffer to account for constellation visual overflow
                const startAngle = dateToAngle(sign.startMonth, sign.startDay)
                const endAngle = dateToAngle(sign.endMonth, sign.endDay)

                // Expand wedge by ~2 degrees on each side to ensure full constellation coverage
                const bufferAngle = 2
                const expandedStartAngle = startAngle - bufferAngle
                const expandedEndAngle = endAngle + bufferAngle

                // Calculate the actual duration of this zodiac sign in days
                let daysInSign

                if (sign.endMonth < sign.startMonth) {
                  // Crosses year boundary (like Capricorn: Dec 22 - Jan 19)
                  const startDate = new Date(year, sign.startMonth - 1, sign.startDay)
                  const endOfYear = new Date(year, 11, 31, 23, 59, 59)
                  const startOfNextYear = new Date(year + 1, 0, 1)
                  const endDate = new Date(year + 1, sign.endMonth - 1, sign.endDay)

                  const daysToEndOfYear = Math.floor((endOfYear - startDate) / (1000 * 60 * 60 * 24)) + 1
                  const daysFromStartOfYear = Math.floor((endDate - startOfNextYear) / (1000 * 60 * 60 * 24)) + 1
                  daysInSign = daysToEndOfYear + daysFromStartOfYear
                } else {
                  // Normal case - doesn't cross year boundary
                  const startDate = new Date(year, sign.startMonth - 1, sign.startDay)
                  const endDate = new Date(year, sign.endMonth - 1, sign.endDay)
                  daysInSign = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
                }

                // Arc angle based on actual days in sign
                const arcAngle = (daysInSign / totalDays) * 360
                const largeArcFlag = arcAngle > 180 ? 1 : 0

                // Create wedge path for hover area using expanded angles
                const startRad = ((expandedStartAngle - 90) * Math.PI) / 180
                const endRad = ((expandedEndAngle - 90) * Math.PI) / 180

                // Calculate wedge path points
                const x1 = SVG_CENTER + INNER_RADIUS * Math.cos(startRad)
                const y1 = SVG_CENTER + INNER_RADIUS * Math.sin(startRad)
                const x2 = SVG_CENTER + OUTER_RADIUS * Math.cos(startRad)
                const y2 = SVG_CENTER + OUTER_RADIUS * Math.sin(startRad)
                const x3 = SVG_CENTER + OUTER_RADIUS * Math.cos(endRad)
                const y3 = SVG_CENTER + OUTER_RADIUS * Math.sin(endRad)
                const x4 = SVG_CENTER + INNER_RADIUS * Math.cos(endRad)
                const y4 = SVG_CENTER + INNER_RADIUS * Math.sin(endRad)

                const wedgePath = `
                  M ${x1} ${y1}
                  L ${x2} ${y2}
                  A ${OUTER_RADIUS} ${OUTER_RADIUS} 0 ${largeArcFlag} 0 ${x3} ${y3}
                  L ${x4} ${y4}
                  A ${INNER_RADIUS} ${INNER_RADIUS} 0 ${largeArcFlag} 1 ${x1} ${y1}
                  Z
                `

                return (
                  <g key={sign.name}>
                    {/* Constellation visual - rendered first (behind) */}
                    <g
                      transform={`translate(${x}, ${y}) rotate(${-rotation - signAngle}) scale(6.5)`}
                      opacity="0.18"
                      style={{ color: sign.color, pointerEvents: 'none' }}
                      className="zodiac-sign"
                    >
                      {constellations[sign.name]}
                    </g>

                    {/* Wedge-shaped hover area */}
                    <path
                      d={wedgePath}
                      fill="transparent"
                      style={{ pointerEvents: 'all', cursor: 'pointer' }}
                      onClick={() => setSelectedZodiac(sign)}
                    >
                      <title>{sign.name}: {dateRange}</title>
                    </path>
                  </g>
                )
              })}

              {/* Event markers */}
              {events.map((event) => {
                // Check if this is a multi-day event (explicit null check)
                const isMultiDay = event.endMonth != null && event.endDay != null
                const year = currentDate.getFullYear()

                const startAngle = dateToAngle(event.month, event.day)
                const pos = getEventPosition(startAngle)

                // Check if this event is today or spans today
                let isToday = event.month === currentDate.getMonth() + 1 &&
                              event.day === currentDate.getDate()

                // For multi-day events, check if today falls within the range
                if (isMultiDay && !isToday) {
                  const startDate = new Date(year, event.month - 1, event.day)
                  const endDate = new Date(year, event.endMonth - 1, event.endDay)
                  const today = new Date(year, currentDate.getMonth(), currentDate.getDate())

                  // Handle year-crossing events
                  if (endDate < startDate) {
                    // Event crosses year boundary (e.g., Dec 20 - Jan 5)
                    isToday = today >= startDate || today <= endDate
                  } else {
                    isToday = today >= startDate && today <= endDate
                  }
                }

                // Check event type
                const isAstronomical = event.name.includes('Solstice') || event.name.includes('Equinox')
                const isSolarEclipse = event.type === 'solar-eclipse'
                const isLunarEclipse = event.type === 'lunar-eclipse'

                // Format date for tooltip
                const eventDate = isMultiDay
                  ? `${MONTH_NAMES[event.month - 1]} ${event.day} - ${MONTH_NAMES[event.endMonth - 1]} ${event.endDay}`
                  : `${MONTH_NAMES[event.month - 1]} ${event.day}`

                // For radial labels: rotate by angle to point outward
                // Normalize angle to 0-360 range
                const normalizedAngle = ((startAngle % 360) + 360) % 360
                // Flip text if it's on the left half (would be upside down or sideways)
                const needsFlip = normalizedAngle > 90 && normalizedAngle < 270
                const radialRotation = needsFlip ? normalizedAngle - 180 : normalizedAngle

                // For multi-day events, render an arc
                if (isMultiDay) {
                  const endAngle = dateToAngle(event.endMonth, event.endDay)

                  // Calculate arc parameters
                  // Since angles are negative and decrease as dates progress,
                  // we need to calculate the absolute arc span
                  let arcAngle = startAngle - endAngle // Reversed since angles are negative

                  // Handle year-crossing events (e.g., Dec 20 - Jan 5)
                  if (arcAngle < 0) arcAngle += 360

                  const largeArcFlag = arcAngle > 180 ? 1 : 0

                  // Calculate start and end points
                  const startRad = ((startAngle - 90) * Math.PI) / 180
                  const endRad = ((endAngle - 90) * Math.PI) / 180

                  const x1 = SVG_CENTER + EVENT_RADIUS * Math.cos(startRad)
                  const y1 = SVG_CENTER + EVENT_RADIUS * Math.sin(startRad)
                  const x2 = SVG_CENTER + EVENT_RADIUS * Math.cos(endRad)
                  const y2 = SVG_CENTER + EVENT_RADIUS * Math.sin(endRad)

                  // Use sweep-flag = 0 for counterclockwise (following negative angle progression)
                  const arcPath = `
                    M ${x1} ${y1}
                    A ${EVENT_RADIUS} ${EVENT_RADIUS} 0 ${largeArcFlag} 0 ${x2} ${y2}
                  `

                  return (
                    <g key={event.id} className="event-marker">
                      {/* Arc path for multi-day event */}
                      <path
                        d={arcPath}
                        fill="none"
                        stroke={event.color}
                        strokeWidth={isToday ? "8" : "6"}
                        strokeLinecap="round"
                        opacity={isToday ? "0.9" : "0.7"}
                        style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                        filter="drop-shadow(0 0 4px rgba(100, 100, 255, 0.6))"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <title>{event.name} ({eventDate})</title>
                      </path>

                      {/* Start marker */}
                      <circle
                        cx={x1}
                        cy={y1}
                        r={isToday ? "6" : "4"}
                        fill={event.color}
                        stroke="#fff"
                        strokeWidth="2"
                        opacity="0.9"
                        style={{ pointerEvents: 'none' }}
                      />

                      {/* End marker */}
                      <circle
                        cx={x2}
                        cy={y2}
                        r={isToday ? "6" : "4"}
                        fill={event.color}
                        stroke="#fff"
                        strokeWidth="2"
                        opacity="0.9"
                        style={{ pointerEvents: 'none' }}
                      />

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
                }

                // Single-day event - original rendering logic
                return (
                  <g key={event.id} className="event-marker">
                    {/* Invisible hover area - ensures event hovers take priority over zodiac wedges */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="20"
                      fill="transparent"
                      style={{ pointerEvents: 'all', cursor: 'pointer' }}
                      onClick={() => setSelectedEvent(event)}
                    >
                      <title>{event.name} ({eventDate})</title>
                    </circle>

                    {/* Event marker - different shapes for different event types */}
                    {isSolarEclipse ? (
                      // Star burst for solar eclipses - more prominent
                      <g style={{ pointerEvents: 'none' }}>
                        {/* Outer glow */}
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={isToday ? "14" : "11"}
                          fill={event.color}
                          opacity="0.2"
                        />
                        {/* Main circle */}
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={isToday ? "10" : "7"}
                          fill={event.color}
                          stroke="#fff"
                          strokeWidth={isToday ? "2.5" : "2"}
                          opacity="1"
                          filter="drop-shadow(0 0 4px rgba(255, 200, 0, 0.8))"
                        />
                        {/* Sun rays */}
                        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
                          const rayLength = isToday ? 16 : 12
                          const innerR = isToday ? 10 : 7
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
                              strokeWidth={isToday ? "3" : "2.5"}
                              strokeLinecap="round"
                              opacity="0.9"
                            />
                          )
                        })}
                      </g>
                    ) : isLunarEclipse ? (
                      // Crescent for lunar eclipses - more prominent
                      <g style={{ pointerEvents: 'none' }}>
                        {/* Outer glow */}
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={isToday ? "14" : "11"}
                          fill={event.color}
                          opacity="0.2"
                        />
                        {/* Main moon circle */}
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={isToday ? "11" : "8"}
                          fill={event.color}
                          stroke="#fff"
                          strokeWidth={isToday ? "3" : "2.5"}
                          opacity="1"
                          filter="drop-shadow(0 0 4px rgba(200, 150, 100, 0.8))"
                        />
                        {/* Shadow overlay for crescent */}
                        <circle
                          cx={pos.x + (isToday ? 6 : 4)}
                          cy={pos.y}
                          r={isToday ? "11" : "8"}
                          fill="#0a1628"
                          opacity="0.85"
                        />
                      </g>
                    ) : isAstronomical ? (
                      // Diamond shape for solstices and equinoxes - more prominent
                      <g style={{ pointerEvents: 'none' }}>
                        {/* Outer glow */}
                        <rect
                          x={pos.x}
                          y={pos.y}
                          width={isToday ? "26" : "20"}
                          height={isToday ? "26" : "20"}
                          transform={`translate(${isToday ? -13 : -10}, ${isToday ? -13 : -10}) rotate(45, ${pos.x}, ${pos.y})`}
                          fill={event.color}
                          opacity="0.2"
                        />
                        {/* Main diamond */}
                        <rect
                          x={pos.x}
                          y={pos.y}
                          width={isToday ? "22" : "16"}
                          height={isToday ? "22" : "16"}
                          transform={`translate(${isToday ? -11 : -8}, ${isToday ? -11 : -8}) rotate(45, ${pos.x}, ${pos.y})`}
                          fill={event.color}
                          stroke="#fff"
                          strokeWidth={isToday ? "3" : "2.5"}
                          opacity="1"
                          filter="drop-shadow(0 0 4px rgba(150, 100, 255, 0.8))"
                        >
                          {/* Pulse animation for today's events */}
                          {isToday && (
                            <>
                              <animate
                                attributeName="width"
                                values="22;26;22"
                                dur="2s"
                                repeatCount="indefinite"
                              />
                              <animate
                                attributeName="height"
                                values="22;26;22"
                                dur="2s"
                                repeatCount="indefinite"
                              />
                            </>
                          )}
                        </rect>
                      </g>
                    ) : (
                      // Circle for personal events
                      <circle
                        style={{ pointerEvents: 'none' }}
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
                <div className="text-slate-300 font-semibold ios-glass" style={{
                  fontSize: 'min(1.56vmin, 14px)',
                  padding: 'min(1.33vmin, 12px) min(1.78vmin, 16px)',
                  borderRadius: 'min(1.33vmin, 12px)'
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

      {/* Zodiac Info Modal */}
      {selectedZodiac && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(10px)',
            zIndex: 9999
          }}
          onClick={() => setSelectedZodiac(null)}
        >
          <div
            className="ios-glass-thick max-w-sm w-full"
            style={{
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span style={{ fontSize: '32px' }}>{selectedZodiac.symbol}</span>
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: selectedZodiac.color }}>
                      {selectedZodiac.name}
                    </h2>
                    <p className="text-slate-400 text-sm">{selectedZodiac.element} Sign</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedZodiac(null)}
                className="text-slate-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-slate-400 text-sm mb-1">Date Range</div>
                <div className="text-white font-semibold">
                  {MONTH_NAMES[selectedZodiac.startMonth - 1]} {selectedZodiac.startDay} - {MONTH_NAMES[selectedZodiac.endMonth - 1]} {selectedZodiac.endDay}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-700/50">
                <div className="text-slate-300 text-sm leading-relaxed">
                  {selectedZodiac.description}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Event Info Modal */}
      {selectedEvent && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(10px)',
            zIndex: 9999
          }}
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="ios-glass-thick max-w-sm w-full"
            style={{
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {selectedEvent.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-white text-2xl leading-none ml-2"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-slate-400 text-sm mb-1">Date</div>
                <div className="text-white font-semibold">
                  {selectedEvent.endMonth && selectedEvent.endDay ? (
                    `${MONTH_NAMES[selectedEvent.month - 1]} ${selectedEvent.day} - ${MONTH_NAMES[selectedEvent.endMonth - 1]} ${selectedEvent.endDay}`
                  ) : (
                    `${MONTH_NAMES[selectedEvent.month - 1]} ${selectedEvent.day}`
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: selectedEvent.color }}
                />
                <span className="text-slate-300 text-sm">
                  {selectedEvent.type ? selectedEvent.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Personal Event'}
                </span>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default AnnualEventsClock
