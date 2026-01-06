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

  const formatTime = (date) => {
    return format(date, 'h:mm a')
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
      <div className="absolute left-0 bg-slate-800/90 backdrop-blur rounded-r-2xl p-4 shadow-xl" style={{
        maxWidth: '200px',
        bottom: '60px'
      }}>
        <div className="mb-3">
          <div className="text-3xl mb-1">{period.emoji}</div>
          <h3 className="text-lg font-bold text-white">{period.name}</h3>
          <p className="text-slate-400 text-xs">{format(currentDate, 'MMM d, yyyy')}</p>
        </div>

        <div className="space-y-2 text-sm">
          <div>
            <div className="text-slate-400 text-xs">Sunrise</div>
            <div className="text-amber-400 font-bold">
              {formatTime(sunTimes.sunrise)}
            </div>
          </div>

          <div>
            <div className="text-slate-400 text-xs">Sunset</div>
            <div className="text-orange-400 font-bold">
              {formatTime(sunTimes.sunset)}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-700/50">
            <div className="text-slate-400 text-xs">Day Length</div>
            <div className="text-slate-300 text-xs font-semibold">
              {(() => {
                const duration = sunTimes.sunset - sunTimes.sunrise
                const hours = Math.floor(duration / (1000 * 60 * 60))
                const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
                return `${hours}h ${minutes}m`
              })()}
            </div>
          </div>

          <div>
            <div className="text-slate-400 text-xs">Dawn</div>
            <div className="text-slate-300 text-xs">
              {formatTime(sunTimes.dawn)}
            </div>
          </div>

          <div>
            <div className="text-slate-400 text-xs">Dusk</div>
            <div className="text-slate-300 text-xs">
              {formatTime(sunTimes.dusk)}
            </div>
          </div>
        </div>
      </div>

      {/* Moon Info Panel - Right Side */}
      <div className="absolute right-0 bg-slate-800/90 backdrop-blur rounded-l-2xl p-4 shadow-xl" style={{
        maxWidth: '200px',
        bottom: '60px'
      }}>
        <div className="mb-3">
          <div className="text-3xl mb-1">{moonEmoji}</div>
          <h3 className="text-lg font-bold text-white">{moonName}</h3>
          <p className="text-slate-400 text-xs">{moonPhaseName}</p>
        </div>

        <div className="space-y-2 text-sm">
          <div>
            <div className="text-slate-400 text-xs">Illumination</div>
            <div className="text-slate-300 text-xs font-semibold">
              {illuminationPercent}%
            </div>
          </div>

          {moonData.rise && (
            <div className="pt-2 border-t border-slate-700/50">
              <div className="text-slate-400 text-xs">Moonrise</div>
              <div className="text-slate-300 text-xs">
                {formatTime(moonData.rise)}
              </div>
            </div>
          )}

          {moonData.set && (
            <div>
              <div className="text-slate-400 text-xs">Moonset</div>
              <div className="text-slate-300 text-xs">
                {formatTime(moonData.set)}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-slate-700/50">
            <div className="text-slate-400 text-xs">Altitude</div>
            <div className="text-slate-300 text-xs font-semibold">
              {Math.round(moonData.altitude * (180 / Math.PI))}°
            </div>
          </div>

          <div>
            <div className="text-slate-400 text-xs">Azimuth</div>
            <div className="text-slate-300 text-xs">
              {Math.round(moonData.azimuth * (180 / Math.PI))}°
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SunTimes
