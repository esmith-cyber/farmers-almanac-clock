import { useEffect, useState } from 'react'
import SunCalc from 'suncalc'

function MoonPhaseClock({ location, currentDate }) {
  const [moonData, setMoonData] = useState(null)
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    if (location) {
      const illumination = SunCalc.getMoonIllumination(currentDate)
      const times = SunCalc.getMoonTimes(currentDate, location.latitude, location.longitude)

      setMoonData({
        ...illumination,
        ...times
      })
    }
  }, [location, currentDate])

  useEffect(() => {
    if (!moonData) return

    // Moon phase is 0-1, where 0 = new moon, 0.5 = full moon
    // A full lunar cycle is ~29.53 days
    const lunarCycleDays = 29.53

    // Current position in the cycle (0-1)
    const currentPhase = moonData.phase

    // Convert to degrees (full circle = full lunar cycle)
    const currentAngle = currentPhase * 360

    // Rotate CLOCKWISE to put current phase at top
    // Positive rotation = clockwise, so past events move to the right
    setRotation(currentAngle)
  }, [moonData, currentDate])

  if (!moonData) return null

  // Quarter phase positions in the lunar cycle (0-360 degrees)
  // These are FIXED positions in the lunar cycle
  const newMoonAngle = 0      // Phase 0
  const firstQuarterAngle = 90   // Phase 0.25
  const fullMoonAngle = 180      // Phase 0.5
  const lastQuarterAngle = 270   // Phase 0.75

  // Create gradient that's synced to the phase positions
  // The gradient rotates WITH the disk, so phases stay in their gradient zones
  const createMoonGradient = () => {
    const stops = [
      { angle: 0, color: '#0f172a' },      // New moon position - darkest
      { angle: 45, color: '#1e293b' },     // Waxing crescent
      { angle: 90, color: '#334155' },     // First quarter position
      { angle: 135, color: '#475569' },    // Waxing gibbous
      { angle: 180, color: '#64748b' },    // Full moon position - lightest
      { angle: 225, color: '#475569' },    // Waning gibbous
      { angle: 270, color: '#334155' },    // Last quarter position
      { angle: 315, color: '#1e293b' },    // Waning crescent
      { angle: 360, color: '#0f172a' },    // Back to new moon
    ]

    const stopStrings = stops.map(stop => `${stop.color} ${stop.angle}deg`)
    return `conic-gradient(from 0deg, ${stopStrings.join(', ')})`
  }

  const moonGradient = createMoonGradient()

  // Get moon phase name
  const getPhaseName = (phase) => {
    if (phase < 0.03 || phase > 0.97) return 'New Moon'
    if (phase < 0.22) return 'Waxing Crescent'
    if (phase < 0.28) return 'First Quarter'
    if (phase < 0.47) return 'Waxing Gibbous'
    if (phase < 0.53) return 'Full Moon'
    if (phase < 0.72) return 'Waning Gibbous'
    if (phase < 0.78) return 'Last Quarter'
    return 'Waning Crescent'
  }

  const currentPhaseName = getPhaseName(moonData.phase)

  // Format percentage of illumination
  const illuminationPercent = Math.round(moonData.fraction * 100)

  // Debug: log current phase
  console.log('Current moon phase:', moonData.phase, 'illumination:', illuminationPercent + '%', 'name:', currentPhaseName)

  return (
    <div className="flex justify-center items-center">
      <div className="relative w-[500px] h-[500px]">
        {/* Rotating Moon Phase Disk */}
        <div
          className="absolute inset-0 transition-transform duration-1000 ease-linear"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* Main Moon Circle - larger than day/night clock */}
          <div
            className="relative w-full h-full rounded-full border-4 border-slate-500/50 shadow-xl overflow-hidden"
            style={{ background: moonGradient }}
          >
            {/* Quarter Phase Markers - Elegant Visual Representations */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 500">
              {/* Calculate positions for each phase marker */}
              {(() => {
                const radius = 210
                const moonSize = 40
                const center = 250

                // Helper to get position - fixed positions in the rotating disk
                const getPosition = (angle) => {
                  // angle is 0-360, where 0 is top
                  const rad = ((angle - 90) * Math.PI) / 180
                  return {
                    x: center + radius * Math.cos(rad),
                    y: center + radius * Math.sin(rad)
                  }
                }

                // Fixed positions in the disk - these will rotate with the parent
                const newPos = getPosition(newMoonAngle)      // 0° = top
                const firstPos = getPosition(firstQuarterAngle)  // 90° = right
                const fullPos = getPosition(fullMoonAngle)    // 180° = bottom
                const lastPos = getPosition(lastQuarterAngle) // 270° = left

                return (
                  <>
                    <defs>
                      {/* Clip path for first quarter - positioned at its location */}
                      <clipPath id="firstQuarterClip">
                        <rect x={firstPos.x} y={firstPos.y - moonSize} width={moonSize} height={moonSize * 2} />
                      </clipPath>
                      {/* Clip path for last quarter - positioned at its location */}
                      <clipPath id="lastQuarterClip">
                        <rect x={lastPos.x - moonSize} y={lastPos.y - moonSize} width={moonSize} height={moonSize * 2} />
                      </clipPath>
                    </defs>

                    {/* New Moon - dark circle with glow */}
                    <circle cx={newPos.x} cy={newPos.y} r={moonSize} fill="#0f172a" stroke="#64748b" strokeWidth="2" />
                    <circle cx={newPos.x} cy={newPos.y} r={moonSize - 5} fill="#1e293b" />

                    {/* First Quarter - Right half bright, left half dark */}
                    <circle cx={firstPos.x} cy={firstPos.y} r={moonSize} fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                    <circle cx={firstPos.x} cy={firstPos.y} r={moonSize} fill="#e2e8f0" clipPath="url(#firstQuarterClip)" />
                    <line x1={firstPos.x} y1={firstPos.y - moonSize} x2={firstPos.x} y2={firstPos.y + moonSize} stroke="#94a3b8" strokeWidth="2" />

                    {/* Full Moon - bright circle */}
                    <circle cx={fullPos.x} cy={fullPos.y} r={moonSize} fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
                    <circle cx={fullPos.x} cy={fullPos.y} r={moonSize - 5} fill="#e2e8f0" />
                    {/* Subtle texture */}
                    <circle cx={fullPos.x - 10} cy={fullPos.y - 8} r="3" fill="#d1d5db" opacity="0.4" />
                    <circle cx={fullPos.x + 8} cy={fullPos.y + 10} r="2.5" fill="#d1d5db" opacity="0.4" />
                    <circle cx={fullPos.x - 3} cy={fullPos.y + 12} r="2" fill="#d1d5db" opacity="0.4" />

                    {/* Last Quarter - Left half bright, right half dark */}
                    <circle cx={lastPos.x} cy={lastPos.y} r={moonSize} fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                    <circle cx={lastPos.x} cy={lastPos.y} r={moonSize} fill="#e2e8f0" clipPath="url(#lastQuarterClip)" />
                    <line x1={lastPos.x} y1={lastPos.y - moonSize} x2={lastPos.x} y2={lastPos.y + moonSize} stroke="#94a3b8" strokeWidth="2" />
                  </>
                )
              })()}
            </svg>

            {/* Center info - kept upright */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="text-center"
                style={{ transform: `rotate(${-rotation}deg)` }}
              >
                <div className="text-slate-300 text-sm font-semibold bg-slate-800/80 px-4 py-3 rounded-lg backdrop-blur">
                  <div className="text-base">{currentPhaseName}</div>
                  <div className="text-xs text-slate-400 mt-1">{illuminationPercent}% illuminated</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MoonPhaseClock
