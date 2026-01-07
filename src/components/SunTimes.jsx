import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import SunCalc from 'suncalc'

function SunTimes({ location, currentDate }) {
  const [sunTimes, setSunTimes] = useState(null)
  const [moonData, setMoonData] = useState(null)

  useEffect(() => {
    if (!location) return

    const times = SunCalc.getTimes(currentDate, location.latitude, location.longitude)
    setSunTimes(times)

    const illumination = SunCalc.getMoonIllumination(currentDate)
    const moonTimes = SunCalc.getMoonTimes(currentDate, location.latitude, location.longitude)
    const moonPosition = SunCalc.getMoonPosition(currentDate, location.latitude, location.longitude)
    setMoonData({ ...illumination, ...moonTimes, ...moonPosition })
  }, [location, currentDate])

  if (!sunTimes || !moonData) return null

  // Helper to convert UTC time to local time at target location
  const toLocalTime = (date) => {
    // Calculate timezone offset from longitude (15 degrees = 1 hour)
    const timezoneOffsetHours = location.longitude / 15
    const offsetMilliseconds = timezoneOffsetHours * 60 * 60 * 1000

    // Create new date with adjusted time
    return new Date(date.getTime() + offsetMilliseconds)
  }

  const formatTime = (date) => {
    const localDate = toLocalTime(date)

    // Get UTC hours/minutes from the adjusted date (which represents local time at target)
    const hours = localDate.getUTCHours()
    const minutes = localDate.getUTCMinutes()

    // Format as 12-hour time
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    const displayMinutes = minutes.toString().padStart(2, '0')

    return `${displayHours}:${displayMinutes} ${period}`
  }

  const getCurrentPeriod = () => {
    const now = currentDate.getTime()
    const dawn = sunTimes.dawn.getTime()
    const sunrise = sunTimes.sunrise.getTime()
    const sunset = sunTimes.sunset.getTime()
    const dusk = sunTimes.dusk.getTime()

    if (now < dawn) return { name: 'Night', emoji: '🌙' }
    if (now < sunrise) return { name: 'Dawn', emoji: '🌅' }
    if (now < sunTimes.solarNoon.getTime()) return { name: 'Morning', emoji: '☀️' }
    if (now < sunset) return { name: 'Afternoon', emoji: '☀️' }
    if (now < dusk) return { name: 'Dusk', emoji: '🌇' }
    return { name: 'Night', emoji: '🌙' }
  }

  const getMoonPhaseName = () => {
    const phase = moonData.phase
    if (phase < 0.03 || phase > 0.97) return 'New Moon'
    if (phase < 0.22) return 'Waxing Crescent'
    if (phase < 0.28) return 'First Quarter'
    if (phase < 0.47) return 'Waxing Gibbous'
    if (phase < 0.53) return 'Full Moon'
    if (phase < 0.72) return 'Waning Gibbous'
    if (phase < 0.78) return 'Last Quarter'
    return 'Waning Crescent'
  }

  const getMoonName = () => {
    const month = currentDate.getMonth()
    const moonNames = [
      'Wolf Moon',
      'Snow Moon',
      'Worm Moon',
      'Pink Moon',
      'Flower Moon',
      'Strawberry Moon',
      'Buck Moon',
      'Sturgeon Moon',
      'Harvest Moon',
      "Hunter's Moon",
      'Beaver Moon',
      'Cold Moon'
    ]
    return moonNames[month]
  }

  // Get moon emoji based on phase
  const getMoonEmoji = () => {
    const phase = moonData.phase
    if (phase < 0.03 || phase > 0.97) return '🌑'
    if (phase < 0.22) return '🌒'
    if (phase < 0.28) return '🌓'
    if (phase < 0.47) return '🌔'
    if (phase < 0.53) return '🌕'
    if (phase < 0.72) return '🌖'
    if (phase < 0.78) return '🌗'
    return '🌘'
  }

  const period = getCurrentPeriod()
  const moonPhaseName = getMoonPhaseName()
  const moonName = getMoonName()
  const moonEmoji = getMoonEmoji()
  const illuminationPercent = Math.round(moonData.fraction * 100)

  return (
    <>
      {/* Sun Info Panel - Left Side */}
      <div className="absolute left-0 bg-slate-800/90 backdrop-blur shadow-xl hidden md:block" style={{
        width: 'min(15vw, 200px)',
        bottom: 'min(8vh, 80px)',
        padding: 'min(1.5vw, 16px)',
        borderTopRightRadius: 'min(1.5vw, 16px)',
        borderBottomRightRadius: 'min(1.5vw, 16px)'
      }}>
        <div style={{ marginBottom: 'min(1.2vw, 12px)' }}>
          <div style={{ fontSize: 'min(3vw, 32px)', marginBottom: 'min(0.5vw, 6px)' }}>{period.emoji}</div>
          <h3 className="font-bold text-white" style={{ fontSize: 'min(1.5vw, 18px)' }}>{period.name}</h3>
          <p className="text-slate-400" style={{ fontSize: 'min(1vw, 12px)' }}>{format(currentDate, 'MMM d, yyyy')}</p>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'min(0.8vw, 8px)',
          fontSize: 'min(1.2vw, 14px)'
        }}>
          <div>
            <div className="text-slate-400" style={{ fontSize: 'min(1vw, 11px)' }}>Sunrise</div>
            <div className="text-amber-400 font-bold">
              {formatTime(sunTimes.sunrise)}
            </div>
          </div>

          <div>
            <div className="text-slate-400" style={{ fontSize: 'min(1vw, 11px)' }}>Sunset</div>
            <div className="text-orange-400 font-bold">
              {formatTime(sunTimes.sunset)}
            </div>
          </div>

          <div className="border-t border-slate-700/50" style={{ paddingTop: 'min(0.8vw, 8px)' }}>
            <div className="text-slate-400" style={{ fontSize: 'min(1vw, 11px)' }}>Day Length</div>
            <div className="text-slate-300 font-semibold" style={{ fontSize: 'min(1vw, 11px)' }}>
              {(() => {
                const duration = sunTimes.sunset - sunTimes.sunrise
                const hours = Math.floor(duration / (1000 * 60 * 60))
                const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
                return `${hours}h ${minutes}m`
              })()}
            </div>
          </div>

          <div>
            <div className="text-slate-400" style={{ fontSize: 'min(1vw, 11px)' }}>Dawn</div>
            <div className="text-slate-300" style={{ fontSize: 'min(1vw, 11px)' }}>
              {formatTime(sunTimes.dawn)}
            </div>
          </div>

          <div>
            <div className="text-slate-400" style={{ fontSize: 'min(1vw, 11px)' }}>Dusk</div>
            <div className="text-slate-300" style={{ fontSize: 'min(1vw, 11px)' }}>
              {formatTime(sunTimes.dusk)}
            </div>
          </div>
        </div>
      </div>

      {/* Moon Info Panel - Right Side */}
      <div className="absolute right-0 bg-slate-800/90 backdrop-blur shadow-xl hidden md:block" style={{
        width: 'min(15vw, 200px)',
        bottom: 'min(8vh, 80px)',
        padding: 'min(1.5vw, 16px)',
        borderTopLeftRadius: 'min(1.5vw, 16px)',
        borderBottomLeftRadius: 'min(1.5vw, 16px)'
      }}>
        <div style={{ marginBottom: 'min(1.2vw, 12px)' }}>
          <div style={{ fontSize: 'min(3vw, 32px)', marginBottom: 'min(0.5vw, 6px)' }}>{moonEmoji}</div>
          <h3 className="font-bold text-white" style={{ fontSize: 'min(1.5vw, 18px)' }}>{moonName}</h3>
          <p className="text-slate-400" style={{ fontSize: 'min(1vw, 12px)' }}>{moonPhaseName}</p>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'min(0.8vw, 8px)',
          fontSize: 'min(1.2vw, 14px)'
        }}>
          <div>
            <div className="text-slate-400" style={{ fontSize: 'min(1vw, 11px)' }}>Illumination</div>
            <div className="text-slate-300 font-semibold" style={{ fontSize: 'min(1vw, 11px)' }}>
              {illuminationPercent}%
            </div>
          </div>

          {moonData.rise && (
            <div className="border-t border-slate-700/50" style={{ paddingTop: 'min(0.8vw, 8px)' }}>
              <div className="text-slate-400" style={{ fontSize: 'min(1vw, 11px)' }}>Moonrise</div>
              <div className="text-slate-300" style={{ fontSize: 'min(1vw, 11px)' }}>
                {formatTime(moonData.rise)}
              </div>
            </div>
          )}

          {moonData.set && (
            <div>
              <div className="text-slate-400" style={{ fontSize: 'min(1vw, 11px)' }}>Moonset</div>
              <div className="text-slate-300" style={{ fontSize: 'min(1vw, 11px)' }}>
                {formatTime(moonData.set)}
              </div>
            </div>
          )}

          <div className="border-t border-slate-700/50" style={{ paddingTop: 'min(0.8vw, 8px)' }}>
            <div className="text-slate-400" style={{ fontSize: 'min(1vw, 11px)' }}>Altitude</div>
            <div className="text-slate-300 font-semibold" style={{ fontSize: 'min(1vw, 11px)' }}>
              {Math.round(moonData.altitude * (180 / Math.PI))}°
            </div>
          </div>

          <div>
            <div className="text-slate-400" style={{ fontSize: 'min(1vw, 11px)' }}>Azimuth</div>
            <div className="text-slate-300" style={{ fontSize: 'min(1vw, 11px)' }}>
              {Math.round(moonData.azimuth * (180 / Math.PI))}°
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SunTimes
