import { useEffect, useState } from 'react'
import SunCalc from 'suncalc'

function AlmanacClock({ location, currentDate }) {
  const [sunTimes, setSunTimes] = useState(null)
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    if (location) {
      const times = SunCalc.getTimes(
        currentDate,
        location.latitude,
        location.longitude
      )
      setSunTimes(times)
    }
  }, [location, currentDate])

  useEffect(() => {
    if (!location) return

    // Calculate timezone offset from longitude (rough approximation: 15 degrees = 1 hour)
    const timezoneOffsetHours = location.longitude / 15

    // Get current UTC time
    const utcHours = currentDate.getUTCHours()
    const utcMinutes = currentDate.getUTCMinutes()
    const utcSeconds = currentDate.getUTCSeconds()

    // Calculate local time at the target location
    let localHours = utcHours + timezoneOffsetHours

    // Normalize to 0-24 range
    while (localHours < 0) localHours += 24
    while (localHours >= 24) localHours -= 24

    // Current time as decimal hours (0-24) at target location
    const currentTimeInHours = localHours + utcMinutes / 60 + utcSeconds / 3600

    // Convert to degrees (full circle = 24 hours)
    const currentAngle = (currentTimeInHours / 24) * 360

    // Rotate CLOCKWISE to put current time at top
    setRotation(currentAngle)
  }, [currentDate, location])

  if (!sunTimes || !location) return null

  // Helper to convert Date to angle position (using location's timezone)
  const timeToAngle = (date) => {
    // Calculate timezone offset from longitude
    const timezoneOffsetHours = location.longitude / 15

    // Get UTC time
    const utcHours = date.getUTCHours()
    const utcMinutes = date.getUTCMinutes()

    // Calculate local time at the target location
    let localHours = utcHours + timezoneOffsetHours

    // Normalize to 0-24 range
    while (localHours < 0) localHours += 24
    while (localHours >= 24) localHours -= 24

    const timeInHours = localHours + utcMinutes / 60
    return (timeInHours / 24) * 360
  }

  // Get angles for all sun events
  const sunriseAngle = timeToAngle(sunTimes.sunrise)
  const sunsetAngle = timeToAngle(sunTimes.sunset)
  const dawnAngle = timeToAngle(sunTimes.dawn)
  const duskAngle = timeToAngle(sunTimes.dusk)
  const solarNoonAngle = timeToAngle(sunTimes.solarNoon)
  const nightEndAngle = timeToAngle(sunTimes.nightEnd)
  const nightAngle = timeToAngle(sunTimes.night)

  // Helper to get SVG circle position for angle
  const angleToPosition = (angle, radius = 48) => {
    const rad = ((angle - 90) * Math.PI) / 180
    return {
      x: 50 + radius * Math.cos(rad),
      y: 50 + radius * Math.sin(rad),
    }
  }

  // Create conic gradient string for smooth day/night transition
  const createConicGradient = () => {
    const stops = [
      { angle: 0, color: '#0a0e27' }, // Midnight - deep night
      { angle: nightEndAngle, color: '#1a1f3a' }, // Late night
      { angle: dawnAngle, color: '#4a4a7d' }, // Dawn - purple
      { angle: dawnAngle + (sunriseAngle - dawnAngle) * 0.5, color: '#e85d75' }, // Pre-sunrise pink
      { angle: sunriseAngle, color: '#ff9966' }, // Sunrise - orange
      { angle: sunriseAngle + (solarNoonAngle - sunriseAngle) * 0.5, color: '#ffd966' }, // Morning
      { angle: solarNoonAngle, color: '#fffacd' }, // Solar noon - brightest
      { angle: solarNoonAngle + (sunsetAngle - solarNoonAngle) * 0.5, color: '#ffd966' }, // Afternoon
      { angle: sunsetAngle, color: '#ff7f50' }, // Sunset - coral
      { angle: duskAngle, color: '#6b5b95' }, // Dusk - purple
      { angle: duskAngle + (nightAngle - duskAngle) * 0.5, color: '#2a2f4a' }, // Early night
      { angle: nightAngle, color: '#1a1f3a' }, // Night
      // Fill the gap between night and midnight with multiple stops
      { angle: nightAngle + (360 - nightAngle) * 0.2, color: '#141d2e' },
      { angle: nightAngle + (360 - nightAngle) * 0.4, color: '#111825' },
      { angle: nightAngle + (360 - nightAngle) * 0.6, color: '#0e141f' },
      { angle: nightAngle + (360 - nightAngle) * 0.8, color: '#0b1019' },
      { angle: 360, color: '#0a0e27' }, // Back to midnight
    ]

    // Sort stops by angle to ensure proper ordering
    stops.sort((a, b) => a.angle - b.angle)

    const stopStrings = stops.map(stop => `${stop.color} ${stop.angle}deg`)
    return `conic-gradient(${stopStrings.join(', ')})`
  }

  const conicGradient = createConicGradient()

  // Format time for labels
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="flex justify-center items-center w-full h-full">
      <div className="relative w-full h-full">
        {/* Rotating Clock Face */}
        <div
          className="absolute inset-0 transition-transform duration-1000 ease-linear"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* Main Clock Circle */}
          <div
            className="relative w-full h-full rounded-full border-2 border-slate-600/30 shadow-2xl overflow-hidden"
            style={{ background: conicGradient }}
          >
          </div>
        </div>
      </div>
    </div>
  )
}

export default AlmanacClock
