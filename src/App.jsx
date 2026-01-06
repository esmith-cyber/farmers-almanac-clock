import { useState, useEffect } from 'react'
import SunTimes from './components/SunTimes'
import LocationInput from './components/LocationInput'
import AlmanacClock from './components/AlmanacClock'
import MoonPhaseClock from './components/MoonPhaseClock'
import AnnualEventsClock from './components/AnnualEventsClock'
import EventManager from './components/EventManager'
import './App.css'

function App() {
  const [location, setLocation] = useState(null)
  const [locationError, setLocationError] = useState(null)
  const [isEditingLocation, setIsEditingLocation] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState([])

  // Auto-detect location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            name: 'Your Location'
          })
          setLocationError(null)
        },
        (error) => {
          setLocationError('Unable to detect location. Please enter manually.')
          console.error('Geolocation error:', error)
        }
      )
    } else {
      setLocationError('Geolocation is not supported by your browser.')
    }
  }, [])

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  const handleLocationUpdate = (newLocation) => {
    setLocation(newLocation)
    setIsEditingLocation(false)
    setLocationError(null)
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-8 relative">
      {/* Location Display - Top Left */}
      <div className="fixed top-6 left-6 z-50">
        {location && !isEditingLocation ? (
          <div className="bg-slate-800/90 backdrop-blur rounded-lg px-4 py-2 flex items-center gap-3">
            <div className="text-slate-300 text-sm">
              <span className="text-xs">Location: </span>
              <span className="font-semibold text-white">
                {location.name || `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`}
              </span>
            </div>
            <button
              onClick={() => setIsEditingLocation(true)}
              className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded-md transition-colors"
            >
              Change
            </button>
          </div>
        ) : (
          <LocationInput
            onLocationUpdate={handleLocationUpdate}
            initialLocation={location}
            error={locationError}
          />
        )}
      </div>

      {/* Event Manager - Top Right */}
      {location && (
        <div className="fixed top-6 right-6 z-50">
          <EventManager
            events={events}
            onEventsChange={setEvents}
          />
        </div>
      )}

      <div className="max-w-6xl w-full">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Farmer's Almanac Clock
          </h1>
          <p className="text-slate-300 text-lg">
            Time measured by nature's rhythms
          </p>
        </header>

        {/* Main Clock Display */}
        {location ? (
          <div className="space-y-8">

            {/* Layered Clock Display */}
            <div className="relative flex items-center justify-center" style={{ minHeight: '900px' }}>
              {/* Annual Events Clock with Zodiac - Outermost */}
              <div className="absolute z-0">
                <AnnualEventsClock
                  currentDate={currentDate}
                  onEventsChange={setEvents}
                />
              </div>

              {/* Moon Phase Clock - Middle Layer */}
              <div className="absolute z-10">
                <MoonPhaseClock
                  location={location}
                  currentDate={currentDate}
                />
              </div>

              {/* Day/Night Clock - Innermost */}
              <div className="relative z-20">
                <AlmanacClock
                  location={location}
                  currentDate={currentDate}
                />
              </div>
            </div>

            <SunTimes
              location={location}
              currentDate={currentDate}
            />
          </div>
        ) : (
          <div className="text-center text-slate-400 py-12">
            {locationError ? (
              <p>{locationError}</p>
            ) : (
              <p>Detecting your location...</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
