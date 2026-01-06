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
            className="relative w-full h-full rounded-full border-2 border-slate-500/30 shadow-xl overflow-hidden"
            style={{ background: moonGradient }}
          >
            {/* Quarter Phase Markers - Elegant Visual Representations */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 500">
              {/* Background stars in lunar track - fade with moon phase */}
              {(() => {
                const stars = []
                const center = 250
                const innerRadius = 175  // Inner edge of lunar ring
                const outerRadius = 250  // Outer edge of lunar ring
                const starCount = 80

                for (let i = 0; i < starCount; i++) {
                  const angle = (i / starCount) * 360
                  const radius = innerRadius + Math.random() * (outerRadius - innerRadius)
                  const rad = ((angle - 90) * Math.PI) / 180
                  const x = center + radius * Math.cos(rad)
                  const y = center + radius * Math.sin(rad)

                  // Calculate opacity based on angle - brightest at 0° (new moon), dimmest at 180° (full moon)
                  // Use cosine for smooth fade
                  const normalizedAngle = angle * Math.PI / 180
                  const phaseOpacity = (Math.cos(normalizedAngle) + 1) / 2  // 0-1, highest at 0°/360°, lowest at 180°
                  const starOpacity = phaseOpacity * 0.6 + 0.1  // Range from 0.1 to 0.7

                  stars.push(
                    <circle
                      key={`star-${i}`}
                      cx={x}
                      cy={y}
                      r={Math.random() * 1.2 + 0.5}
                      fill="#e0f2fe"
                      opacity={starOpacity}
                    />
                  )
                }
                return stars
              })()}

              {/* Calculate positions for each phase marker */}
              {(() => {
                const radius = 212.5  // Centered in the 75px ring (175 inner + 37.5)
                const moonSize = 32   // Smaller to fit comfortably in ring
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
                      {/* Clip path for first quarter - right half */}
                      <clipPath id="firstQuarterClip">
                        <rect x={firstPos.x} y={firstPos.y - moonSize} width={moonSize} height={moonSize * 2} />
                      </clipPath>
                      {/* Clip path for last quarter - left half */}
                      <clipPath id="lastQuarterClip">
                        <rect x={lastPos.x - moonSize} y={lastPos.y - moonSize} width={moonSize} height={moonSize * 2} />
                      </clipPath>
                    </defs>

                    {/* New Moon - dark circle with subtle glow and dark texture */}
                    <circle cx={newPos.x} cy={newPos.y} r={moonSize} fill="#0f172a" stroke="#4a5568" strokeWidth="1.5" />
                    <circle cx={newPos.x} cy={newPos.y} r={moonSize - 4} fill="#1e293b" />
                    {/* Dark side craters */}
                    <circle cx={newPos.x - 8} cy={newPos.y - 6} r="2.5" fill="#0f172a" opacity="0.5" />
                    <circle cx={newPos.x + 6} cy={newPos.y + 8} r="2" fill="#0f172a" opacity="0.5" />
                    <circle cx={newPos.x - 2} cy={newPos.y + 10} r="1.5" fill="#0f172a" opacity="0.5" />
                    <circle cx={newPos.x + 10} cy={newPos.y - 4} r="1.8" fill="#0f172a" opacity="0.5" />

                    {/* First Quarter - Right half bright with smooth terminator */}
                    <circle cx={firstPos.x} cy={firstPos.y} r={moonSize} fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
                    {/* Right half bright */}
                    <circle cx={firstPos.x} cy={firstPos.y} r={moonSize} fill="#e2e8f0" clipPath="url(#firstQuarterClip)" />
                    {/* Light side craters (on right) */}
                    <circle cx={firstPos.x + 8} cy={firstPos.y - 8} r="2.5" fill="#cbd5e1" opacity="0.6" clipPath="url(#firstQuarterClip)" />
                    <circle cx={firstPos.x + 6} cy={firstPos.y + 10} r="2" fill="#cbd5e1" opacity="0.6" clipPath="url(#firstQuarterClip)" />
                    <circle cx={firstPos.x + 12} cy={firstPos.y + 3} r="1.5" fill="#cbd5e1" opacity="0.6" clipPath="url(#firstQuarterClip)" />
                    {/* Dark side craters (on left) */}
                    <circle cx={firstPos.x - 10} cy={firstPos.y - 6} r="2" fill="#0f172a" opacity="0.5" />
                    <circle cx={firstPos.x - 8} cy={firstPos.y + 8} r="1.5" fill="#0f172a" opacity="0.5" />
                    {/* Soft terminator blend - gradient overlay */}
                    <ellipse cx={firstPos.x} cy={firstPos.y} rx="2" ry={moonSize} fill="#94a3b8" opacity="0.3" />

                    {/* Full Moon - bright circle with detailed texture */}
                    <circle cx={fullPos.x} cy={fullPos.y} r={moonSize} fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />
                    <circle cx={fullPos.x} cy={fullPos.y} r={moonSize - 3} fill="#e2e8f0" />
                    {/* Maria (dark patches) */}
                    <ellipse cx={fullPos.x - 8} cy={fullPos.y - 6} rx="5" ry="4" fill="#cbd5e1" opacity="0.5" />
                    <ellipse cx={fullPos.x + 6} cy={fullPos.y + 8} rx="4" ry="3.5" fill="#cbd5e1" opacity="0.5" />
                    <ellipse cx={fullPos.x - 2} cy={fullPos.y + 12} rx="3" ry="2.5" fill="#cbd5e1" opacity="0.5" />
                    {/* Craters */}
                    <circle cx={fullPos.x - 10} cy={fullPos.y - 10} r="2.5" fill="#cbd5e1" opacity="0.7" />
                    <circle cx={fullPos.x + 10} cy={fullPos.y - 6} r="2" fill="#cbd5e1" opacity="0.7" />
                    <circle cx={fullPos.x + 8} cy={fullPos.y + 12} r="1.8" fill="#cbd5e1" opacity="0.7" />
                    <circle cx={fullPos.x - 6} cy={fullPos.y + 6} r="1.5" fill="#cbd5e1" opacity="0.7" />
                    <circle cx={fullPos.x + 2} cy={fullPos.y - 8} r="1.3" fill="#cbd5e1" opacity="0.7" />

                    {/* Last Quarter - Left half bright with smooth terminator */}
                    <circle cx={lastPos.x} cy={lastPos.y} r={moonSize} fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
                    {/* Left half bright */}
                    <circle cx={lastPos.x} cy={lastPos.y} r={moonSize} fill="#e2e8f0" clipPath="url(#lastQuarterClip)" />
                    {/* Light side craters (on left) */}
                    <circle cx={lastPos.x - 8} cy={lastPos.y - 8} r="2.5" fill="#cbd5e1" opacity="0.6" clipPath="url(#lastQuarterClip)" />
                    <circle cx={lastPos.x - 6} cy={lastPos.y + 10} r="2" fill="#cbd5e1" opacity="0.6" clipPath="url(#lastQuarterClip)" />
                    <circle cx={lastPos.x - 12} cy={lastPos.y + 3} r="1.5" fill="#cbd5e1" opacity="0.6" clipPath="url(#lastQuarterClip)" />
                    {/* Dark side craters (on right) */}
                    <circle cx={lastPos.x + 10} cy={lastPos.y - 6} r="2" fill="#0f172a" opacity="0.5" />
                    <circle cx={lastPos.x + 8} cy={lastPos.y + 8} r="1.5" fill="#0f172a" opacity="0.5" />
                    {/* Soft terminator blend - gradient overlay */}
                    <ellipse cx={lastPos.x} cy={lastPos.y} rx="2" ry={moonSize} fill="#94a3b8" opacity="0.3" />
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
