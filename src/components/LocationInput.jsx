import { useState, useEffect, useRef } from 'react'

function LocationInput({ onLocationUpdate, initialLocation, error }) {
  const [latitude, setLatitude] = useState(initialLocation?.latitude || '')
  const [longitude, setLongitude] = useState(initialLocation?.longitude || '')
  const [locationName, setLocationName] = useState(initialLocation?.name || '')
  const [inputError, setInputError] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchTimeoutRef = useRef(null)
  const dropdownRef = useRef(null)

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Fetch suggestions as user types
  const fetchSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=10`,
        {
          headers: {
            'User-Agent': 'FarmersAlmanacClock/1.0'
          }
        }
      )
      const data = await response.json()

      // Remove duplicates based on both name and coordinates
      const seen = new Set()
      const uniqueSuggestions = data.filter(item => {
        // Create a key from the first two parts of display_name (e.g., "Paris, Île-de-France")
        const nameParts = item.display_name.split(',').slice(0, 2).join(',').trim()
        const coordKey = `${parseFloat(item.lat).toFixed(1)},${parseFloat(item.lon).toFixed(1)}`
        const key = `${nameParts}|${coordKey}`

        if (seen.has(key)) {
          return false
        }
        seen.add(key)
        return true
      }).slice(0, 5) // Take only first 5 unique results

      setSuggestions(uniqueSuggestions)
      setShowSuggestions(uniqueSuggestions.length > 0)
    } catch (error) {
      console.error('Geocoding error:', error)
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  // Debounced search effect
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Set new timeout
    searchTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(locationName)
    }, 300) // Wait 300ms after user stops typing

    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [locationName])

  // Handle selecting a suggestion
  const handleSelectSuggestion = (suggestion) => {
    const lat = parseFloat(suggestion.lat)
    const lon = parseFloat(suggestion.lon)

    // Fill in the form fields
    setLatitude(lat.toFixed(4))
    setLongitude(lon.toFixed(4))
    setLocationName(suggestion.display_name.split(',').slice(0, 2).join(','))

    // Clear any errors
    setInputError('')

    // Hide suggestions
    setSuggestions([])
    setShowSuggestions(false)
  }

  const handleAutoDetect = () => {
    if (navigator.geolocation) {
      setIsSearching(true)
      setInputError('')

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude

          // Try to reverse geocode
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

            onLocationUpdate({
              latitude: lat,
              longitude: lng,
              name: locationName
            })
          } catch (error) {
            console.error('Geocoding error:', error)
            onLocationUpdate({
              latitude: lat,
              longitude: lng,
              name: 'Your Location'
            })
          }

          setIsSearching(false)
        },
        (error) => {
          setInputError('Unable to detect location. Please try searching or entering coordinates manually.')
          console.error('Geolocation error:', error)
          setIsSearching(false)
        }
      )
    } else {
      setInputError('Geolocation is not supported by your browser.')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const lat = parseFloat(latitude)
    const lon = parseFloat(longitude)

    // Validate coordinates
    if (isNaN(lat) || isNaN(lon)) {
      setInputError('Please enter valid numbers for latitude and longitude')
      return
    }

    if (lat < -90 || lat > 90) {
      setInputError('Latitude must be between -90 and 90')
      return
    }

    if (lon < -180 || lon > 180) {
      setInputError('Longitude must be between -180 and 180')
      return
    }

    setInputError('')
    onLocationUpdate({
      latitude: lat,
      longitude: lon,
      name: locationName || `${lat.toFixed(2)}, ${lon.toFixed(2)}`
    })
  }

  return (
    <div className="ios-glass-thick max-w-md w-full" style={{
      borderRadius: '20px',
      padding: '24px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
    }}>
      <h3 className="text-white text-lg font-semibold mb-4" style={{ fontWeight: '600' }}>Set Your Location</h3>

      {error && (
        <div className="mb-4 p-3 bg-amber-900/50 border border-amber-700 rounded text-amber-200 text-sm">
          {error}
        </div>
      )}

      {inputError && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-200 text-sm">
          {inputError}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-slate-300 text-sm mb-2">
            Search by Location Name
          </label>
          <div className="relative" ref={dropdownRef}>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setShowSuggestions(true)
                }
              }}
              placeholder="Start typing: Paris, Tokyo, etc."
              className="w-full text-white focus:outline-none"
              style={{
                padding: '12px 16px',
                background: 'rgba(58, 58, 60, 0.6)',
                borderRadius: '12px',
                border: '0.5px solid rgba(255, 255, 255, 0.1)',
                fontSize: '15px',
                fontWeight: '400'
              }}
            />

            {/* Autocomplete Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-2 ios-glass-thick max-h-60 overflow-y-auto" style={{
                borderRadius: '16px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
              }}>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.place_id}
                    type="button"
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="w-full text-left text-white transition-colors"
                    style={{
                      padding: '12px 16px',
                      borderBottom: index < suggestions.length - 1 ? '0.5px solid rgba(255, 255, 255, 0.1)' : 'none',
                      background: 'transparent'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div className="font-medium">{suggestion.display_name.split(',')[0]}</div>
                    <div className="text-sm text-slate-400">{suggestion.display_name.split(',').slice(1).join(',')}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-800 text-slate-400">Or enter coordinates manually</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 text-sm mb-2">
                Latitude
              </label>
              <input
                type="text"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="45.5231"
                className="w-full text-white focus:outline-none"
                style={{
                  padding: '12px 16px',
                  background: 'rgba(58, 58, 60, 0.6)',
                  borderRadius: '12px',
                  border: '0.5px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '15px',
                  fontWeight: '400'
                }}
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm mb-2">
                Longitude
              </label>
              <input
                type="text"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="-122.6765"
                className="w-full text-white focus:outline-none"
                style={{
                  padding: '12px 16px',
                  background: 'rgba(58, 58, 60, 0.6)',
                  borderRadius: '12px',
                  border: '0.5px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '15px',
                  fontWeight: '400'
                }}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 text-white font-semibold transition-opacity hover:opacity-80"
              style={{
                padding: '14px',
                background: 'rgba(10, 132, 255, 0.8)',
                borderRadius: '14px',
                border: 'none',
                fontSize: '15px',
                fontWeight: '600'
              }}
            >
              Use This Location
            </button>
            <button
              type="button"
              onClick={handleAutoDetect}
              disabled={isSearching}
              className="flex-1 text-white font-semibold transition-opacity disabled:opacity-50"
              style={{
                padding: '14px',
                background: isSearching ? 'rgba(88, 86, 214, 0.5)' : 'rgba(88, 86, 214, 0.8)',
                borderRadius: '14px',
                border: 'none',
                fontSize: '15px',
                fontWeight: '600'
              }}
              onMouseEnter={(e) => !isSearching && (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={(e) => !isSearching && (e.currentTarget.style.opacity = '1')}
            >
              {isSearching ? 'Detecting...' : 'Auto Detect'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LocationInput
