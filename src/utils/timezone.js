/**
 * Fetch the IANA timezone string for a lat/lng coordinate.
 * Uses timeapi.io — free, no API key required.
 * Returns null on failure so callers can fall back gracefully.
 */
export async function fetchTimezone(lat, lng) {
  try {
    const res = await fetch(
      `https://timeapi.io/api/TimeZone/coordinate?latitude=${lat}&longitude=${lng}`
    )
    const data = await res.json()
    return data.timeZone || null
  } catch {
    return null
  }
}
