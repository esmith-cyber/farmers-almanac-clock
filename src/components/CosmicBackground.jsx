import { useEffect, useState } from 'react'

function CosmicBackground() {
  const [shootingStars, setShootingStars] = useState([])

  useEffect(() => {
    const createShootingStar = () => {
      const id = Date.now()
      const startX = Math.random() * 100
      const startY = Math.random() * 50
      const angle = 30 + Math.random() * 30 // 30-60 degree angle

      setShootingStars(prev => [...prev, { id, startX, startY, angle }])

      // Remove after animation completes
      setTimeout(() => {
        setShootingStars(prev => prev.filter(star => star.id !== id))
      }, 2000)
    }

    // Create a shooting star every 20-40 seconds
    const interval = setInterval(() => {
      if (Math.random() > 0.5) { // 50% chance each interval
        createShootingStar()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* Nebula clouds - more visible colored mists */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {/* Purple nebula - top left */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '40vw',
          height: '40vh',
          background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'nebulaDrift 120s ease-in-out infinite',
          opacity: 0.8
        }} />

        {/* Blue nebula - top right */}
        <div style={{
          position: 'absolute',
          top: '15%',
          right: '8%',
          width: '35vw',
          height: '35vh',
          background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.12) 0%, transparent 70%)',
          filter: 'blur(70px)',
          animation: 'nebulaDrift 140s ease-in-out infinite reverse',
          opacity: 0.7
        }} />

        {/* Teal nebula - bottom left */}
        <div style={{
          position: 'absolute',
          bottom: '10%',
          left: '10%',
          width: '45vw',
          height: '45vh',
          background: 'radial-gradient(ellipse at center, rgba(20, 184, 166, 0.1) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'nebulaDrift 100s ease-in-out infinite',
          opacity: 0.6
        }} />

        {/* Pink nebula - bottom right */}
        <div style={{
          position: 'absolute',
          bottom: '15%',
          right: '5%',
          width: '38vw',
          height: '38vh',
          background: 'radial-gradient(ellipse at center, rgba(236, 72, 153, 0.12) 0%, transparent 70%)',
          filter: 'blur(65px)',
          animation: 'nebulaDrift 110s ease-in-out infinite reverse',
          opacity: 0.7
        }} />

        {/* Cosmic dust - center */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '60vw',
          height: '60vh',
          background: 'radial-gradient(ellipse at center, rgba(148, 163, 184, 0.06) 0%, transparent 60%)',
          filter: 'blur(100px)',
          animation: 'nebulaDrift 150s ease-in-out infinite',
          opacity: 0.9
        }} />
      </div>

      {/* Shooting stars */}
      {shootingStars.map(star => (
        <div
          key={star.id}
          style={{
            position: 'fixed',
            top: `${star.startY}%`,
            left: `${star.startX}%`,
            width: '2px',
            height: '2px',
            background: 'white',
            borderRadius: '50%',
            boxShadow: '0 0 4px 2px rgba(255, 255, 255, 0.8), 0 0 8px 4px rgba(255, 255, 255, 0.4)',
            zIndex: 1,
            pointerEvents: 'none',
            animation: `shootingStar 1.5s ease-out forwards`,
            transform: `rotate(${star.angle}deg)`
          }}
        >
          {/* Tail - extends backward from direction of travel */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: '2px',
            width: '100px',
            height: '1px',
            background: 'linear-gradient(to right, rgba(255, 255, 255, 0.8), transparent)',
            transformOrigin: 'left center'
          }} />
        </div>
      ))}

      <style>{`
        @keyframes shootingStar {
          0% {
            transform: translateX(0) translateY(0) rotate(45deg);
            opacity: 1;
          }
          100% {
            transform: translateX(300px) translateY(300px) rotate(45deg);
            opacity: 0;
          }
        }

        @keyframes nebulaDrift {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(20px, 30px) scale(1.1);
          }
          66% {
            transform: translate(-15px, -20px) scale(0.95);
          }
        }
      `}</style>
    </>
  )
}

export default CosmicBackground
