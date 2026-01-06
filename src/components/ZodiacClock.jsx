import { useEffect, useState } from 'react'

function ZodiacClock({ currentDate }) {
  const [rotation, setRotation] = useState(0)
  const [currentSign, setCurrentSign] = useState(null)

  // Zodiac sign data with date ranges
  const zodiacSigns = [
    { name: 'Aries', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19, angle: 0 },
    { name: 'Taurus', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20, angle: 30 },
    { name: 'Gemini', startMonth: 5, startDay: 21, endMonth: 6, endDay: 20, angle: 60 },
    { name: 'Cancer', startMonth: 6, startDay: 21, endMonth: 7, endDay: 22, angle: 90 },
    { name: 'Leo', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22, angle: 120 },
    { name: 'Virgo', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22, angle: 150 },
    { name: 'Libra', startMonth: 9, startDay: 23, endMonth: 10, endDay: 22, angle: 180 },
    { name: 'Scorpio', startMonth: 10, startDay: 23, endMonth: 11, endDay: 21, angle: 210 },
    { name: 'Sagittarius', startMonth: 11, startDay: 22, endMonth: 12, endDay: 21, angle: 240 },
    { name: 'Capricorn', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19, angle: 270 },
    { name: 'Aquarius', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18, angle: 300 },
    { name: 'Pisces', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20, angle: 330 },
  ]

  // Calculate current zodiac sign and rotation
  useEffect(() => {
    const month = currentDate.getMonth() + 1 // 1-12
    const day = currentDate.getDate()

    // Find current sign
    const sign = zodiacSigns.find(s => {
      if (s.startMonth === s.endMonth) {
        return month === s.startMonth && day >= s.startDay && day <= s.endDay
      } else if (s.startMonth < s.endMonth) {
        return (month === s.startMonth && day >= s.startDay) ||
               (month === s.endMonth && day <= s.endDay)
      } else {
        // Crosses year boundary (Capricorn)
        return (month === s.startMonth && day >= s.startDay) ||
               (month === s.endMonth && day <= s.endDay)
      }
    })

    if (sign) {
      setCurrentSign(sign)
      // Rotate so current sign is at NOW (top)
      setRotation(sign.angle)
    }
  }, [currentDate])

  if (!currentSign) return null

  // Constellation patterns - simplified star maps
  const constellations = {
    Aries: (
      <g>
        {/* Ram's horn curve */}
        <circle cx="0" cy="-8" r="1.5" fill="#e0f2fe" />
        <circle cx="2" cy="-4" r="1.5" fill="#e0f2fe" />
        <circle cx="0" cy="0" r="2" fill="#bae6fd" />
        <circle cx="-2" cy="4" r="1.5" fill="#e0f2fe" />
        <line x1="0" y1="-8" x2="2" y2="-4" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="2" y1="-4" x2="0" y2="0" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="0" y1="0" x2="-2" y2="4" stroke="#94a3b8" strokeWidth="0.5" />
      </g>
    ),
    Taurus: (
      <g>
        {/* Bull's face V-shape */}
        <circle cx="0" cy="6" r="2" fill="#bae6fd" />
        <circle cx="-5" cy="-4" r="1.5" fill="#e0f2fe" />
        <circle cx="5" cy="-4" r="1.5" fill="#e0f2fe" />
        <circle cx="-6" cy="-8" r="1" fill="#e0f2fe" />
        <circle cx="6" cy="-8" r="1" fill="#e0f2fe" />
        <line x1="-5" y1="-4" x2="0" y2="6" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="5" y1="-4" x2="0" y2="6" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="-5" y1="-4" x2="-6" y2="-8" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="5" y1="-4" x2="6" y2="-8" stroke="#94a3b8" strokeWidth="0.5" />
      </g>
    ),
    Gemini: (
      <g>
        {/* Twin pillars */}
        <circle cx="-4" cy="-8" r="1.5" fill="#e0f2fe" />
        <circle cx="-4" cy="0" r="1.5" fill="#e0f2fe" />
        <circle cx="-4" cy="8" r="1.5" fill="#e0f2fe" />
        <circle cx="4" cy="-8" r="1.5" fill="#e0f2fe" />
        <circle cx="4" cy="0" r="1.5" fill="#e0f2fe" />
        <circle cx="4" cy="8" r="1.5" fill="#e0f2fe" />
        <line x1="-4" y1="-8" x2="-4" y2="8" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="4" y1="-8" x2="4" y2="8" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="-4" y1="8" x2="4" y2="8" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="-4" y1="-8" x2="4" y2="-8" stroke="#94a3b8" strokeWidth="0.5" />
      </g>
    ),
    Cancer: (
      <g>
        {/* Crab claws */}
        <circle cx="0" cy="0" r="2" fill="#bae6fd" />
        <circle cx="-5" cy="-3" r="1.5" fill="#e0f2fe" />
        <circle cx="5" cy="-3" r="1.5" fill="#e0f2fe" />
        <circle cx="-7" cy="-6" r="1" fill="#e0f2fe" />
        <circle cx="7" cy="-6" r="1" fill="#e0f2fe" />
        <circle cx="0" cy="5" r="1.5" fill="#e0f2fe" />
        <line x1="0" y1="0" x2="-5" y2="-3" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="0" y1="0" x2="5" y2="-3" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="-5" y1="-3" x2="-7" y2="-6" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="5" y1="-3" x2="7" y2="-6" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="0" y1="0" x2="0" y2="5" stroke="#94a3b8" strokeWidth="0.5" />
      </g>
    ),
    Leo: (
      <g>
        {/* Lion's mane and body */}
        <circle cx="0" cy="-6" r="2" fill="#bae6fd" />
        <circle cx="-4" cy="-3" r="1.5" fill="#e0f2fe" />
        <circle cx="4" cy="-3" r="1.5" fill="#e0f2fe" />
        <circle cx="0" cy="2" r="1.5" fill="#e0f2fe" />
        <circle cx="-3" cy="6" r="1.5" fill="#e0f2fe" />
        <circle cx="3" cy="6" r="1.5" fill="#e0f2fe" />
        <line x1="0" y1="-6" x2="-4" y2="-3" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="0" y1="-6" x2="4" y2="-3" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="0" y1="-6" x2="0" y2="2" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="0" y1="2" x2="-3" y2="6" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="0" y1="2" x2="3" y2="6" stroke="#94a3b8" strokeWidth="0.5" />
      </g>
    ),
    Virgo: (
      <g>
        {/* Maiden figure */}
        <circle cx="-6" cy="-6" r="1.5" fill="#e0f2fe" />
        <circle cx="-3" cy="-2" r="1.5" fill="#e0f2fe" />
        <circle cx="0" cy="2" r="1.5" fill="#e0f2fe" />
        <circle cx="3" cy="6" r="1.5" fill="#e0f2fe" />
        <circle cx="6" cy="4" r="1" fill="#e0f2fe" />
        <line x1="-6" y1="-6" x2="-3" y2="-2" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="-3" y1="-2" x2="0" y2="2" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="0" y1="2" x2="3" y2="6" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="3" y1="6" x2="6" y2="4" stroke="#94a3b8" strokeWidth="0.5" />
      </g>
    ),
    Libra: (
      <g>
        {/* Scales balance */}
        <circle cx="-5" cy="3" r="1.5" fill="#e0f2fe" />
        <circle cx="5" cy="3" r="1.5" fill="#e0f2fe" />
        <circle cx="0" cy="-5" r="1.5" fill="#bae6fd" />
        <circle cx="-6" cy="6" r="1" fill="#e0f2fe" />
        <circle cx="6" cy="6" r="1" fill="#e0f2fe" />
        <line x1="-5" y1="3" x2="5" y2="3" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="0" y1="-5" x2="0" y2="3" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="-5" y1="3" x2="-6" y2="6" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="5" y1="3" x2="6" y2="6" stroke="#94a3b8" strokeWidth="0.5" />
      </g>
    ),
    Scorpio: (
      <g>
        {/* Scorpion with curved tail */}
        <circle cx="-6" cy="-4" r="1.5" fill="#e0f2fe" />
        <circle cx="-3" cy="0" r="1.5" fill="#e0f2fe" />
        <circle cx="0" cy="3" r="1.5" fill="#bae6fd" />
        <circle cx="3" cy="5" r="1.5" fill="#e0f2fe" />
        <circle cx="6" cy="3" r="1.5" fill="#e0f2fe" />
        <line x1="-6" y1="-4" x2="-3" y2="0" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="-3" y1="0" x2="0" y2="3" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="0" y1="3" x2="3" y2="5" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="3" y1="5" x2="6" y2="3" stroke="#94a3b8" strokeWidth="0.5" />
      </g>
    ),
    Sagittarius: (
      <g>
        {/* Archer's arrow */}
        <circle cx="-6" cy="6" r="1.5" fill="#e0f2fe" />
        <circle cx="-2" cy="2" r="1.5" fill="#e0f2fe" />
        <circle cx="2" cy="-2" r="1.5" fill="#bae6fd" />
        <circle cx="6" cy="-6" r="1.5" fill="#e0f2fe" />
        <circle cx="4" cy="-8" r="1" fill="#e0f2fe" />
        <circle cx="8" cy="-4" r="1" fill="#e0f2fe" />
        <line x1="-6" y1="6" x2="6" y2="-6" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="6" y1="-6" x2="4" y2="-8" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="6" y1="-6" x2="8" y2="-4" stroke="#94a3b8" strokeWidth="0.5" />
      </g>
    ),
    Capricorn: (
      <g>
        {/* Goat with fish tail */}
        <circle cx="-5" cy="-5" r="1.5" fill="#e0f2fe" />
        <circle cx="0" cy="-3" r="1.5" fill="#bae6fd" />
        <circle cx="3" cy="0" r="1.5" fill="#e0f2fe" />
        <circle cx="5" cy="4" r="1.5" fill="#e0f2fe" />
        <circle cx="2" cy="7" r="1" fill="#e0f2fe" />
        <line x1="-5" y1="-5" x2="0" y2="-3" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="0" y1="-3" x2="3" y2="0" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="3" y1="0" x2="5" y2="4" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="5" y1="4" x2="2" y2="7" stroke="#94a3b8" strokeWidth="0.5" />
      </g>
    ),
    Aquarius: (
      <g>
        {/* Water bearer waves */}
        <circle cx="-6" cy="-3" r="1.5" fill="#e0f2fe" />
        <circle cx="-3" cy="0" r="1.5" fill="#e0f2fe" />
        <circle cx="0" cy="-3" r="1.5" fill="#e0f2fe" />
        <circle cx="3" cy="0" r="1.5" fill="#e0f2fe" />
        <circle cx="6" cy="-3" r="1.5" fill="#e0f2fe" />
        <circle cx="-3" cy="5" r="1.5" fill="#e0f2fe" />
        <circle cx="3" cy="5" r="1.5" fill="#e0f2fe" />
        <line x1="-6" y1="-3" x2="-3" y2="0" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="-3" y1="0" x2="0" y2="-3" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="0" y1="-3" x2="3" y2="0" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="3" y1="0" x2="6" y2="-3" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="-3" y1="5" x2="3" y2="5" stroke="#94a3b8" strokeWidth="0.5" />
      </g>
    ),
    Pisces: (
      <g>
        {/* Two fish connected */}
        <circle cx="-5" cy="-5" r="1.5" fill="#e0f2fe" />
        <circle cx="-3" cy="-2" r="1" fill="#e0f2fe" />
        <circle cx="0" cy="0" r="1.5" fill="#bae6fd" />
        <circle cx="3" cy="2" r="1" fill="#e0f2fe" />
        <circle cx="5" cy="5" r="1.5" fill="#e0f2fe" />
        <circle cx="-6" cy="-7" r="1" fill="#e0f2fe" />
        <circle cx="6" cy="7" r="1" fill="#e0f2fe" />
        <line x1="-5" y1="-5" x2="0" y2="0" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="0" y1="0" x2="5" y2="5" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="-5" y1="-5" x2="-6" y2="-7" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="5" y1="5" x2="6" y2="7" stroke="#94a3b8" strokeWidth="0.5" />
      </g>
    ),
  }

  return (
    <div className="flex justify-center items-center">
      <div className="relative w-[680px] h-[680px]">
        {/* Rotating Zodiac Disk */}
        <div
          className="absolute inset-0 transition-transform duration-1000 ease-linear"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* Main Zodiac Circle - deep space background */}
          <div className="relative w-full h-full rounded-full border-4 border-slate-700/30 shadow-2xl overflow-hidden bg-[#030712]">
            {/* Subtle star field background */}
            <div className="absolute inset-0 opacity-30">
              {Array.from({ length: 50 }, (_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-white"
                  style={{
                    width: Math.random() * 2 + 0.5 + 'px',
                    height: Math.random() * 2 + 0.5 + 'px',
                    left: Math.random() * 100 + '%',
                    top: Math.random() * 100 + '%',
                    opacity: Math.random() * 0.7 + 0.3,
                  }}
                />
              ))}
            </div>

            {/* Zodiac Signs */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 680 680">
              {zodiacSigns.map((sign) => {
                const radius = 305 // Position in the ring
                const angle = sign.angle - rotation
                const rad = ((angle - 90) * Math.PI) / 180
                const x = 340 + radius * Math.cos(rad)
                const y = 340 + radius * Math.sin(rad)

                return (
                  <g key={sign.name} transform={`translate(${x}, ${y})`}>
                    {/* Constellation pattern */}
                    <g transform={`rotate(${-angle})`}>
                      {constellations[sign.name]}
                    </g>

                    {/* Sign name */}
                    <text
                      x="0"
                      y="20"
                      textAnchor="middle"
                      fill="#cbd5e1"
                      fontSize="11"
                      fontWeight="500"
                      transform={`rotate(${-angle})`}
                    >
                      {sign.name}
                    </text>
                  </g>
                )
              })}
            </svg>

            {/* Center display - current sign */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="text-center"
                style={{ transform: `rotate(${-rotation}deg)` }}
              >
                <div className="text-slate-300 text-sm font-semibold bg-slate-900/80 px-4 py-3 rounded-lg backdrop-blur border border-slate-700/50">
                  <div className="text-base">{currentSign.name}</div>
                  <div className="text-xs text-slate-400 mt-1">Current Sign</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ZodiacClock
