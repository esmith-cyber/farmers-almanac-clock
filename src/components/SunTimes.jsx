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
      <div className="absolute left-0 bg-slate-800/90 backdrop-blur shadow-xl" style={{
        maxWidth: 'min(18vw, 320px)',
        minWidth: '160px',
        bottom: 'min(8vh, 80px)',
        padding: 'min(2vw, 24px)',
        borderTopRightRadius: 'min(2vw, 20px)',
        borderBottomRightRadius: 'min(2vw, 20px)'
      }}>
        <div style={{ marginBottom: 'min(2vw, 18px)' }}>
          <div style={{ fontSize: 'min(4.5vw, 48px)', marginBottom: 'min(0.8vw, 8px)' }}>{period.emoji}</div>
          <h3 className="font-bold text-white" style={{ fontSize: 'min(2.2vw, 24px)' }}>{period.name}</h3>
          <p className="text-slate-400" style={{ fontSize: 'min(1.4vw, 16px)' }}>{format(currentDate, 'MMM d, yyyy')}</p>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'min(1.2vw, 12px)',
          fontSize: 'min(1.8vw, 18px)'
        }}>
          <div>
            <div className="text-slate-400" style={{ fontSize: 'min(1.4vw, 14px)' }}>Sunrise</div>
            <div className="text-amber-400 font-bold">
              {formatTime(sunTimes.sunrise)}
            </div>
          </div>

          <div>
            <div className="text-slate-400" style={{ fontSize: 'min(1.4vw, 14px)' }}>Sunset</div>
            <div className="text-orange-400 font-bold">
              {formatTime(sunTimes.sunset)}
            </div>
          </div>

          <div className="border-t border-slate-700/50" style={{ paddingTop: 'min(1.2vw, 10px)' }}>
            <div className="text-slate-400" style={{ fontSize: 'min(1.4vw, 14px)' }}>Day Length</div>
            <div className="text-slate-300 font-semibold" style={{ fontSize: 'min(1.4vw, 14px)' }}>
              {(() => {
                const duration = sunTimes.sunset - sunTimes.sunrise
                const hours = Math.floor(duration / (1000 * 60 * 60))
                const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
                return `${hours}h ${minutes}m`
              })()}
            </div>
          </div>

          <div>
            <div className="text-slate-400" style={{ fontSize: 'min(1.4vw, 14px)' }}>Dawn</div>
            <div className="text-slate-300" style={{ fontSize: 'min(1.4vw, 14px)' }}>
              {formatTime(sunTimes.dawn)}
            </div>
          </div>

          <div>
            <div className="text-slate-400" style={{ fontSize: 'min(1.4vw, 14px)' }}>Dusk</div>
            <div className="text-slate-300" style={{ fontSize: 'min(1.4vw, 14px)' }}>
              {formatTime(sunTimes.dusk)}
            </div>
          </div>
        </div>
      </div>

      {/* Moon Info Panel - Right Side */}
      <div className="absolute right-0 bg-slate-800/90 backdrop-blur shadow-xl" style={{
        maxWidth: 'min(18vw, 320px)',
        minWidth: '160px',
        bottom: 'min(8vh, 80px)',
        padding: 'min(2vw, 24px)',
        borderTopLeftRadius: 'min(2vw, 20px)',
        borderBottomLeftRadius: 'min(2vw, 20px)'
      }}>
        <div style={{ marginBottom: 'min(2vw, 18px)' }}>
          <div style={{ fontSize: 'min(4.5vw, 48px)', marginBottom: 'min(0.8vw, 8px)' }}>{moonEmoji}</div>
          <h3 className="font-bold text-white" style={{ fontSize: 'min(2.2vw, 24px)' }}>{moonName}</h3>
          <p className="text-slate-400" style={{ fontSize: 'min(1.4vw, 16px)' }}>{moonPhaseName}</p>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'min(1.2vw, 12px)',
          fontSize: 'min(1.8vw, 18px)'
        }}>
          <div>
            <div className="text-slate-400" style={{ fontSize: 'min(1.4vw, 14px)' }}>Illumination</div>
            <div className="text-slate-300 font-semibold" style={{ fontSize: 'min(1.4vw, 14px)' }}>
              {illuminationPercent}%
            </div>
          </div>

          {moonData.rise && (
            <div className="border-t border-slate-700/50" style={{ paddingTop: 'min(1.2vw, 10px)' }}>
              <div className="text-slate-400" style={{ fontSize: 'min(1.4vw, 14px)' }}>Moonrise</div>
              <div className="text-slate-300" style={{ fontSize: 'min(1.4vw, 14px)' }}>
                {formatTime(moonData.rise)}
              </div>
            </div>
          )}

          {moonData.set && (
            <div>
              <div className="text-slate-400" style={{ fontSize: 'min(1.4vw, 14px)' }}>Moonset</div>
              <div className="text-slate-300" style={{ fontSize: 'min(1.4vw, 14px)' }}>
                {formatTime(moonData.set)}
              </div>
            </div>
          )}

          <div className="border-t border-slate-700/50" style={{ paddingTop: 'min(1.2vw, 10px)' }}>
            <div className="text-slate-400" style={{ fontSize: 'min(1.4vw, 14px)' }}>Altitude</div>
            <div className="text-slate-300 font-semibold" style={{ fontSize: 'min(1.4vw, 14px)' }}>
              {Math.round(moonData.altitude * (180 / Math.PI))}°
            </div>
          </div>

          <div>
            <div className="text-slate-400" style={{ fontSize: 'min(1.4vw, 14px)' }}>Azimuth</div>
            <div className="text-slate-300" style={{ fontSize: 'min(1.4vw, 14px)' }}>
              {Math.round(moonData.azimuth * (180 / Math.PI))}°
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SunTimes
