import { useState, useEffect } from 'react'
import SunTimes from './components/SunTimes'
import LocationInput from './components/LocationInput'
import AlmanacClock from './components/AlmanacClock'
import MoonPhaseClock from './components/MoonPhaseClock'
import AnnualEventsClock from './components/AnnualEventsClock'
import EventManager from './components/EventManager'
import { getEclipsesForYear } from './utils/eclipseCalculator'
import './App.css'

function App() {
  const [location, setLocation] = useState(() => {
    // Load location from localStorage
    const saved = localStorage.getItem('userLocation')
    return saved ? JSON.parse(saved) : null
  })
  const [locationError, setLocationError] = useState(null)
  const [isEditingLocation, setIsEditingLocation] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState(() => {
    // Load events from localStorage
    const saved = localStorage.getItem('annualEvents')
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'New Year', month: 1, day: 1, color: '#60a5fa' },
      { id: 2, name: 'Valentine\'s Day', month: 2, day: 14, color: '#f472b6' },
      { id: 3, name: 'Spring Equinox', month: 3, day: 20, color: '#4ade80' },
      { id: 4, name: 'Summer Solstice', month: 6, day: 21, color: '#fbbf24' },
      { id: 5, name: 'Autumn Equinox', month: 9, day: 22, color: '#fb923c' },
      { id: 6, name: 'Winter Solstice', month: 12, day: 21, color: '#a78bfa' },
    ]
  })

  // Save events to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('annualEvents', JSON.stringify(events))
  }, [events])

  // Save location to localStorage whenever it changes
  useEffect(() => {
    if (location) {
      localStorage.setItem('userLocation', JSON.stringify(location))
    }
  }, [location])

  // Auto-detect location on mount ONLY if no saved location exists
  useEffect(() => {
    // Skip geolocation if we already have a saved location
    if (location) return

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude

          // Try to reverse geocode the coordinates to get location name
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
              {
                headers: {
                  'User-Agent': 'FarmersAlmanacClock/1.0'
                }
              }
            )
            const data = await response.json()

            // Build a readable location name
            const address = data.address || {}
            const city = address.city || address.town || address.village || address.hamlet
            const state = address.state
            const country = address.country

            let locationName = ''
            if (city && state) {
              locationName = `${city}, ${state}`
            } else if (city && country) {
              locationName = `${city}, ${country}`
            } else if (state && country) {
              locationName = `${state}, ${country}`
            } else if (city) {
              locationName = city
            } else if (country) {
              locationName = country
            } else {
              locationName = 'Your Location'
            }

            setLocation({
              latitude: lat,
              longitude: lng,
              name: locationName
            })
          } catch (error) {
            console.error('Geocoding error:', error)
            // Fallback to generic name if geocoding fails
            setLocation({
              latitude: lat,
              longitude: lng,
              name: 'Your Location'
            })
          }

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
  }, [location])

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
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative" style={{
      padding: 'min(2vw, 16px)'
    }}>
      {/* Location Display - Top Left */}
      <div className="fixed z-50" style={{
        top: 'min(1.5vw, 24px)',
        left: 'min(1.5vw, 24px)'
      }}>
        {location && !isEditingLocation ? (
          <div className="bg-slate-800/90 backdrop-blur rounded-lg flex items-center gap-3" style={{
            padding: 'min(1vw, 12px) min(1.5vw, 18px)',
            fontSize: 'min(1.5vw, 16px)'
          }}>
            <div className="text-slate-300">
              <span style={{ fontSize: 'min(1.2vw, 14px)' }}>Location: </span>
              <span className="font-semibold text-white">
                {location.name || `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`}
              </span>
            </div>
            <button
              onClick={() => setIsEditingLocation(true)}
              className="bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors"
              style={{
                fontSize: 'min(1.2vw, 14px)',
                padding: 'min(0.5vw, 6px) min(1vw, 14px)'
              }}
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
        <div className="fixed z-50" style={{
          top: 'min(1.5vw, 24px)',
          right: 'min(1.5vw, 24px)'
        }}>
          <EventManager
            events={events}
            onEventsChange={setEvents}
          />
        </div>
      )}

      <div className="max-w-6xl w-full">
        <header className="text-center" style={{
          marginTop: 'max(6vh, 50px)',
          marginBottom: 'min(1.5vh, 12px)'
        }}>
          <h1 className="font-bold text-white" style={{
            fontSize: 'min(3.5vw, 42px)'
          }}>
            Farmer's Almanac Clock
          </h1>
        </header>

        {/* Main Clock Display */}
        {location ? (
          <div className="relative flex items-center justify-center" style={{
            width: '100%',
            height: 'calc(100vh - 100px)',
            minHeight: '600px'
          }}>
            {/* Layered Clock Display - Responsive sizing */}
            <div className="relative flex items-center justify-center" style={{
              width: 'min(95vw, calc(100vh - 200px), 2400px)',
              height: 'min(95vw, calc(100vh - 200px), 2400px)',
              minWidth: '400px',
              minHeight: '400px'
            }}>
              {/* NOW indicator - positioned outside and above the annual disc */}
              <div className="absolute left-1/2 z-30" style={{
                top: '-2.5%',
                transform: 'translateX(-50%)'
              }}>
                <div className="w-0 h-0" style={{
                  borderLeft: '1.33vmin solid transparent',
                  borderRight: '1.33vmin solid transparent',
                  borderTop: '2.22vmin solid rgb(96, 165, 250)'
                }}></div>
              </div>

              {/* Annual Events Clock with Zodiac - Outermost */}
              <div className="absolute z-0 w-full h-full">
                <AnnualEventsClock
                  currentDate={currentDate}
                  events={[
                    ...events,
                    ...getEclipsesForYear(
                      currentDate.getFullYear(),
                      location.latitude,
                      location.longitude
                    )
                  ]}
                />
              </div>

              {/* Moon Phase Clock - Middle Layer */}
              <div className="absolute z-10" style={{
                width: '55.56%',
                height: '55.56%'
              }}>
                <MoonPhaseClock
                  location={location}
                  currentDate={currentDate}
                />
              </div>

              {/* Day/Night Clock - Innermost */}
              <div className="relative z-20" style={{
                width: '38.89%',
                height: '38.89%'
              }}>
                <AlmanacClock
                  location={location}
                  currentDate={currentDate}
                />
              </div>
            </div>

            {/* Sun & Moon Info Panels - Positioned in negative space */}
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
