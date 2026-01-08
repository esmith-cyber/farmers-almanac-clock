import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import SunCalc from 'suncalc'

function MoonPhaseClock({ location, currentDate }) {
  const [moonData, setMoonData] = useState(null)
  const [rotation, setRotation] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [selectedPhaseMarker, setSelectedPhaseMarker] = useState(null)
  const [displayPhaseName, setDisplayPhaseName] = useState(null) // Phase name to display in modal

  // Handle click on the ring area - determine which phase segment was clicked
  const handleRingClick = (e, clickAngle) => {
    // clickAngle is 0-360, representing position on the disc (clockwise from top)
    // Since we go counter-clockwise for forward time, convert accordingly
    // 0° = phase 0, 270° (left) = phase 0.25, 180° (bottom) = phase 0.5, 90° (right) = phase 0.75
    const clickPhase = ((360 - clickAngle) % 360) / 360

    // Determine phase name from the clicked position
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

    const phaseName = getPhaseName(clickPhase)

    // Set the phase name to display
    setDisplayPhaseName(phaseName)

    // Check if this is one of the principal phases that has detailed marker info
    const principalPhases = ['New Moon', 'First Quarter', 'Full Moon', 'Last Quarter']
    if (principalPhases.includes(phaseName)) {
      setSelectedPhaseMarker(phaseName)
    } else {
      setSelectedPhaseMarker(null)
    }

    setShowModal(true)
  }

  // Handle click on a specific phase marker
  const handlePhaseMarkerClick = (e, phaseName) => {
    e.stopPropagation() // Prevent triggering ring click
    setSelectedPhaseMarker(phaseName)
    setDisplayPhaseName(phaseName)
    setShowModal(true)
  }

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

    // Rotate CLOCKWISE to align current phase near top
    // Positive rotation = clockwise, so past phases move to the right
    // Future phases appear to the left (counter-clockwise from NOW)
    setRotation(currentAngle)
  }, [moonData, currentDate])

  if (!moonData) return null

  // Quarter phase positions in the lunar cycle (0-360 degrees)
  // These are FIXED positions in the lunar cycle
  // Going COUNTER-CLOCKWISE represents moving forward in time
  const newMoonAngle = 0      // Phase 0
  const firstQuarterAngle = 270   // Phase 0.25 (90° counter-clockwise from new)
  const fullMoonAngle = 180      // Phase 0.5 (180° from new)
  const lastQuarterAngle = 90   // Phase 0.75 (90° clockwise from new = 270° counter-clockwise)

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
      // Fill the gap between 315° and 360° with intermediate stops
      { angle: 326.25, color: '#1a2534' },
      { angle: 337.5, color: '#17212f' },
      { angle: 348.75, color: '#131c2a' },
      { angle: 360, color: '#0f172a' },    // Back to new moon
    ]

    const stopStrings = stops.map(stop => `${stop.color} ${stop.angle}deg`)
    return `conic-gradient(${stopStrings.join(', ')})`
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

  // Get detailed information for specific phase markers
  const getPhaseMarkerInfo = (phaseName) => {
    const info = {
      'New Moon': {
        emoji: '🌑',
        illumination: '0%',
        description: 'The New Moon marks the beginning of the lunar cycle. During this phase, the Moon is positioned between Earth and the Sun, with its illuminated side facing away from us. The Moon rises and sets with the Sun, making it invisible in the night sky. This is an ideal time for stargazing, as moonlight won\'t interfere with viewing faint celestial objects.',
        timing: 'Occurs approximately every 29.5 days when the Moon completes a full orbit around Earth.',
        cultural: 'Many cultures consider the New Moon a time for new beginnings, setting intentions, and starting fresh projects.',
        astronomical: 'Solar eclipses can only occur during a New Moon when the Moon passes directly between Earth and the Sun.',
        visibility: 'Not visible - rises and sets with the Sun'
      },
      'First Quarter': {
        emoji: '🌓',
        illumination: '50%',
        description: 'The First Quarter Moon occurs when the Moon is one-quarter of the way through its orbit around Earth. Half of the Moon\'s face is illuminated - specifically the right half as seen from the Northern Hemisphere. The name "quarter" refers to the Moon\'s position in its cycle, not its appearance. The Moon rises around noon and sets around midnight.',
        timing: 'Occurs about 7.4 days after the New Moon, marking the first principal phase of the lunar cycle.',
        cultural: 'Traditionally seen as a time for taking action on goals set during the New Moon, and overcoming challenges.',
        astronomical: 'The Sun-Earth-Moon angle is 90 degrees. The terminator (day/night line) is most visible, revealing the Moon\'s topography through shadows.',
        visibility: 'Visible from noon to midnight, best viewed in the afternoon and evening'
      },
      'Full Moon': {
        emoji: '🌕',
        illumination: '100%',
        description: 'The Full Moon occurs when the Moon is on the opposite side of Earth from the Sun, with its entire face fully illuminated. This is the brightest phase of the lunar cycle. The Full Moon rises around sunset and sets around sunrise, remaining visible throughout the night. Its bright light has captivated humans throughout history and significantly affects nighttime visibility.',
        timing: 'Occurs approximately 14.75 days after the New Moon, at the midpoint of the lunar cycle.',
        cultural: 'Full Moons have been celebrated across cultures and given names based on seasonal characteristics (Harvest Moon, Hunter\'s Moon, etc.).',
        astronomical: 'Lunar eclipses can only occur during a Full Moon when Earth passes directly between the Sun and Moon, casting its shadow on the lunar surface.',
        visibility: 'Visible all night - rises at sunset, highest at midnight, sets at sunrise'
      },
      'Last Quarter': {
        emoji: '🌗',
        illumination: '50%',
        description: 'The Last Quarter Moon (also called Third Quarter) occurs when the Moon is three-quarters through its orbit around Earth. Half of the Moon\'s face is illuminated - specifically the left half as seen from the Northern Hemisphere. This phase is a mirror image of the First Quarter. The Moon rises around midnight and sets around noon, making it visible in the early morning sky.',
        timing: 'Occurs about 22 days after the New Moon, marking the final principal phase before returning to New Moon.',
        cultural: 'Traditionally associated with reflection, letting go, and preparing for new cycles. A time for releasing what no longer serves.',
        astronomical: 'Like First Quarter, the Sun-Earth-Moon angle is 90 degrees, but from the opposite direction. The terminator reveals different lunar terrain than First Quarter.',
        visibility: 'Visible from midnight to noon, best viewed in the early morning hours'
      }
    }
    return info[phaseName] || null
  }

  // Debug: log current phase
  console.log('Current moon phase:', moonData.phase, 'illumination:', illuminationPercent + '%', 'name:', currentPhaseName)

  return (
    <div className="flex justify-center items-center w-full h-full">
      <div className="relative w-full h-full">
        {/* Rotating Moon Phase Disk */}
        <div
          className="absolute inset-0 transition-transform duration-1000 ease-linear"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* Main Moon Circle - larger than day/night clock */}
          <div
            className="relative w-full h-full rounded-full clock-glow overflow-hidden"
            style={{
              background: moonGradient,
              opacity: 0.4
            }}
          >
            {/* Quarter Phase Markers - Elegant Visual Representations */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 500">
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

                    {/* Clickable ring area - only the outer ring, not the center */}
                    {/* This leaves the center (day/night clock) available for future click handlers */}
                    <path
                      d="M 250,0 A 250,250 0 1,0 250,500 A 250,250 0 1,0 250,0 Z M 250,75 A 175,175 0 1,1 250,425 A 175,175 0 1,1 250,75 Z"
                      fill="transparent"
                      style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                      onClick={(e) => {
                        e.stopPropagation()

                        // Get SVG coordinates
                        const svg = e.currentTarget.closest('svg')
                        const rect = svg.getBoundingClientRect()
                        const svgX = ((e.clientX - rect.left) / rect.width) * 500
                        const svgY = ((e.clientY - rect.top) / rect.height) * 500

                        // Calculate angle relative to center (250, 250)
                        const dx = svgX - 250
                        const dy = svgY - 250
                        let angle = Math.atan2(dy, dx) * (180 / Math.PI)

                        // Convert to 0-360 range starting from top (0° = top, going clockwise)
                        angle = (angle + 90 + 360) % 360

                        // Subtract the disc rotation to get the actual phase position
                        // Since disc rotates clockwise, we subtract the rotation
                        const phaseAngle = (angle - rotation + 360) % 360

                        handleRingClick(e, phaseAngle)
                      }}
                    />

                    {/* New Moon - dark circle with subtle glow and dark texture */}
                    <g
                      style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                      onClick={(e) => handlePhaseMarkerClick(e, 'New Moon')}
                    >
                      <circle cx={newPos.x} cy={newPos.y} r={moonSize + 8} fill="transparent" />
                      <circle cx={newPos.x} cy={newPos.y} r={moonSize} fill="#0f172a" stroke="#4a5568" strokeWidth="1.5" />
                      <circle cx={newPos.x} cy={newPos.y} r={moonSize - 4} fill="#1e293b" />
                      {/* Dark side craters */}
                      <circle cx={newPos.x - 8} cy={newPos.y - 6} r="2.5" fill="#0f172a" opacity="0.5" />
                      <circle cx={newPos.x + 6} cy={newPos.y + 8} r="2" fill="#0f172a" opacity="0.5" />
                      <circle cx={newPos.x - 2} cy={newPos.y + 10} r="1.5" fill="#0f172a" opacity="0.5" />
                      <circle cx={newPos.x + 10} cy={newPos.y - 4} r="1.8" fill="#0f172a" opacity="0.5" />
                    </g>

                    {/* First Quarter - Right half bright with smooth terminator */}
                    <g
                      style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                      onClick={(e) => handlePhaseMarkerClick(e, 'First Quarter')}
                    >
                      <circle cx={firstPos.x} cy={firstPos.y} r={moonSize + 8} fill="transparent" />
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
                    </g>

                    {/* Full Moon - bright circle with detailed texture */}
                    <g
                      style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                      onClick={(e) => handlePhaseMarkerClick(e, 'Full Moon')}
                    >
                      <circle cx={fullPos.x} cy={fullPos.y} r={moonSize + 8} fill="transparent" />
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
                    </g>

                    {/* Last Quarter - Left half bright with smooth terminator */}
                    <g
                      style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                      onClick={(e) => handlePhaseMarkerClick(e, 'Last Quarter')}
                    >
                      <circle cx={lastPos.x} cy={lastPos.y} r={moonSize + 8} fill="transparent" />
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
                    </g>
                  </>
                )
              })()}

              {/* Non-interactive decorative elements - don't catch pointer events */}
              <g style={{ pointerEvents: 'none' }}>
                {/* Any future decorative elements would go here */}
              </g>
            </svg>

            {/* Center info - kept upright */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="text-center"
                style={{ transform: `rotate(${-rotation}deg)` }}
              >
                <div className="text-slate-300 font-semibold ios-glass" style={{
                  fontSize: 'min(2.8vmin, 14px)',
                  padding: 'min(2.4vmin, 12px) min(3.2vmin, 16px)',
                  borderRadius: 'min(2.4vmin, 12px)'
                }}>
                  <div style={{ fontSize: 'min(3.2vmin, 16px)' }}>{currentPhaseName}</div>
                  <div className="text-slate-400" style={{ fontSize: 'min(2.4vmin, 12px)', marginTop: 'min(0.8vmin, 4px)' }}>{illuminationPercent}% illuminated</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Moon Phase Info Modal */}
      {showModal && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(10px)',
            zIndex: 9999
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="ios-glass-thick max-w-md w-full"
            style={{
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {selectedPhaseMarker ? (
              // Show specific phase marker information
              (() => {
                const markerInfo = getPhaseMarkerInfo(selectedPhaseMarker)
                return (
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-1">
                          {selectedPhaseMarker}
                        </h2>
                        <p className="text-slate-400 text-sm">Principal Lunar Phase</p>
                      </div>
                      <button
                        onClick={() => setShowModal(false)}
                        className="text-slate-400 hover:text-white text-2xl leading-none"
                      >
                        ×
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Phase Info Header */}
                      <div className="p-4 rounded-xl" style={{ background: 'rgba(100, 116, 139, 0.1)', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-slate-400 text-xs mb-1">Illumination</div>
                            <div className="text-white font-bold text-3xl">{markerInfo.illumination}</div>
                          </div>
                          <div className="text-6xl">{markerInfo.emoji}</div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="p-4 rounded-xl" style={{ background: 'rgba(30, 30, 40, 0.3)' }}>
                        <h3 className="text-white font-semibold mb-2">Description</h3>
                        <p className="text-slate-300 text-sm leading-relaxed">
                          {markerInfo.description}
                        </p>
                      </div>

                      {/* Timing */}
                      <div className="p-4 rounded-xl" style={{ background: 'rgba(30, 30, 40, 0.3)' }}>
                        <h3 className="text-white font-semibold mb-2">Timing</h3>
                        <p className="text-slate-300 text-sm leading-relaxed">
                          {markerInfo.timing}
                        </p>
                      </div>

                      {/* Visibility */}
                      <div className="p-4 rounded-xl" style={{ background: 'rgba(30, 30, 40, 0.3)' }}>
                        <h3 className="text-white font-semibold mb-2">Visibility</h3>
                        <p className="text-slate-300 text-sm leading-relaxed">
                          {markerInfo.visibility}
                        </p>
                      </div>

                      {/* Astronomical */}
                      <div className="p-4 rounded-xl" style={{ background: 'rgba(30, 30, 40, 0.3)' }}>
                        <h3 className="text-white font-semibold mb-2">Astronomical Facts</h3>
                        <p className="text-slate-300 text-sm leading-relaxed">
                          {markerInfo.astronomical}
                        </p>
                      </div>

                      {/* Cultural */}
                      <div className="p-4 rounded-xl" style={{ background: 'rgba(30, 30, 40, 0.3)' }}>
                        <h3 className="text-white font-semibold mb-2">Cultural Significance</h3>
                        <p className="text-slate-300 text-sm leading-relaxed">
                          {markerInfo.cultural}
                        </p>
                      </div>
                    </div>
                  </>
                )
              })()
            ) : (
              // Show current phase information
              <>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {displayPhaseName || currentPhaseName}
                    </h2>
                    <p className="text-slate-400 text-sm">
                      {displayPhaseName && displayPhaseName !== currentPhaseName ? 'Lunar Phase' : 'Current Lunar Phase'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-slate-400 hover:text-white text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
              {/* Phase Info */}
              <div className="p-4 rounded-xl" style={{ background: 'rgba(100, 116, 139, 0.1)', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-slate-400 text-xs mb-1">
                      {displayPhaseName && displayPhaseName === currentPhaseName ? 'Current Illumination' : 'Typical Illumination'}
                    </div>
                    <div className="text-white font-bold text-3xl">
                      {displayPhaseName && displayPhaseName === currentPhaseName ? `${illuminationPercent}%` : '~' + Math.round((() => {
                        const pn = displayPhaseName || currentPhaseName
                        if (pn === 'New Moon') return 0
                        if (pn === 'Waxing Crescent') return 25
                        if (pn === 'First Quarter') return 50
                        if (pn === 'Waxing Gibbous') return 75
                        if (pn === 'Full Moon') return 100
                        if (pn === 'Waning Gibbous') return 75
                        if (pn === 'Last Quarter') return 50
                        if (pn === 'Waning Crescent') return 25
                        return moonData.fraction * 100
                      })()) + '%'}
                    </div>
                  </div>
                  <div className="text-6xl">
                    {(() => {
                      const pn = displayPhaseName || currentPhaseName
                      if (pn === 'New Moon') return '🌑'
                      if (pn === 'Waxing Crescent') return '🌒'
                      if (pn === 'First Quarter') return '🌓'
                      if (pn === 'Waxing Gibbous') return '🌔'
                      if (pn === 'Full Moon') return '🌕'
                      if (pn === 'Waning Gibbous') return '🌖'
                      if (pn === 'Last Quarter') return '🌗'
                      if (pn === 'Waning Crescent') return '🌘'
                      return '🌑'
                    })()}
                  </div>
                </div>

                {displayPhaseName && displayPhaseName === currentPhaseName && (
                  <>
                    {/* Cycle Progress Bar - only show for current phase */}
                    <div>
                      <div className="text-slate-400 text-xs mb-2">Lunar Cycle Progress</div>
                      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-400 transition-all duration-300"
                          style={{ width: `${moonData.phase * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-slate-400 text-xs mt-1">
                        <span>New Moon</span>
                        <span>{Math.round(moonData.phase * 100)}%</span>
                        <span>New Moon</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Phase Description */}
              <div className="p-4 rounded-xl" style={{ background: 'rgba(30, 30, 40, 0.3)' }}>
                <h3 className="text-white font-semibold mb-2">About This Phase</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {(() => {
                    const phase = displayPhaseName || currentPhaseName
                    if (phase === 'New Moon') return 'The Moon is positioned between Earth and the Sun, with its illuminated side facing away from us. This is the start of the lunar cycle, lasting about 29.5 days.'
                    if (phase === 'Waxing Crescent') return 'A thin crescent of light appears on the right side as the Moon moves away from the Sun in the sky. "Waxing" means growing larger each night.'
                    if (phase === 'First Quarter') return 'Half of the Moon\'s face is illuminated. Despite the name "quarter," this refers to the Moon being one-quarter through its cycle, not its appearance.'
                    if (phase === 'Waxing Gibbous') return 'More than half of the Moon is illuminated, continuing to grow. "Gibbous" means humped or bulging. The Moon is approaching fullness.'
                    if (phase === 'Full Moon') return 'The entire face of the Moon is illuminated as it sits opposite the Sun in Earth\'s sky. This is often when the Moon rises around sunset and sets around sunrise.'
                    if (phase === 'Waning Gibbous') return 'The Moon begins to decrease in illumination after the Full Moon. "Waning" means shrinking. Still more than half illuminated, but getting smaller each night.'
                    if (phase === 'Last Quarter') return 'Half of the Moon is illuminated, but on the opposite side from the First Quarter. The Moon is three-quarters through its cycle.'
                    if (phase === 'Waning Crescent') return 'A thin crescent appears on the left side as the Moon approaches the New Moon phase again. Soon the cycle will begin anew.'
                  })()}
                </p>
              </div>

              {/* Fun Facts */}
              <div className="p-4 rounded-xl" style={{ background: 'rgba(30, 30, 40, 0.3)' }}>
                <h3 className="text-white font-semibold mb-2">Lunar Facts</h3>
                <div className="space-y-2 text-slate-300 text-sm">
                  <div className="flex gap-2">
                    <span className="text-slate-500">•</span>
                    <span>The lunar cycle (synodic month) averages 29.53 days</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-slate-500">•</span>
                    <span>The Moon rotates at the same rate it orbits Earth, so we always see the same face</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-slate-500">•</span>
                    <span>The Moon's gravitational pull creates Earth's ocean tides</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-slate-500">•</span>
                    <span>A full lunar cycle affects wildlife behavior, plant growth, and has been studied for centuries</span>
                  </div>
                </div>
              </div>

              {/* Phase Timing Info - only show for current phase */}
              {(!displayPhaseName || displayPhaseName === currentPhaseName) && (
                <div className="p-3 rounded-xl" style={{ background: 'rgba(30, 30, 40, 0.3)' }}>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Days through cycle</span>
                    <span className="text-white font-semibold">
                      ~{Math.round(moonData.phase * 29.53)} of 29.53
                    </span>
                  </div>
                </div>
              )}
            </div>
            </>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default MoonPhaseClock
