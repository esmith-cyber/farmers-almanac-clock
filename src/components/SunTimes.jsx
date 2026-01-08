import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { createPortal } from 'react-dom'
import SunCalc from 'suncalc'

function SunTimes({ location, currentDate }) {
  const [sunTimes, setSunTimes] = useState(null)
  const [moonData, setMoonData] = useState(null)
  const [showSunModal, setShowSunModal] = useState(false)
  const [showMoonModal, setShowMoonModal] = useState(false)

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
      {/* Desktop: Side Panels */}
      {/* Sun Info Panel - Left Side */}
      <div className="absolute left-0 ios-glass hidden md:block" style={{
        width: 'min(15vw, 200px)',
        bottom: 'min(8vh, 80px)',
        padding: 'min(1.5vw, 20px)',
        borderTopRightRadius: '20px',
        borderBottomRightRadius: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ marginBottom: 'min(1.2vw, 12px)' }}>
          <div style={{
            fontSize: 'min(3vw, 32px)',
            marginBottom: 'min(0.5vw, 6px)',
            filter: 'drop-shadow(0 0 8px rgba(255, 200, 100, 0.5))'
          }}>{period.emoji}</div>
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
      <div className="absolute right-0 ios-glass hidden md:block" style={{
        width: 'min(15vw, 200px)',
        bottom: 'min(8vh, 80px)',
        padding: 'min(1.5vw, 20px)',
        borderTopLeftRadius: '20px',
        borderBottomLeftRadius: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ marginBottom: 'min(1.2vw, 12px)' }}>
          <div style={{
            fontSize: 'min(3vw, 32px)',
            marginBottom: 'min(0.5vw, 6px)',
            filter: 'drop-shadow(0 0 8px rgba(200, 200, 255, 0.4))'
          }}>{moonEmoji}</div>
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

      {/* Mobile: Top Card - Sun Info */}
      <div className="md:hidden fixed left-0 right-0 z-40" style={{
        top: 'max(80px, calc(env(safe-area-inset-top) + 80px))',
        padding: '0 12px'
      }}>
        <div
          className="ios-glass"
          style={{
            padding: '12px',
            borderRadius: '16px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
            cursor: 'pointer'
          }}
          onClick={() => setShowSunModal(true)}
        >
          <div className="flex items-center gap-3">
            <div style={{ fontSize: '32px' }}>{period.emoji}</div>
            <div className="flex-1">
              <div className="text-white font-semibold text-base">{period.name}</div>
              <div className="text-slate-400 text-xs">{format(currentDate, 'MMM d, yyyy')}</div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-3">
                <div>
                  <div className="text-slate-400 text-xs">Sunrise</div>
                  <div className="text-amber-400 font-bold text-sm">{formatTime(sunTimes.sunrise)}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-xs">Sunset</div>
                  <div className="text-orange-400 font-bold text-sm">{formatTime(sunTimes.sunset)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Bottom Card - Moon Info */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40" style={{
        padding: '12px',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))'
      }}>
        <div
          className="ios-glass"
          style={{
            padding: '12px',
            borderRadius: '16px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
            cursor: 'pointer'
          }}
          onClick={() => setShowMoonModal(true)}
        >
          <div className="flex items-center gap-3">
            <div style={{ fontSize: '32px' }}>{moonEmoji}</div>
            <div className="flex-1">
              <div className="text-white font-semibold text-base">{moonName}</div>
              <div className="text-slate-400 text-xs">{moonPhaseName}</div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-3">
                <div>
                  <div className="text-slate-400 text-xs">Illumination</div>
                  <div className="text-slate-300 font-bold text-sm">{illuminationPercent}%</div>
                </div>
                {moonData.rise && (
                  <div>
                    <div className="text-slate-400 text-xs">Moonrise</div>
                    <div className="text-slate-300 font-bold text-sm">{formatTime(moonData.rise)}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sun Info Modal */}
      {showSunModal && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center p-4 md:hidden"
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(10px)',
            zIndex: 9999
          }}
          onClick={() => setShowSunModal(false)}
        >
          <div
            className="ios-glass-thick max-w-sm w-full"
            style={{
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div style={{ fontSize: '48px', filter: 'drop-shadow(0 0 8px rgba(255, 200, 100, 0.5))' }}>
                  {period.emoji}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{period.name}</h2>
                  <p className="text-slate-400 text-sm">{format(currentDate, 'MMMM d, yyyy')}</p>
                </div>
              </div>
              <button
                onClick={() => setShowSunModal(false)}
                className="text-slate-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Primary Times */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl" style={{ background: 'rgba(251, 191, 36, 0.1)' }}>
                  <div className="text-slate-400 text-xs mb-1">Sunrise</div>
                  <div className="text-amber-400 font-bold text-lg">{formatTime(sunTimes.sunrise)}</div>
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'rgba(251, 146, 60, 0.1)' }}>
                  <div className="text-slate-400 text-xs mb-1">Sunset</div>
                  <div className="text-orange-400 font-bold text-lg">{formatTime(sunTimes.sunset)}</div>
                </div>
              </div>

              {/* Day Length */}
              <div className="p-4 rounded-xl" style={{ background: 'rgba(100, 116, 139, 0.1)', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
                <div className="text-slate-400 text-xs mb-1">Day Length</div>
                <div className="text-white font-bold text-xl">
                  {(() => {
                    const duration = sunTimes.sunset - sunTimes.sunrise
                    const hours = Math.floor(duration / (1000 * 60 * 60))
                    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
                    return `${hours}h ${minutes}m`
                  })()}
                </div>
              </div>

              {/* Additional Times */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-xl" style={{ background: 'rgba(30, 30, 40, 0.3)' }}>
                  <span className="text-slate-400 text-sm">Solar Noon</span>
                  <span className="text-white font-semibold">{formatTime(sunTimes.solarNoon)}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl" style={{ background: 'rgba(30, 30, 40, 0.3)' }}>
                  <span className="text-slate-400 text-sm">Dawn (Civil)</span>
                  <span className="text-slate-300">{formatTime(sunTimes.dawn)}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl" style={{ background: 'rgba(30, 30, 40, 0.3)' }}>
                  <span className="text-slate-400 text-sm">Dusk (Civil)</span>
                  <span className="text-slate-300">{formatTime(sunTimes.dusk)}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl" style={{ background: 'rgba(30, 30, 40, 0.3)' }}>
                  <span className="text-slate-400 text-sm">Nautical Dawn</span>
                  <span className="text-slate-300">{formatTime(sunTimes.nauticalDawn)}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl" style={{ background: 'rgba(30, 30, 40, 0.3)' }}>
                  <span className="text-slate-400 text-sm">Nautical Dusk</span>
                  <span className="text-slate-300">{formatTime(sunTimes.nauticalDusk)}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl" style={{ background: 'rgba(30, 30, 40, 0.3)' }}>
                  <span className="text-slate-400 text-sm">Night Begins</span>
                  <span className="text-slate-300">{formatTime(sunTimes.night)}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl" style={{ background: 'rgba(30, 30, 40, 0.3)' }}>
                  <span className="text-slate-400 text-sm">Night Ends</span>
                  <span className="text-slate-300">{formatTime(sunTimes.nightEnd)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Moon Info Modal */}
      {showMoonModal && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center p-4 md:hidden"
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(10px)',
            zIndex: 9999
          }}
          onClick={() => setShowMoonModal(false)}
        >
          <div
            className="ios-glass-thick max-w-sm w-full"
            style={{
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div style={{ fontSize: '48px', filter: 'drop-shadow(0 0 8px rgba(200, 200, 255, 0.4))' }}>
                  {moonEmoji}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{moonName}</h2>
                  <p className="text-slate-400 text-sm">{moonPhaseName}</p>
                </div>
              </div>
              <button
                onClick={() => setShowMoonModal(false)}
                className="text-slate-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Illumination */}
              <div className="p-4 rounded-xl" style={{ background: 'rgba(100, 116, 139, 0.1)', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
                <div className="text-slate-400 text-xs mb-1">Illumination</div>
                <div className="flex items-baseline gap-2">
                  <div className="text-white font-bold text-3xl">{illuminationPercent}</div>
                  <div className="text-slate-400 text-xl">%</div>
                </div>
              </div>

              {/* Phase Progress */}
              <div className="p-4 rounded-xl" style={{ background: 'rgba(100, 116, 139, 0.1)', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
                <div className="text-slate-400 text-xs mb-2">Lunar Cycle Progress</div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-400 transition-all duration-300"
                    style={{ width: `${moonData.phase * 100}%` }}
                  />
                </div>
                <div className="text-slate-400 text-xs mt-1">
                  {Math.round(moonData.phase * 100)}% through cycle
                </div>
              </div>

              {/* Times */}
              <div className="space-y-3">
                {moonData.rise && (
                  <div className="flex justify-between items-center p-3 rounded-xl" style={{ background: 'rgba(30, 30, 40, 0.3)' }}>
                    <span className="text-slate-400 text-sm">Moonrise</span>
                    <span className="text-white font-semibold">{formatTime(moonData.rise)}</span>
                  </div>
                )}
                {moonData.set && (
                  <div className="flex justify-between items-center p-3 rounded-xl" style={{ background: 'rgba(30, 30, 40, 0.3)' }}>
                    <span className="text-slate-400 text-sm">Moonset</span>
                    <span className="text-white font-semibold">{formatTime(moonData.set)}</span>
                  </div>
                )}
              </div>

              {/* Position */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl" style={{ background: 'rgba(30, 30, 40, 0.3)' }}>
                  <div className="text-slate-400 text-xs mb-1">Altitude</div>
                  <div className="text-white font-semibold text-lg">
                    {Math.round(moonData.altitude * (180 / Math.PI))}°
                  </div>
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'rgba(30, 30, 40, 0.3)' }}>
                  <div className="text-slate-400 text-xs mb-1">Azimuth</div>
                  <div className="text-white font-semibold text-lg">
                    {Math.round(moonData.azimuth * (180 / Math.PI))}°
                  </div>
                </div>
              </div>

              {/* Distance (approximate) */}
              <div className="p-3 rounded-xl" style={{ background: 'rgba(30, 30, 40, 0.3)' }}>
                <div className="text-slate-400 text-xs mb-1">Distance from Earth</div>
                <div className="text-slate-300 text-sm">
                  {(() => {
                    // Moon distance varies between ~356,500 km and ~406,700 km
                    // Average is about 384,400 km
                    const avgDistance = 384400
                    return `~${avgDistance.toLocaleString()} km`
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export default SunTimes
