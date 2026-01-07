// Get eclipses visible from a given location and year
// Note: This uses NASA eclipse data.
// Eclipse data source: https://eclipse.gsfc.nasa.gov/eclipse.html
export function getEclipsesForYear(year, latitude, longitude) {
  // Check which years we have data for
  const availableYears = {
    2026: getEclipses2026,
    2027: getEclipses2027,
    2028: getEclipses2028,
    2029: getEclipses2029,
    2030: getEclipses2030
  }

  if (availableYears[year]) {
    return availableYears[year](latitude, longitude)
  }

  // Log a reminder if eclipse data is missing for current year
  const currentYear = new Date().getFullYear()
  if (year === currentYear) {
    console.warn(
      `⚠️ Eclipse data not available for ${year}.\n` +
      `Eclipse data is currently loaded through 2030.\n` +
      `To add eclipse data for ${year}+:\n` +
      `1. Visit: https://eclipse.gsfc.nasa.gov/eclipse.html\n` +
      `2. Get eclipse dates and visibility paths for ${year}\n` +
      `3. Add a getEclipses${year}() function in src/utils/eclipseCalculator.js\n` +
      `4. Register it in the availableYears object\n` +
      `5. Use the template at the bottom of the file as a guide`
    )
  }

  return []
}

// Check if location is within solar eclipse visibility path
function isSolarEclipseVisible(eclipseData, latitude, longitude) {
  // Check if location is within the eclipse path's visibility region
  const { visibleFrom } = eclipseData

  if (!visibleFrom) return false

  // Check if location is in visible region list
  for (const region of visibleFrom) {
    if (region.type === 'path') {
      // Check if within lat/lng bounds of eclipse path
      if (latitude >= region.minLat && latitude <= region.maxLat &&
          longitude >= region.minLng && longitude <= region.maxLng) {
        return true
      }
    } else if (region.type === 'hemisphere') {
      // For partial visibility across hemisphere
      if (region.hemisphere === 'north' && latitude > 0) return true
      if (region.hemisphere === 'south' && latitude < 0) return true
    }
  }

  return false
}

// Check if lunar eclipse is visible (nighttime at location during eclipse)
function isLunarEclipseVisible(eclipseData, latitude, longitude) {
  // Lunar eclipses are visible from entire night side of Earth
  // Simplified: check if location is in the general visibility hemisphere
  const { visibleFrom } = eclipseData

  if (!visibleFrom) return false

  for (const region of visibleFrom) {
    if (region.type === 'hemisphere') {
      if (region.hemisphere === 'americas' && longitude >= -180 && longitude <= -30) return true
      if (region.hemisphere === 'europe-africa' && longitude >= -30 && longitude <= 60) return true
      if (region.hemisphere === 'asia-pacific' && (longitude >= 60 || longitude <= -120)) return true
    } else if (region.type === 'global') {
      return true
    }
  }

  return false
}

// 2026 eclipse data from NASA with visibility information
function getEclipses2026(latitude, longitude) {
  const allEclipses = [
    {
      id: 'solar-2026-02-17',
      name: 'Annular Solar Eclipse',
      month: 2,
      day: 17,
      color: '#FFD700',
      type: 'solar-eclipse',
      eclipseType: 'annular',
      visibleFrom: [
        // Path crosses Antarctica and southern oceans
        { type: 'path', minLat: -90, maxLat: -60, minLng: -180, maxLng: 180 }
      ]
    },
    {
      id: 'lunar-2026-03-03',
      name: 'Total Lunar Eclipse',
      month: 3,
      day: 3,
      color: '#DC143C',
      type: 'lunar-eclipse',
      eclipseType: 'total',
      visibleFrom: [
        // Visible from Americas, Europe, Africa
        { type: 'hemisphere', hemisphere: 'americas' },
        { type: 'hemisphere', hemisphere: 'europe-africa' }
      ]
    },
    {
      id: 'solar-2026-08-12',
      name: 'Total Solar Eclipse',
      month: 8,
      day: 12,
      color: '#FFD700',
      type: 'solar-eclipse',
      eclipseType: 'total',
      visibleFrom: [
        // Path crosses northern Spain, Iceland, Greenland
        { type: 'path', minLat: 40, maxLat: 80, minLng: -50, maxLng: 20 }
      ]
    },
    {
      id: 'lunar-2026-08-28',
      name: 'Partial Lunar Eclipse',
      month: 8,
      day: 28,
      color: '#DC143C',
      type: 'lunar-eclipse',
      eclipseType: 'partial',
      visibleFrom: [
        // Visible from Americas, Pacific
        { type: 'hemisphere', hemisphere: 'americas' },
        { type: 'hemisphere', hemisphere: 'asia-pacific' }
      ]
    }
  ]

  // Filter eclipses based on visibility from location
  return allEclipses.filter(eclipse => {
    if (eclipse.type === 'solar-eclipse') {
      return isSolarEclipseVisible(eclipse, latitude, longitude)
    } else if (eclipse.type === 'lunar-eclipse') {
      return isLunarEclipseVisible(eclipse, latitude, longitude)
    }
    return false
  })
}

// 2027 eclipse data from NASA
function getEclipses2027(latitude, longitude) {
  const allEclipses = [
    {
      id: 'solar-2027-02-06',
      name: 'Annular Solar Eclipse',
      month: 2,
      day: 6,
      color: '#FFD700',
      type: 'solar-eclipse',
      eclipseType: 'annular',
      visibleFrom: [
        // Path crosses South America, southern Africa
        { type: 'path', minLat: -50, maxLat: 10, minLng: -80, maxLng: 40 }
      ]
    },
    {
      id: 'solar-2027-08-02',
      name: 'Total Solar Eclipse',
      month: 8,
      day: 2,
      color: '#FFD700',
      type: 'solar-eclipse',
      eclipseType: 'total',
      visibleFrom: [
        // Path crosses North Africa, Middle East, South Asia
        { type: 'path', minLat: 10, maxLat: 40, minLng: -10, maxLng: 100 }
      ]
    },
    {
      id: 'lunar-2027-09-07',
      name: 'Total Lunar Eclipse',
      month: 9,
      day: 7,
      color: '#DC143C',
      type: 'lunar-eclipse',
      eclipseType: 'total',
      visibleFrom: [
        { type: 'hemisphere', hemisphere: 'europe-africa' },
        { type: 'hemisphere', hemisphere: 'asia-pacific' }
      ]
    }
  ]

  return allEclipses.filter(eclipse => {
    if (eclipse.type === 'solar-eclipse') {
      return isSolarEclipseVisible(eclipse, latitude, longitude)
    } else if (eclipse.type === 'lunar-eclipse') {
      return isLunarEclipseVisible(eclipse, latitude, longitude)
    }
    return false
  })
}

// 2028 eclipse data from NASA
function getEclipses2028(latitude, longitude) {
  const allEclipses = [
    {
      id: 'solar-2028-01-26',
      name: 'Annular Solar Eclipse',
      month: 1,
      day: 26,
      color: '#FFD700',
      type: 'solar-eclipse',
      eclipseType: 'annular',
      visibleFrom: [
        // Path crosses South America, Europe, North Africa
        { type: 'path', minLat: -20, maxLat: 50, minLng: -80, maxLng: 20 }
      ]
    },
    {
      id: 'lunar-2028-01-12',
      name: 'Total Lunar Eclipse',
      month: 1,
      day: 12,
      color: '#DC143C',
      type: 'lunar-eclipse',
      eclipseType: 'total',
      visibleFrom: [
        { type: 'hemisphere', hemisphere: 'americas' },
        { type: 'hemisphere', hemisphere: 'europe-africa' }
      ]
    },
    {
      id: 'solar-2028-07-22',
      name: 'Total Solar Eclipse',
      month: 7,
      day: 22,
      color: '#FFD700',
      type: 'solar-eclipse',
      eclipseType: 'total',
      visibleFrom: [
        // Path crosses Australia, New Zealand
        { type: 'path', minLat: -50, maxLat: -10, minLng: 110, maxLng: 180 }
      ]
    },
    {
      id: 'lunar-2028-07-06',
      name: 'Partial Lunar Eclipse',
      month: 7,
      day: 6,
      color: '#DC143C',
      type: 'lunar-eclipse',
      eclipseType: 'partial',
      visibleFrom: [
        { type: 'hemisphere', hemisphere: 'americas' },
        { type: 'hemisphere', hemisphere: 'asia-pacific' }
      ]
    }
  ]

  return allEclipses.filter(eclipse => {
    if (eclipse.type === 'solar-eclipse') {
      return isSolarEclipseVisible(eclipse, latitude, longitude)
    } else if (eclipse.type === 'lunar-eclipse') {
      return isLunarEclipseVisible(eclipse, latitude, longitude)
    }
    return false
  })
}

// 2029 eclipse data from NASA
function getEclipses2029(latitude, longitude) {
  const allEclipses = [
    {
      id: 'lunar-2029-06-12',
      name: 'Partial Lunar Eclipse',
      month: 6,
      day: 12,
      color: '#DC143C',
      type: 'lunar-eclipse',
      eclipseType: 'partial',
      visibleFrom: [
        { type: 'hemisphere', hemisphere: 'asia-pacific' }
      ]
    },
    {
      id: 'lunar-2029-12-05',
      name: 'Total Lunar Eclipse',
      month: 12,
      day: 5,
      color: '#DC143C',
      type: 'lunar-eclipse',
      eclipseType: 'total',
      visibleFrom: [
        { type: 'hemisphere', hemisphere: 'americas' },
        { type: 'hemisphere', hemisphere: 'asia-pacific' }
      ]
    },
    {
      id: 'solar-2029-12-20',
      name: 'Total Solar Eclipse',
      month: 12,
      day: 20,
      color: '#FFD700',
      type: 'solar-eclipse',
      eclipseType: 'total',
      visibleFrom: [
        // Path crosses South America, southern Africa
        { type: 'path', minLat: -50, maxLat: 0, minLng: -80, maxLng: 40 }
      ]
    }
  ]

  return allEclipses.filter(eclipse => {
    if (eclipse.type === 'solar-eclipse') {
      return isSolarEclipseVisible(eclipse, latitude, longitude)
    } else if (eclipse.type === 'lunar-eclipse') {
      return isLunarEclipseVisible(eclipse, latitude, longitude)
    }
    return false
  })
}

// 2030 eclipse data from NASA
function getEclipses2030(latitude, longitude) {
  const allEclipses = [
    {
      id: 'solar-2030-06-01',
      name: 'Annular Solar Eclipse',
      month: 6,
      day: 1,
      color: '#FFD700',
      type: 'solar-eclipse',
      eclipseType: 'annular',
      visibleFrom: [
        // Path crosses Mediterranean, Middle East, Asia
        { type: 'path', minLat: 20, maxLat: 50, minLng: -10, maxLng: 140 }
      ]
    },
    {
      id: 'lunar-2030-06-15',
      name: 'Partial Lunar Eclipse',
      month: 6,
      day: 15,
      color: '#DC143C',
      type: 'lunar-eclipse',
      eclipseType: 'partial',
      visibleFrom: [
        { type: 'hemisphere', hemisphere: 'asia-pacific' }
      ]
    },
    {
      id: 'solar-2030-11-25',
      name: 'Total Solar Eclipse',
      month: 11,
      day: 25,
      color: '#FFD700',
      type: 'solar-eclipse',
      eclipseType: 'total',
      visibleFrom: [
        // Path crosses southern Africa, Australia
        { type: 'path', minLat: -50, maxLat: -10, minLng: 10, maxLng: 150 }
      ]
    },
    {
      id: 'lunar-2030-12-09',
      name: 'Total Lunar Eclipse',
      month: 12,
      day: 9,
      color: '#DC143C',
      type: 'lunar-eclipse',
      eclipseType: 'total',
      visibleFrom: [
        { type: 'hemisphere', hemisphere: 'americas' },
        { type: 'hemisphere', hemisphere: 'asia-pacific' }
      ]
    }
  ]

  return allEclipses.filter(eclipse => {
    if (eclipse.type === 'solar-eclipse') {
      return isSolarEclipseVisible(eclipse, latitude, longitude)
    } else if (eclipse.type === 'lunar-eclipse') {
      return isLunarEclipseVisible(eclipse, latitude, longitude)
    }
    return false
  })
}

/*
 * TEMPLATE FOR ADDING NEW YEARS:
 *
 * 1. Get eclipse data from NASA: https://eclipse.gsfc.nasa.gov/eclipse.html
 *
 * 2. Add a new function (copy and modify getEclipses2026):
 *
 * function getEclipses2027(latitude, longitude) {
 *   const allEclipses = [
 *     {
 *       id: 'solar-2027-02-06',
 *       name: 'Annular Solar Eclipse',
 *       month: 2,
 *       day: 6,
 *       color: '#FFD700',
 *       type: 'solar-eclipse',
 *       eclipseType: 'annular',
 *       visibleFrom: [
 *         // Add visibility path/regions
 *         { type: 'path', minLat: -30, maxLat: 10, minLng: -100, maxLng: -20 }
 *       ]
 *     },
 *     // ... add more eclipses
 *   ]
 *   return allEclipses.filter(eclipse => {
 *     if (eclipse.type === 'solar-eclipse') {
 *       return isSolarEclipseVisible(eclipse, latitude, longitude)
 *     } else if (eclipse.type === 'lunar-eclipse') {
 *       return isLunarEclipseVisible(eclipse, latitude, longitude)
 *     }
 *     return false
 *   })
 * }
 *
 * 3. Register the function in availableYears object at the top:
 *    2027: getEclipses2027,
 */
