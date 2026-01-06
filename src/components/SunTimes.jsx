import { useEffect, useState } from 'react'
import SunCalc from 'suncalc'
import { format } from 'date-fns'

function SunTimes({ location, currentDate }) {
  const [sunTimes, setSunTimes] = useState(null)

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

  if (!sunTimes) return null

  const formatTime = (date) => {
    return format(date, 'h:mm a')
  }

  const getCurrentPeriod = () => {
    const now = currentDate.getTime()
    const sunrise = sunTimes.sunrise.getTime()
    const sunset = sunTimes.sunset.getTime()
    const dawn = sunTimes.dawn.getTime()
    const dusk = sunTimes.dusk.getTime()

    if (now < dawn) return { name: 'Night', emoji: '🌙' }
    if (now < sunrise) return { name: 'Dawn', emoji: '🌅' }
    if (now < sunTimes.solarNoon.getTime()) return { name: 'Morning', emoji: '☀️' }
    if (now < sunset) return { name: 'Afternoon', emoji: '☀️' }
    if (now < dusk) return { name: 'Dusk', emoji: '🌇' }
    return { name: 'Night', emoji: '🌙' }
  }

  const period = getCurrentPeriod()

  return (
    <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">{period.emoji}</div>
        <h2 className="text-3xl font-bold text-white mb-2">{period.name}</h2>
        <p className="text-slate-400">{format(currentDate, 'EEEE, MMMM d, yyyy')}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="text-center">
          <div className="text-slate-400 text-sm mb-2">Dawn</div>
          <div className="text-white text-xl font-semibold">
            {formatTime(sunTimes.dawn)}
          </div>
        </div>

        <div className="text-center">
          <div className="text-slate-400 text-sm mb-2">Sunrise</div>
          <div className="text-amber-400 text-2xl font-bold">
            {formatTime(sunTimes.sunrise)}
          </div>
        </div>

        <div className="text-center">
          <div className="text-slate-400 text-sm mb-2">Sunset</div>
          <div className="text-orange-400 text-2xl font-bold">
            {formatTime(sunTimes.sunset)}
          </div>
        </div>

        <div className="text-center">
          <div className="text-slate-400 text-sm mb-2">Dusk</div>
          <div className="text-white text-xl font-semibold">
            {formatTime(sunTimes.dusk)}
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-700 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-slate-400 text-xs mb-1">Solar Noon</div>
          <div className="text-slate-300 text-sm font-semibold">
            {formatTime(sunTimes.solarNoon)}
          </div>
        </div>

        <div>
          <div className="text-slate-400 text-xs mb-1">Golden Hour</div>
          <div className="text-slate-300 text-sm font-semibold">
            {formatTime(sunTimes.goldenHour)}
          </div>
        </div>

        <div>
          <div className="text-slate-400 text-xs mb-1">Day Length</div>
          <div className="text-slate-300 text-sm font-semibold">
            {(() => {
              const duration = sunTimes.sunset - sunTimes.sunrise
              const hours = Math.floor(duration / (1000 * 60 * 60))
              const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
              return `${hours}h ${minutes}m`
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SunTimes
