import { useMemo, useState } from 'react'
import SunCalc from 'suncalc'


const SPECIAL_DATES = [
  { month: 3, day: 20, label: 'Spring\nEquinox' },
  { month: 6, day: 21, label: 'Summer\nSolstice' },
  { month: 9, day: 22, label: 'Autumn\nEquinox' },
  { month: 12, day: 21, label: 'Winter\nSolstice' },
]

// Color by position in the seasonal cycle, anchored to solstices & equinoxes.
// Stops: winter solstice (Dec 21, ~DOY 355) → spring equinox (Mar 20, ~DOY 79)
//        → summer solstice (Jun 21, ~DOY 172) → autumn equinox (Sep 22, ~DOY 265) → back to winter
function seasonColor(dayOfYear, totalDays) {
  const winterSolsticeDOY = 355
  // Normalise DOY so that winter solstice = 0, cycling 0→1 through the year
  const t = ((dayOfYear - winterSolsticeDOY + totalDays) % totalDays) / totalDays
  // Season stops at t = 0, 0.25, 0.5, 0.75, 1.0
  const stops = [
    [0x1a, 0x6f, 0xa8], // winter  — glacier blue
    [0x4a, 0xde, 0x80], // spring  — spring green
    [0xfb, 0xbf, 0x24], // summer  — harvest gold
    [0xf9, 0x73, 0x16], // autumn  — fall orange
    [0x1a, 0x6f, 0xa8], // winter  — glacier blue (wrap)
  ]
  const scaled = t * (stops.length - 1)
  const i = Math.min(Math.floor(scaled), stops.length - 2)
  const s = scaled - i
  const [r1, g1, b1] = stops[i]
  const [r2, g2, b2] = stops[i + 1]
  return `rgb(${lerp(r1, r2, s)},${lerp(g1, g2, s)},${lerp(b1, b2, s)})`
}

function lerp(a, b, t) { return Math.round(a + (b - a) * t) }

function formatDayLength(hours) {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h}h ${m}m`
}

function formatRate(days, doy) {
  const prev = days[doy - 1]
  const next = days[doy + 1]
  if (!prev || !next) return null
  const diffMins = (next.dayLen - prev.dayLen) * 30 // minutes per day (over 2-day span)
  const abs = Math.abs(diffMins)
  const secs = Math.round(abs * 60)
  const label = abs < 0.1 ? 'holding steady'
    : diffMins > 0 ? `+${secs}s / day`
    : `−${secs}s / day`
  return label
}

export default function AnalemmaCalendar({ location, currentDate }) {
  const [hoveredDay, setHoveredDay] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  const lat = location?.latitude ?? 40
  const lng = location?.longitude ?? -74
  const year = currentDate.getFullYear()

  const days = useMemo(() => {
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
    const totalDays = isLeap ? 366 : 365

    // Pass 1: find the earliest sunset (UTC minutes since midnight)
    let earliestUTCMins = Infinity
    for (let d = 0; d < totalDays; d++) {
      const date = new Date(year, 0, 1 + d)
      const { sunset } = SunCalc.getTimes(date, lat, lng)
      if (sunset && !isNaN(sunset)) {
        const m = sunset.getUTCHours() * 60 + sunset.getUTCMinutes()
        if (m < earliestUTCMins) earliestUTCMins = m
      }
    }
    const obsHour = Math.floor(earliestUTCMins / 60)
    const obsMin = earliestUTCMins % 60

    // Pass 2: sun position at that fixed UTC time every day
    const result = []
    for (let d = 0; d < totalDays; d++) {
      const date = new Date(year, 0, 1 + d)
      const { sunrise, sunset } = SunCalc.getTimes(date, lat, lng)

      const obsTime = new Date(Date.UTC(
        date.getFullYear(), date.getMonth(), date.getDate(), obsHour, obsMin
      ))
      const { azimuth, altitude } = SunCalc.getPosition(obsTime, lat, lng)

      let dayLen = 0
      if (sunrise && sunset && !isNaN(sunrise) && !isNaN(sunset)) {
        dayLen = (sunset - sunrise) / 3600000
      }

      result.push({
        date,
        az: azimuth * (180 / Math.PI),   // degrees, south=0, west=+, east=-
        alt: altitude * (180 / Math.PI),  // degrees above horizon
        dayLen,
        dayOfYear: d,
      })
    }
    return result
  }, [year, lat, lng])

  const minLen = useMemo(() => Math.min(...days.map(d => d.dayLen)), [days])
  const maxLen = useMemo(() => Math.max(...days.map(d => d.dayLen)), [days])

  // SVG canvas
  const W = 500
  const H = 700
  const padL = 30, padR = 30, padT = 40, padB = 80

  const azValues = days.map(d => d.az)
  const altValues = days.map(d => d.alt)
  const azMin = Math.min(...azValues), azMax = Math.max(...azValues)
  const altMin = Math.min(...altValues), altMax = Math.max(...altValues)

  // Add breathing room
  const azRange = azMax - azMin || 1
  const altRange = altMax - altMin || 1
  const azPad = azRange * 0.12
  const altPad = altRange * 0.08

  function toX(az) {
    // eastward (negative az) → left side of screen, like looking east
    return padL + ((az - (azMin - azPad)) / (azRange + 2 * azPad)) * (W - padL - padR)
  }
  function toY(alt) {
    return padT + (1 - (alt - (altMin - altPad)) / (altRange + 2 * altPad)) * (H - padT - padB)
  }

  // Today
  const todayDOY = useMemo(() => {
    const start = new Date(year, 0, 1)
    return Math.floor((currentDate - start) / 86400000)
  }, [year, currentDate])

  const tomorrowDOY = (todayDOY + 1) % days.length

  // Special dates
  const specialDOYs = useMemo(() => {
    return SPECIAL_DATES.map(({ month, day, label }) => {
      const date = new Date(year, month - 1, day)
      const doy = Math.floor((date - new Date(year, 0, 1)) / 86400000)
      return { doy, label }
    })
  }, [year])

  const handleMouseEnter = (e, d) => {
    const svgEl = e.currentTarget.closest('svg')
    const rect = svgEl.getBoundingClientRect()
    const svgW = rect.width
    const svgH = rect.height
    // Map from SVG viewBox coords to screen coords
    const scaleX = svgW / W
    const scaleY = svgH / H
    setTooltipPos({
      x: toX(d.az) * scaleX,
      y: toY(d.alt) * scaleY
    })
    setHoveredDay(d)
  }

  return (
    <div className="flex flex-col items-center justify-center w-full" style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: '500px', margin: '0 auto' }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          onMouseLeave={() => setHoveredDay(null)}
        >
          {/* All day dots — every 3rd day, always include today + special dates */}
          {days.map((d, i) => {
            const isToday = i === todayDOY
            const special = specialDOYs.find(s => s.doy === i)
            if (i % 3 !== 0 && !isToday && !special) return null

            const x = toX(d.az)
            const y = toY(d.alt)
            const color = seasonColor(d.dayOfYear, days.length)
            // Animation runs from tomorrow → wrapping around the year → ending on today
            const seqPos = (d.dayOfYear - tomorrowDOY + days.length) % days.length
            const fadeDelay = `${(seqPos / (days.length - 1)) * 1.2}s`
            const todayDelay = '1.2s'

            const pulseDelay = `${parseFloat(todayDelay) + 0.9}s`

            return (
              <g key={i}>
                {special && (
                  <>
                    <circle cx={x} cy={y} r={10} fill={color}
                      style={{ opacity: 0, animation: 'haloFadeIn1 0.3s ease-out forwards', animationDelay: fadeDelay }} />
                    <circle cx={x} cy={y} r={6} fill={color}
                      style={{ opacity: 0, animation: 'haloFadeIn2 0.3s ease-out forwards', animationDelay: fadeDelay }} />
                  </>
                )}
                {isToday ? (
                  <>
                    {/* One-shot burst ring */}
                    <circle cx={x} cy={y} r={5} fill="none" stroke={color} strokeWidth="1.5"
                      style={{
                        opacity: 0,
                        animation: 'sonarBurst 0.9s ease-out forwards',
                        animationDelay: todayDelay,
                      }} />
                    {/* Gentle pulse — starts after burst */}
                    <circle cx={x} cy={y} r={5} fill="none" stroke={color} strokeWidth="1.5"
                      style={{
                        opacity: 0,
                        animation: `dotFadeIn 0.01s forwards, sonarPulse 2.5s ease-in-out infinite`,
                        animationDelay: `${pulseDelay}, ${pulseDelay}`,
                      }} />
                    {/* Dot */}
                    <circle cx={x} cy={y} r={5.5} fill={color}
                      style={{ opacity: 0, animation: 'dotFadeIn 0.2s ease-out forwards', animationDelay: todayDelay }} />
                    <circle cx={x} cy={y} r={10} fill="transparent"
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={e => handleMouseEnter(e, d)}
                      onMouseLeave={() => setHoveredDay(null)} />
                  </>
                ) : (
                  <circle cx={x} cy={y} r={2.8} fill={color}
                    style={{ opacity: 0, cursor: 'pointer', animation: 'dotFadeIn 0.3s ease-out forwards', animationDelay: fadeDelay }}
                    onMouseEnter={e => handleMouseEnter(e, d)}
                    onMouseLeave={() => setHoveredDay(null)}
                  />
                )}
              </g>
            )
          })}

        </svg>

        {/* Tooltip */}
        {hoveredDay && (
          <div className="ios-glass" style={{
            position: 'absolute',
            left: tooltipPos.x + 14,
            top: tooltipPos.y - 14,
            pointerEvents: 'none',
            padding: '10px 14px',
            borderRadius: '12px',
            zIndex: 100,
            minWidth: '140px',
            transform: tooltipPos.x > 340 ? 'translateX(calc(-100% - 28px))' : undefined,
          }}>
            <div style={{ color: 'white', fontSize: '13px', fontWeight: '600', marginBottom: '3px' }}>
              {hoveredDay.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
              {formatDayLength(hoveredDay.dayLen)}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '2px' }}>
              {formatRate(days, hoveredDay.dayOfYear)}
            </div>
          </div>
        )}
      </div>

      {/* Caption */}
      <div style={{
        color: 'rgba(255,255,255,0.3)',
        fontSize: '11px',
        marginTop: '6px',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        textAlign: 'center',
      }}>
        {year} Analemma · {location?.name || 'Your Location'}
      </div>
    </div>
  )
}
