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

  // Convert UTC time to local display time using the browser's actual timezone.
  // Note: this is exact for the user's own location; for manually-entered
  // locations it still shows in the user's local timezone (a full per-location
  // timezone lookup would require an external API).
  const toLocalTime = (date) => {
    const offsetMs = -currentDate.getTimezoneOffset() * 60 * 1000
    return new Date(date.getTime() + offsetMs)
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

  const traditionalMoonData = [
    { name: 'Wolf Moon', description: 'Named for the howling of hungry wolves during the cold depths of winter. Native American tribes and early European settlers heard wolf packs howling more frequently during January\'s long, cold nights. For farmers, this was a time of planning and preparation, as the ground was too frozen for planting.', folklore: 'Ancient farmers used this time to inventory supplies, repair tools, and plan the coming year\'s crops. The Wolf Moon signaled the heart of winter - a reminder to conserve resources and stay vigilant.' },
    { name: 'Snow Moon', description: 'February typically brings the heaviest snowfalls in many regions of North America, giving this moon its name. Also called the Hunger Moon, as hunting became difficult and food stores ran low.', folklore: 'For early settlers and farmers, the Snow Moon was a test of winter preparation. Merchants reduced travel due to dangerous conditions. Communities relied on preserved food and close-knit support to survive the hardest month.' },
    { name: 'Worm Moon', description: 'As temperatures warm, earthworm casts begin to appear, signaling the thawing of the ground. Also called the Crow Moon for the cawing crows that herald spring\'s arrival.', folklore: 'The Worm Moon marked a turning point for farmers - a sign that spring was near and soil would soon be workable. Maple syrup harvesting began. Merchants prepared for renewed trade as winter\'s isolation ended.' },
    { name: 'Pink Moon', description: 'Named for the wild ground phlox (pink moss) that blooms in early spring. One of the first widespread flowers of spring in North America. Also called the Sprouting Grass Moon or Egg Moon.', folklore: 'For farmers, the Pink Moon signaled the beginning of the planting season. Fields were prepared, seeds were sown. Fishermen knew shad and other fish were running. The agricultural year truly began under this moon.' },
    { name: 'Flower Moon', description: 'May brings an abundance of blooming flowers across the landscape. Also called the Corn Planting Moon or Milk Moon, as this was when corn was planted and cows gave plentiful milk on fresh grass.', folklore: 'Ancient farmers planted crops that required warm soil - corn, beans, squash. The Flower Moon meant fertile fields and the promise of harvest. Beekeepers knew flowers meant strong honey production ahead.' },
    { name: 'Strawberry Moon', description: 'Named for the short strawberry harvesting season in June. Native American Algonquin tribes knew this moon signaled the time to gather ripening strawberries.', folklore: 'The Strawberry Moon marked the first major harvest for farmers. Wild strawberries were gathered and preserved. European settlers called it the Rose Moon, as roses bloomed abundantly. A time of plenty after spring\'s work.' },
    { name: 'Buck Moon', description: 'Male deer (bucks) begin growing new antlers in July, covered in velvety fur. Also called the Thunder Moon for summer\'s frequent thunderstorms, or Hay Moon for the hay harvest.', folklore: 'For farmers, the Buck Moon meant haying season - cutting, drying, and storing grass for winter livestock feed. The year\'s first major harvest. Thunderstorms could ruin hay crops, so timing was critical.' },
    { name: 'Sturgeon Moon', description: 'Named for the sturgeon fish that were most readily caught in the Great Lakes and Lake Champlain during August. Also called the Green Corn Moon or Grain Moon.', folklore: 'Ancient fishermen knew August brought the best sturgeon fishing. Farmers began harvesting early corn. This moon signaled the transition from growing to harvesting season - a time of plenty and hard work.' },
    { name: 'Harvest Moon', description: 'The full moon closest to the autumn equinox, rising near sunset for several nights. Its bright light allowed farmers to work late into the evening harvesting crops. A crucial advantage before electricity.', folklore: 'The Harvest Moon was the most important to farmers. Extra moonlight meant extra harvesting time for crops that needed immediate attention. Communities came together for harvest. Merchants prepared for winter trade.' },
    { name: "Hunter's Moon", description: 'Following the Harvest Moon, the Hunter\'s Moon provided bright light for hunting game that had fattened on fallen grains. Fields were clear, making game easier to spot. Also called the Blood Moon or Sanguine Moon.', folklore: 'After harvest, ancient peoples hunted and preserved meat for winter. The bright moon allowed tracking prey at night. Farmers finished field work and prepared livestock for winter. A time of urgent preparation.' },
    { name: 'Beaver Moon', description: 'November was when beavers were most active building winter dams, and when trappers set beaver traps before waters froze. Also called the Frost Moon as cold weather arrived.', folklore: 'Ancient peoples set traps for beaver pelts - valuable for winter clothing and trade. Farmers completed final preparations: storing root vegetables, smoking meat, ensuring livestock had shelter. Last chance before deep winter.' },
    { name: 'Cold Moon', description: 'December\'s full moon marks the arrival of winter\'s coldest period. Also called the Long Nights Moon, as it occurs near the winter solstice when nights are longest.', folklore: 'The Cold Moon signaled deep winter for ancient peoples. All preparation must be complete. Farmers settled in for winter, living on stored food. Communities gathered for winter solstice celebrations, knowing the days would soon lengthen.' },
  ]

  const getMoonName = () => {
    return getMoonInfo().name
  }

  const getMoonInfo = () => {
    let nextFullMoon = null
    for (let daysAhead = 0; daysAhead <= 45; daysAhead++) {
      const checkDate = new Date(currentDate)
      checkDate.setDate(checkDate.getDate() + daysAhead)
      const moonPhase = SunCalc.getMoonIllumination(checkDate)
      if (moonPhase.phase >= 0.47 && moonPhase.phase <= 0.53) {
        nextFullMoon = checkDate
        break
      }
    }
    const targetMonth = nextFullMoon ? nextFullMoon.getMonth() : currentDate.getMonth()
    return traditionalMoonData[targetMonth]
  }

  const isBlueMoon = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const lastDay = new Date(year, month + 1, 0)
    const fullMoonDates = []
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day, 12, 0, 0)
      const moonPhase = SunCalc.getMoonIllumination(date)
      if (moonPhase.phase >= 0.47 && moonPhase.phase <= 0.53) {
        const isDuplicate = fullMoonDates.some(d => Math.abs(d.getDate() - day) <= 1)
        if (!isDuplicate) fullMoonDates.push(new Date(year, month, day))
      }
    }
    return fullMoonDates.length >= 2
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
  const moonInfo = getMoonInfo()
  const moonName = moonInfo.name
  const blueMoon = isBlueMoon()
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
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        cursor: 'pointer'
      }}
      onClick={() => setShowMoonModal(true)}
      >
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
                style={{
                  minWidth: '44px',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '-8px',
                  marginRight: '-8px'
                }}
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
          className="fixed inset-0 flex items-center justify-center p-4"
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
                style={{
                  minWidth: '44px',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '-8px',
                  marginRight: '-8px'
                }}
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

              {/* Distance */}
              <div className="p-3 rounded-xl" style={{ background: 'rgba(30, 30, 40, 0.3)' }}>
                <div className="text-slate-400 text-xs mb-1">Distance from Earth</div>
                <div className="text-slate-300 text-sm">
                  {Math.round(moonData.distance).toLocaleString()} km
                </div>
              </div>

              {/* Blue Moon info */}
              {blueMoon && (
                <div className="p-4 rounded-xl" style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(29, 78, 216, 0.15) 100%)',
                  border: '2px solid rgba(59, 130, 246, 0.4)',
                  boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)'
                }}>
                  <h3 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
                    <span>🔵</span> What is a Blue Moon?
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    A Blue Moon occurs when two full moons happen in the same calendar month — approximately once every 2–3 years, giving rise to the phrase "once in a blue moon."
                  </p>
                </div>
              )}

              {/* Moon Name Origin */}
              <div className="p-4 rounded-xl" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(96, 165, 250, 0.3)' }}>
                <h3 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
                  <span>📖</span> Origin
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {moonInfo.description}
                </p>
              </div>

              {/* Folklore */}
              <div className="p-4 rounded-xl" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(96, 165, 250, 0.3)' }}>
                <h3 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
                  <span>🌾</span> For Ancient Farmers & Traders
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {moonInfo.folklore}
                </p>
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
