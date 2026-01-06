import { useState } from 'react'

function LocationInput({ onLocationUpdate, initialLocation, error }) {
  const [latitude, setLatitude] = useState(initialLocation?.latitude || '')
  const [longitude, setLongitude] = useState(initialLocation?.longitude || '')
  const [locationName, setLocationName] = useState(initialLocation?.name || '')
  const [inputError, setInputError] = useState('')

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
    <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full">
      <h3 className="text-white text-lg font-semibold mb-4">Set Your Location</h3>

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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-slate-300 text-sm mb-2">
            Location Name (optional)
          </label>
          <input
            type="text"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="e.g., My Farm, Portland"
            className="w-full px-4 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 text-sm mb-2">
              Latitude *
            </label>
            <input
              type="text"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="45.5231"
              required
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm mb-2">
              Longitude *
            </label>
            <input
              type="text"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="-122.6765"
              required
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition-colors"
        >
          Set Location
        </button>
      </form>

      <p className="text-slate-400 text-xs mt-4">
        Tip: You can find your coordinates by searching your location on Google Maps
      </p>
    </div>
  )
}

export default LocationInput
