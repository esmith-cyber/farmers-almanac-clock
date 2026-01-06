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
    // Calculate rotation to keep "now" at top
    const hours = currentDate.getHours()
    const minutes = currentDate.getMinutes()
    const seconds = currentDate.getSeconds()

    // Current time as decimal hours (0-24)
    const currentTimeInHours = hours + minutes / 60 + seconds / 3600

    // Convert to degrees (full circle = 24 hours)
    const currentAngle = (currentTimeInHours / 24) * 360

    // Rotate CLOCKWISE to put current time at top
    // Positive rotation = clockwise, so past events move to the right
    setRotation(currentAngle)
  }, [currentDate])

  if (!sunTimes) return null

  // Helper to convert Date to angle position
  const timeToAngle = (date) => {
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const timeInHours = hours + minutes / 60
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
      { angle: 360, color: '#0a0e27' }, // Back to midnight
    ]

    const stopStrings = stops.map(stop => `${stop.color} ${stop.angle}deg`)
    return `conic-gradient(from 0deg, ${stopStrings.join(', ')})`
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
    <div className="flex justify-center items-center py-12">
      <div className="relative w-[350px] h-[350px]">
        {/* Rotating Clock Face */}
        <div
          className="absolute inset-0 transition-transform duration-1000 ease-linear"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* Main Clock Circle */}
          <div
            className="relative w-full h-full rounded-full border-4 border-slate-600 shadow-2xl overflow-hidden"
            style={{ background: conicGradient }}
          >

            {/* Event Markers - subtle lines */}
            {/* Dawn */}
            <div
              className="absolute w-px h-12 bg-purple-300/60 transform -translate-x-1/2"
              style={{
                left: '50%',
                top: '0',
                transformOrigin: 'center 175px',
                transform: `translateX(-50%) rotate(${dawnAngle}deg)`,
              }}
              title={`Dawn: ${formatTime(sunTimes.dawn)}`}
            />

            {/* Sunrise - more prominent */}
            <div
              className="absolute w-0.5 h-16 bg-amber-400/80 transform -translate-x-1/2"
              style={{
                left: '50%',
                top: '0',
                transformOrigin: 'center 175px',
                transform: `translateX(-50%) rotate(${sunriseAngle}deg)`,
              }}
              title={`Sunrise: ${formatTime(sunTimes.sunrise)}`}
            />

            {/* Solar Noon - subtle bright line */}
            <div
              className="absolute w-px h-8 bg-yellow-100/70 transform -translate-x-1/2"
              style={{
                left: '50%',
                top: '0',
                transformOrigin: 'center 175px',
                transform: `translateX(-50%) rotate(${solarNoonAngle}deg)`,
              }}
              title={`Solar Noon: ${formatTime(sunTimes.solarNoon)}`}
            />

            {/* Sunset - more prominent */}
            <div
              className="absolute w-0.5 h-16 bg-orange-500/80 transform -translate-x-1/2"
              style={{
                left: '50%',
                top: '0',
                transformOrigin: 'center 175px',
                transform: `translateX(-50%) rotate(${sunsetAngle}deg)`,
              }}
              title={`Sunset: ${formatTime(sunTimes.sunset)}`}
            />

            {/* Dusk */}
            <div
              className="absolute w-px h-12 bg-indigo-300/60 transform -translate-x-1/2"
              style={{
                left: '50%',
                top: '0',
                transformOrigin: 'center 175px',
                transform: `translateX(-50%) rotate(${duskAngle}deg)`,
              }}
              title={`Dusk: ${formatTime(sunTimes.dusk)}`}
            />

            {/* Midnight - very subtle */}
            <div
              className="absolute w-px h-6 bg-slate-400/40 transform -translate-x-1/2"
              style={{
                left: '50%',
                top: '0',
                transformOrigin: 'center 175px',
                transform: `translateX(-50%) rotate(0deg)`,
              }}
              title="Midnight"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AlmanacClock
