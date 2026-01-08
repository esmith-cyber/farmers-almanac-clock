# Farmer's Almanac Clock

## Vision
A unique clock that measures time by natural cycles rather than mechanical hours and minutes.

## Quick Start / Rebuild Instructions

### Initial Setup
```bash
# Create React + Vite project
npm create vite@latest farmers-almanac-clock -- --template react
cd farmers-almanac-clock
npm install

# Install dependencies
npm install suncalc date-fns
npm install -D tailwindcss@^3 postcss autoprefixer
npx tailwindcss init -p
```

### Configuration Files

**tailwind.config.js:**
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**postcss.config.js:**
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**src/index.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  place-items: center;
  background: linear-gradient(to bottom, #0f172a, #1e293b);
}

#root {
  width: 100%;
  min-height: 100vh;
}
```

**src/App.css:**
```css
/* App styles are handled by Tailwind CSS */
/* Add any custom styles here if needed */
```

### Component Structure
```
src/
├── App.jsx (Main app with 3-layer clock display, responsive sizing)
├── components/
│   ├── AlmanacClock.jsx (Day/Night - 38.89% of container, z-20, innermost)
│   ├── MoonPhaseClock.jsx (Lunar phases - 55.56% of container, z-10)
│   ├── AnnualEventsClock.jsx (Annual events + Zodiac - 100% of container, z-0, outermost)
│   ├── EventManager.jsx (Event CRUD interface)
│   ├── LocationInput.jsx (Location picker with validation)
│   └── SunTimes.jsx (Detailed sun/moon event times display)
```

### App.jsx Structure
```javascript
import AlmanacClock from './components/AlmanacClock'
import MoonPhaseClock from './components/MoonPhaseClock'
import AnnualEventsClock from './components/AnnualEventsClock'
import EventManager from './components/EventManager'
import LocationInput from './components/LocationInput'
import SunTimes from './components/SunTimes'

// State: location, locationError, isEditingLocation, currentDate, events
// useEffect: Auto-detect geolocation on mount
// useEffect: Update currentDate every minute

// Responsive sizing system:
// Container: min(85vw, calc(100vh - 300px), 1000px)
// - Scales with viewport while maintaining aspect ratio
// - Min size: 400px to stay readable
// - Accounts for header and UI elements

// Layered clock structure (z-index order):
// - NOW indicator (z-30, positioned outside/above annual disc)
// - AlmanacClock (z-20, innermost, 38.89% of container)
// - MoonPhaseClock (z-10, middle, 55.56% of container)
// - AnnualEventsClock with Zodiac (z-0, outermost, 100% of container)
```

### Key Dependencies & APIs
- **SunCalc library**: For sun times and moon phase calculations
  - `SunCalc.getTimes(date, lat, lng)` - sun events
  - `SunCalc.getMoonIllumination(date)` - moon phase & illumination
  - `SunCalc.getMoonTimes(date, lat, lng)` - moon rise/set
- **date-fns**: For date formatting (`format` function)
- **Browser Geolocation API**: `navigator.geolocation.getCurrentPosition()`

### Color Palette Reference
- **Day/Night Clock**: Yellow/orange (day) to purple/blue (night)
- **Lunar Clock**: Dark slate (#0f172a) to medium slate (#64748b)
- **Zodiac Clock**: Deep space black (#030712) with blue-white stars (#bae6fd, #e0f2fe)
- **General UI**: Slate color scheme (Tailwind slate-xxx)

## Time Intervals
- **Smallest interval**: Sunrise and Sunset
- **Largest interval**: Annual calendar
- **Focus**: Beautiful presentation of daily, weekly, monthly, and yearly cycles

## Technical Requirements

### Core Functionality
- Calculate accurate sunrise/sunset times based on location
- Display time in natural cycles (daily, weekly, monthly, yearly)
- Auto-detect user's geographic location
- Allow user to validate/correct location (handles VPN scenarios)

### Tech Stack
- **Framework**: React + Vite
- **Styling**: Tailwind CSS
- **Sun Calculations**: SunCalc library
- **Moon Calculations**: SunCalc library (`getMoonIllumination()`)
- **Location**: Browser Geolocation API with manual override

### User Experience
- Non-technical user friendly
- Visual, interactive interface
- Circular/radial clock layouts
- Smooth animations between cycles
- No backend required (runs entirely in browser)

## Clock Mechanics & Rotation Philosophy

### Core Concept: Rotating Faces, Not Hands
Unlike traditional clocks where hands move across a fixed face, the Farmer's Almanac Clock features rotating disks where the face itself turns. This creates an intuitive sense of time flowing toward and through you.

### The NOW Position
- **NOW is always at 12:00** - A fixed blue arrow indicator positioned outside and above the annual disk marks the current moment
- Positioned at the container level (z-30) rather than within individual clocks
- The disks rotate beneath this fixed pointer
- You watch events approach from one side, pass through NOW, and recede on the other side
- Arrow scales responsively with the container (1.33vmin × 2.22vmin)

### Time Flow Direction

**All Disks Rotate Clockwise:**
- All disks physically rotate clockwise (positive CSS rotation values)
- Events are pinned to their disks and rotate with them
- Future events approach from the LEFT side of NOW (9:00-11:00 positions)
- Past events recede to the RIGHT side of NOW (1:00-3:00 positions)
- Natural flow: events move right across your field of view as time progresses
- Consistent clockwise rotation across all time scales creates unified experience

**Implementation Note:** Events are positioned counterclockwise around each disk (like reading a backwards clock). When combined with the clockwise disk rotation, this creates the desired flow where future events approach from the left.

### Pinned Elements
- Event markers and gradients are "pinned" to their respective disks
- They rotate WITH the disk, maintaining their relative positions
- This ensures visual consistency - e.g., full moon always appears in the brightest part of the lunar gradient

### Layered Disks
- Multiple disks of different sizes stack concentrically
- Each disk represents a different time scale (daily, weekly/lunar, monthly, yearly)
- Inner (smaller) disks sit on top of outer (larger) disks
- Each disk rotates independently at its own rate
- All disks share the same NOW position at 12:00

**Sizing Specifications (Responsive):**
- Container size: `min(85vw, calc(100vh - 300px), 1000px)`
  - Scales with viewport, accounting for header and UI
  - Maximum: 1000px (prevents oversizing on large screens)
  - Minimum: 400px (ensures readability on small screens)
- Proportional disk sizing:
  - Annual Events + Zodiac: 100% of container (outermost, z-0)
  - Lunar: 55.56% of container (equivalent to 500px when container is 900px, z-10)
  - Day/Night: 38.89% of container (equivalent to 350px when container is 900px, z-20)
- Original design proportions maintained: 900:500:350 ratio
- Text and UI elements scale using `vmin` units with max sizes for readability
- Z-index values ensure proper layering with innermost disk on top

The annual ring's 200px width accommodates both zodiac constellations and custom event markers with plenty of breathing room. All proportions scale together as the viewport changes size.

### Update Frequency
- All clocks update every minute
- Smooth CSS transitions create fluid, continuous motion
- No sudden jumps or discrete ticking

## Implementation Details

### Day/Night Cycle Clock (Daily View)
**Size:** 350px diameter (center disk)
**Rotation:** Clockwise
**Time Scale:** 24 hours (one full rotation per day)

**Design Philosophy:**
- No artificial 24-hour tick marks or markers - pure gradient visualization
- Colors blend smoothly around the entire circle following the actual light cycle
- Clean, minimal design with no visual clutter

**Gradient Implementation:**
- Uses CSS `conic-gradient` for seamless color transitions
- Gradient stops positioned at actual sun event times (calculated via SunCalc)
- Multiple intermediate stops between night and midnight to smooth the gradient wrapping
- Color progression follows the natural light cycle:
  - Midnight: Deep night blue/black (#0a0e27)
  - Dawn: Purple transition (#4a4a7d)
  - Pre-sunrise: Pink (#e85d75)
  - Sunrise: Orange (#ff9966)
  - Morning: Yellow (#ffd966)
  - Solar Noon: Brightest cream/yellow (#fffacd)
  - Afternoon: Yellow (#ffd966)
  - Sunset: Coral (#ff7f50)
  - Dusk: Purple (#6b5b95)
  - Night: Dark blue (#1a1f3a)
  - Late night: Progressive darkening back to midnight (#141d2e → #111825 → #0e141f → #0b1019)

**Visual Style:**
- No event markers or radial lines
- Subtle border (2px, 30% opacity)
- Pure gradient representation of the day/night cycle

**Rotation Calculation:**
```javascript
const hours = currentDate.getHours()
const minutes = currentDate.getMinutes()
const seconds = currentDate.getSeconds()
const currentTimeInHours = hours + minutes / 60 + seconds / 3600
const currentAngle = (currentTimeInHours / 24) * 360
rotation = currentAngle  // Positive for clockwise
```

### Moon Phase Clock (Weekly/Lunar Cycle View)
**Size:** 500px diameter (75px ring around 350px day/night clock)
**Rotation:** Clockwise
**Time Scale:** ~29.53 days (one full rotation per lunar cycle)

**Design Philosophy:**
- Quarter moon phases are "pinned" to the disk at fixed positions and rotate WITH the gradient
- No artificial weekly divisions - only natural lunar phases matter
- Phase-based star field creates atmospheric depth

**Data Source:**
- Uses SunCalc library's `getMoonIllumination()` function
- Returns `phase` (0-1) and `fraction` (illumination percentage)
- Phase values: 0 = New Moon, 0.25 = First Quarter, 0.5 = Full Moon, 0.75 = Last Quarter

**Background Stars:**
- 80 stars scattered throughout the lunar ring (175px-250px radius)
- **Phase-based opacity**: Stars brightest near New Moon position (~70% opacity), fade toward Full Moon (~10% opacity)
- Uses cosine curve for smooth fading: `opacity = (cos(angle) + 1) / 2 * 0.6 + 0.1`
- Stars rotate WITH the disk, reinforcing that more stars are visible during new moon than full moon
- Random sizes (0.5-1.7px radius)

**Gradient Implementation:**
- CSS `conic-gradient` synchronized to moon phases
- Gradient is "pinned" to disk - rotates WITH the phase icons
- Multiple intermediate stops between 315° and 360° for smoother wrapping
- Color progression follows illumination intensity:
  - 0° (New Moon): Darkest (#0f172a)
  - 45°: Waxing crescent transition (#1e293b)
  - 90° (First Quarter): Medium dark (#334155)
  - 135°: Waxing gibbous transition (#475569)
  - 180° (Full Moon): Lightest (#64748b)
  - 225°: Waning gibbous transition (#475569)
  - 270° (Last Quarter): Medium dark (#334155)
  - 315°: Waning crescent transition (#1e293b)
  - 326.25°, 337.5°, 348.75°: Progressive blending stops
  - 360° (Back to New Moon): Darkest (#0f172a)

**Phase Marker Icons:**
- **New Moon** (0° position): Dark circle with subtle glow and dark craters (4 crater textures)
- **First Quarter** (90° position): Right half illuminated with smooth elliptical terminator, 3 light-side craters, 2 dark-side craters
- **Full Moon** (180° position): Bright circle with detailed maria (3 elliptical dark patches) and 5 crater textures
- **Last Quarter** (270° position): Left half illuminated with smooth elliptical terminator, 3 light-side craters, 2 dark-side craters
- All icons: 32px diameter (reduced to fit comfortably in ring), positioned at 212.5px radius (centered in ring)
- SVG-based with smooth terminator lines (no harsh clip paths, uses ellipses for natural curvature)
- Realistic surface textures on all moons

**Visual Style:**
- Subtle border (2px, 30% opacity)
- Atmospheric depth with phase-synced starfield

**Rotation Calculation:**
```javascript
const currentPhase = moonData.phase  // 0-1 from SunCalc
const currentAngle = currentPhase * 360
rotation = currentAngle  // Positive for clockwise
```

**Center Display:**
- Current phase name (e.g., "Waning Gibbous", "First Quarter")
- Illumination percentage (e.g., "86% illuminated")
- Text counter-rotates to stay upright

### Annual Events Clock with Zodiac Constellations (Merged)
**Size:** 900px diameter (200px ring around 500px lunar clock)
**Rotation:** Clockwise (disk rotates clockwise, events pinned to disk)
**Time Scale:** 365 days (one full rotation per year)
**Time Flow:** Events positioned counterclockwise around circle so future events approach from left

**Design Philosophy:**
- User-customizable event tracking throughout the year
- Zodiac constellations integrated into the same ring
- Persistent storage via localStorage for custom events
- Deep space gradient background with starfield atmosphere
- Color-coded event markers for easy visual identification
- Interactive event management UI

**Visual Design:**
- **Background:** Deep blue gradient (#0a1628 to #1e293b) - lighter than previous solid black
- **Border:** Very subtle translucent border (2px, slate-700/20 opacity)
- **Star field:** 150 randomly positioned stars (0.5-2.5px radius, 30-100% opacity) filling entire 200px ring
- **Ring dimensions:** Inner radius 250px, outer radius 450px (200px wide)
- **Month markers:** 12 subtle radial lines dividing the year (opacity 0.3, #475569)
- **Zodiac constellations:** Custom SVG star maps for each sign with color theming
  - **Size & Opacity:** Scaled 6.5x (large), 18% opacity (very subtle, ethereal)
  - **Colors by sign:** Each constellation rendered in its traditional color (Aries: red, Taurus: green, Gemini: yellow, Cancer: lavender, Leo: orange, Virgo: purple, Libra: pink, Scorpio: deep red, Sagittarius: purple, Capricorn: grey, Aquarius: cyan, Pisces: turquoise)
  - **Styling:** Uses `currentColor` for SVG elements to inherit group color
  - **Position:** 320px radius (inner half of ring)
  - **Offset:** 15° to sit neatly between month division lines (not overlapping)
  - **Rotation:** Counter-rotated to stay upright as disk rotates
- **Event markers:** Colored dots positioned at 410px radius (outer edge of ring)
  - Regular events: 6px radius, 2px white stroke, 90% opacity
  - **Today's events (magnified)**: 10px radius, 3px white stroke, 100% opacity
  - **Pulse animation**: Today's events pulse between 10px and 12px over 2 seconds
  - **Enhanced labels**: Today's events have brighter white text, larger font (13px vs 11px), bold weight
- **Event labels:** Radial sunburst layout
  - Event name only (no date labels)
  - Positioned radially between dot and outer edge of ring
  - Points outward from center like sun rays
  - Text flips for left-half events to remain readable
  - Creates clean, organized visual pattern

**Zodiac Sign Data:**
All 12 signs with accurate date ranges and colors:
- Aries: Mar 21 - Apr 19 (0°, #ef4444 red)
- Taurus: Apr 20 - May 20 (30°, #4ade80 green)
- Gemini: May 21 - Jun 20 (60°, #fbbf24 yellow)
- Cancer: Jun 21 - Jul 22 (90°, #e0e7ff lavender)
- Leo: Jul 23 - Aug 22 (120°, #fb923c orange)
- Virgo: Aug 23 - Sep 22 (150°, #a78bfa purple)
- Libra: Sep 23 - Oct 22 (180°, #f472b6 pink)
- Scorpio: Oct 23 - Nov 21 (210°, #dc2626 deep red)
- Sagittarius: Nov 22 - Dec 21 (240°, #a855f7 purple)
- Capricorn: Dec 22 - Jan 19 (270°, #94a3b8 grey)
- Aquarius: Jan 20 - Feb 18 (300°, #22d3ee cyan)
- Pisces: Feb 19 - Mar 20 (330°, #2dd4bf turquoise)

**Constellation Patterns (SVG Implementations):**

Each constellation is a custom SVG group with stars (circles) and connecting lines:

- **Aries:** Curved ram's horn - 4 stars in curved line
- **Taurus:** Bull's V-shaped face with horns - 5 stars forming V with horn tips
- **Gemini:** Twin pillars - 6 stars in two parallel vertical lines connected at top and bottom
- **Cancer:** Crab shape - 6 stars showing body and two claws
- **Leo:** Lion's mane and body - 6 stars showing triangular mane and body
- **Virgo:** Maiden figure - 5 stars in diagonal descending pattern
- **Libra:** Balance scales - 5 stars showing beam with two pans
- **Scorpio:** Scorpion with curved tail - 5 stars in curved ascending pattern
- **Sagittarius:** Archer's arrow - 6 stars forming diagonal arrow with feathers
- **Capricorn:** Goat with fish tail - 5 stars showing arched body descending to tail
- **Aquarius:** Water bearer waves - 7 stars in two wavy horizontal lines
- **Pisces:** Two fish connected - 7 stars showing two fish joined by line

All constellations use consistent styling:
- All stars and lines use `currentColor` (inherits from parent group's color)
- Star sizes: 1-2px radius
- Connecting lines: 0.5px stroke-width
- Applied opacity: 18% at group level for ethereal effect

**Current Sign Calculation:**
```javascript
// Get current month (1-12) and day
const month = currentDate.getMonth() + 1
const day = currentDate.getDate()

// Find matching sign by checking date ranges
// Handles signs that cross month boundaries
// Handles Capricorn which crosses year boundary (Dec-Jan)
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
```

**Event Data Structure:**
Each event contains:
- `id`: Unique timestamp identifier
- `name`: Event name (string)
- `month`: Month number (1-12)
- `day`: Day of month (1-31)
- `color`: Hex color code for visual identification

**Default Events:**
Pre-populated with seasonal markers:
- New Year (1/1) - Blue
- Valentine's Day (2/14) - Pink
- Spring Equinox (3/20) - Green
- Summer Solstice (6/21) - Yellow
- Autumn Equinox (9/22) - Orange
- Winter Solstice (12/21) - Purple

**Rotation Calculation:**
```javascript
// Get day of year (1-365 or 366)
const calculateDayOfYear = (date) => {
  const startOfYear = new Date(date.getFullYear(), 0, 1)
  return Math.floor((date - startOfYear) / (1000 * 60 * 60 * 24)) + 1
}

const dayOfYear = calculateDayOfYear(currentDate)
const totalDays = 365 + (isLeapYear(currentDate.getFullYear()) ? 1 : 0)

// Convert to degrees (full circle = full year)
// Use POSITIVE angle for CLOCKWISE disk rotation
// Events are positioned with negative angles (counterclockwise around circle)
// Clockwise rotation brings future events from left side to top
const currentAngle = (dayOfYear / totalDays) * 360

// Apply rotation to disk (positive = clockwise rotation)
// Disk rotates CLOCKWISE with events pinned to it
// Future events approach from left, past events recede to right
rotation = currentAngle  // Positive value = clockwise rotation
```

**Event Position Calculation:**
```javascript
// Calculate angle for event date
const dateToAngle = (month, day) => {
  const year = currentDate.getFullYear()
  const eventDate = new Date(year, month - 1, day)
  const startOfYear = new Date(year, 0, 1)
  const dayOfYear = Math.floor((eventDate - startOfYear) / (1000 * 60 * 60 * 24)) + 1
  const totalDays = 365 + (isLeapYear(year) ? 1 : 0)
  // Use negative angle to position events counterclockwise around circle
  // Events are pinned to the disk and rotate clockwise with it
  return -(dayOfYear / totalDays) * 360
}

// Convert angle to position on ring
const radius = 410  // Outer edge of 200px ring for event markers
const rad = ((angle - 90) * Math.PI) / 180  // -90 to start at top (12:00)
const x = 450 + radius * Math.cos(rad)  // Center at 450, 450
const y = 450 + radius * Math.sin(rad)
```

**Center Display:**
- Current cycle name: "Annual Cycle"
- Day counter: "Day N of 365/366"
- Current zodiac sign name (e.g., "Capricorn")
- Text counter-rotates to stay upright
- Styling: bg-slate-900/80, border-slate-700/50, text-slate-300

**Event Management:**
Users can add, edit, and delete events via the EventManager component:
- **Add Event**: Opens modal with form for name, date, and color selection
- **Edit Event**: Click "Edit" to modify existing event
- **Delete Event**: Click "Delete" with confirmation dialog, automatically closes modal after deletion
- **Color Options**: 8 preset colors (Blue, Pink, Green, Yellow, Orange, Purple, Red, Cyan)
- **Date Validation**: Ensures valid day for selected month
- **Sorted List**: Events displayed chronologically by date
- **Persistence**: All changes saved to localStorage automatically

**Event Manager UI:**
- Accessible via single "Events (N)" button in top-right corner
- Modal interface with dark theme (bg-slate-800)
- **Two-state interface**:
  - **List view** (default): Shows all events with "+ Add New Event" button and close (×) button
  - **Form view**: Shows form for adding/editing with Save and Cancel buttons
- Form fields: Event name (text), Month (dropdown), Day (number), Color (color picker grid)
- Event list shows all events sorted by date with Edit/Delete actions
- Click outside modal (when in list view) to close
- Responsive design with max-height scrollable areas

**State Management:**
- Events state managed in App.jsx (top-level)
- Loaded from localStorage on mount with default seasonal events
- Saved to localStorage whenever events change
- Passed down as prop to AnnualEventsClock (read-only)
- EventManager receives events prop and onEventsChange callback
- Single source of truth ensures UI stays synchronized

**Integration:**
- Component: `src/components/AnnualEventsClock.jsx` (includes zodiac constellations)
- Event Manager: `src/components/EventManager.jsx`
- Props for AnnualEventsClock: `currentDate` (Date object), `events` (array)
- Props for EventManager: `events` (array), `onEventsChange` (callback)
- Z-index: 0 (outermost layer)
- Storage: localStorage key 'annualEvents'
- SVG viewBox: 0 0 900 900 (matches component size)
- Center point: 450, 450
- No location dependency (events and zodiac based on date only)

## UI/UX Design Notes
- **Single NOW marker**: Blue arrow indicator positioned outside and above the annual disc at 12:00 position
  - Positioned at container level (z-30) rather than within individual clock components
  - Scales responsively with viewport using vmin units
- **No descriptive labels**: Clock labels removed for cleaner aesthetic (previously showed "Lunar Cycle (~29.5 days)", "Zodiac Cycle", etc.)
- **Minimal text**: Only essential information shown in center displays
- **UI controls repositioned**: Location display and event manager moved from center to corners (2026-01-06)
  - **Location display**: Fixed position top-left with semi-transparent background
    - Uses reverse geocoding (OpenStreetMap Nominatim API) to show readable location
    - Format preference: "City, State" or "City, Country"
    - Falls back gracefully through State/Country, City only, Country only, or "Your Location"
    - No authentication required, free API
  - **Event manager**: Fixed position top-right with semi-transparent background
    - Single "Events (N)" button shows event count
    - Simplified UI with list/form toggle
  - Both use backdrop-blur effect and subtle styling to stay out of the way
  - Keeps clock display front and center without clutter
- **Responsive design**: Clock scales with viewport size (2026-01-06)
  - Container adapts to available space while maintaining proportions
  - Text scales with vmin units for readability at all sizes
  - Minimum size enforced to prevent illegibility on small screens

## SunTimes Component (Detailed Time Display)
Split into two side panels positioned in the negative space flanking the clock display.

**Sun Information Panel (Left Side):**
- Current period display with emoji (Dawn 🌅, Morning ☀️, Afternoon ☀️, Dusk 🌇, Night 🌙)
- Current date display (e.g., "Jan 6, 2026")
- Sunrise time (highlighted amber)
- Sunset time (highlighted orange)
- Day length (hours and minutes between sunrise and sunset)
- Dawn time (nautical twilight)
- Dusk time (nautical twilight)

**Moon Information Panel (Right Side):**
- Moon phase emoji display (🌑 🌒 🌓 🌔 🌕 🌖 🌗 🌘)
- Traditional monthly moon name:
  - January: Wolf Moon
  - February: Snow Moon
  - March: Worm Moon
  - April: Pink Moon
  - May: Flower Moon
  - June: Strawberry Moon
  - July: Buck Moon
  - August: Sturgeon Moon
  - September: Harvest Moon
  - October: Hunter's Moon
  - November: Beaver Moon
  - December: Cold Moon
- Current phase name (New Moon, Waxing Crescent, First Quarter, Waxing Gibbous, Full Moon, Waning Gibbous, Last Quarter, Waning Crescent)
- Illumination percentage (0-100%)
- Moonrise time (when available)
- Moonset time (when available)
- Moon altitude (height in sky, 0-90°)
- Moon azimuth (compass direction, 0-360°)

**Data Sources:**
- Uses SunCalc library for all calculations
- `SunCalc.getTimes()` for sun events
- `SunCalc.getMoonIllumination()` for phase and illumination
- `SunCalc.getMoonTimes()` for moonrise/moonset
- `SunCalc.getMoonPosition()` for altitude and azimuth
- date-fns for time formatting

**Visual Design:**
- Two separate semi-transparent panels (bg-slate-800/90 with backdrop blur)
- Positioned absolutely from bottom (60px from bottom edge)
- Max width 200px each to fit in negative space
- Rounded on clock-facing edges (right side of left panel, left side of right panel)
- Compact vertical layout with hierarchical typography
- Consistent slate color scheme matching main UI
- Shadow-xl for depth

## Development Notes
- Project created: 2026-01-06
- Target audience: General users, not technical
- Design priority: Natural, intuitive time representation
- Major refactor: Merged Zodiac clock into Annual Events clock (2026-01-06)
  - Reduced from 4 disks to 3 disks
  - Expanded annual ring to 200px width for better spacing
  - Changed event positioning to counterclockwise arrangement so future events approach from left
  - All disks rotate CLOCKWISE with events pinned to them (rotating with the disk)
- Bug fix: Annual Events disk rotation direction (2026-01-06)
  - Issue: Disk was rotating counterclockwise (negative angle) instead of clockwise
  - Symptom: New Year (Jan 1) appeared to the left of NOW on Jan 6, when it should be to the right
  - Root cause: Rotation angle was negative (counterclockwise) instead of positive (clockwise)
  - Fix: Changed rotation from `-(dayOfYear / totalDays) * 360` to `(dayOfYear / totalDays) * 360`
  - Also updated counter-rotation for event labels and zodiac constellations to account for clockwise disk rotation
  - Now properly displays: past events (like Jan 1) recede to the right, future events approach from the left
- Responsive sizing implementation (2026-01-06)
  - Converted from fixed pixel sizes to viewport-relative sizing
  - Container: `min(85vw, calc(100vh - 300px), 1000px)` with 400px minimum
  - All clock components scale proportionally: 100%, 55.56%, 38.89%
  - Text and UI elements scale using vmin units with max sizes
  - Maintains original 900:500:350 proportions at all viewport sizes
  - Clock now fully visible without scrolling on all screen sizes
- NOW indicator repositioning (2026-01-06)
  - Moved from inside AnnualEventsClock component to App.jsx container level
  - Now positioned outside and above the annual disc (top: -2.5%)
  - Z-index 30 to sit above all clock layers
  - Scales responsively with container using vmin units
- Moon information added to SunTimes component (2026-01-06)
  - Traditional monthly moon names (Wolf Moon, Snow Moon, etc.)
  - Current phase name and illumination percentage
  - Phase-appropriate emoji display
  - Moonrise and moonset times
  - Comprehensive moon data section added below sun times
- Today's event magnification (2026-01-06)
  - Events occurring on current date are visually magnified on annual ring
  - 10px radius vs 6px for regular events, 3px stroke vs 2px
  - Subtle pulse animation (10px to 12px over 2 seconds)
  - Enhanced labels: brighter white text, larger font (13px), bold weight
  - Makes it immediately clear which events are happening today
- Event state management refactored (2026-01-06)
  - Events state moved from AnnualEventsClock to App.jsx (top-level)
  - Single source of truth ensures synchronization between EventManager and clock display
  - Events loaded from localStorage on mount, saved on every change
  - AnnualEventsClock receives events as read-only prop
- EventManager UI simplified (2026-01-06)
  - Consolidated from two buttons ("+ Add Event" and "Events") to single "Events (N)" button
  - Two-state modal: list view (default) and form view (when adding/editing)
  - Close button (×) and click-outside-to-close in list view
  - Delete now automatically closes modal after confirmation
  - Cleaner, more intuitive workflow
- Reverse geocoding for location display (2026-01-06)
  - Uses OpenStreetMap Nominatim API to convert lat/lng to readable location name
  - Shows "City, State" or "City, Country" instead of generic "Your Location"
  - Graceful fallbacks: State/Country → City → Country → "Your Location"
  - Free API, no authentication required, fits no-backend design philosophy
- Event and zodiac tooltips (2026-01-06)
  - Added SVG `<title>` elements for native browser tooltips
  - Event markers show: "Event Name (Date)" on hover
  - Zodiac constellations show: "Sign Name: Date Range" on hover
  - Eliminated event label clutter - only today's events show persistent labels
  - All other event info accessed via hover tooltips
- Zodiac positioning fix (2026-01-06)
  - Bug: Zodiac signs were positioned at fixed 30-degree intervals regardless of actual dates
  - Symptom: Capricorn appeared in wrong position, showed "Aries" as current sign in January
  - Root cause: Signs used hardcoded angle values (0°, 30°, 60°, etc.) instead of date-based calculation
  - Fix: Calculate each sign's position based on midpoint of its actual date range
  - Special handling for Capricorn which crosses year boundary (Dec 22 - Jan 19)
  - Now accurately reflects current zodiac sign based on actual calendar dates
- Radial division lines updated (2026-01-06)
  - Changed from fixed monthly intervals to zodiac sign boundaries
  - Lines now drawn at the START date of each zodiac sign
  - Creates proper angular "slices" for each sign's duration
  - Constellations positioned at midpoint, centered within their slice boundaries
  - Aligns visual structure with actual zodiac calendar periods
- Sun/Moon info layout reimagined (2026-01-06)
  - Completely redesigned from single centered component below clock to split side panels
  - **Sun panel (left)**: Period name, date, sunrise/sunset times (highlighted), day length, dawn/dusk
  - **Moon panel (right)**: Moon name, phase, illumination %, moonrise/moonset, altitude, azimuth
  - Both panels: Semi-transparent (bg-slate-800/90) with backdrop blur
  - Positioned from bottom up (bottom: 60px) instead of from midpoint down
  - Float in negative space beside the clock, max-width 200px
  - Rounded on clock-facing edges (rounded-r-2xl for left, rounded-l-2xl for right)
  - Added moon position data: altitude (height in sky 0-90°) and azimuth (compass direction 0-360°)
  - Entire interface now fits on one screen without scrolling
  - Main container adjusted: calc(100vh - 100px) height, relative positioning for absolute child panels
- Fully responsive dynamic sizing (2026-01-06)
  - All elements now scale with viewport size using min() functions
  - **Clock**: Max size increased to 2400px (from 1000px), uses 95vw and calc(100vh - 200px)
  - **Side panels**: Scale 18vw up to 320px max (from 200px), all fonts and spacing scale proportionally
  - **Top buttons**: Location and Events buttons scale with padding/fonts based on viewport
  - **Title**: Scales from 3.5vw up to 42px max
  - Everything maintains minimum sizes for readability on small screens
  - Maximizes use of screen real estate on large displays
- Distinguished event icons (2026-01-06)
  - **Personal events** (birthdays, etc.): Circles (6px radius, 10px when today)
  - **Astronomical events** (solstices, equinoxes): Diamond shapes (45° rotated squares)
  - **Solar eclipses**: Gold star-burst icons with 8 radiating rays
  - **Lunar eclipses**: Crimson crescent icons (overlapping circles creating crescent shadow)
  - Visual distinction makes event types immediately recognizable at a glance
- Automated eclipse detection (2026-01-06)
  - Eclipses automatically appear on annual ring based on location and year
  - **Location-based visibility filtering**: Only shows eclipses visible from user's location
    - Solar eclipses: Checks if location is within narrow visibility path
    - Lunar eclipses: Checks if location is on night side (hemisphere-based)
  - **Pre-loaded data 2026-2030**: 14 solar + 10 lunar eclipses with accurate NASA data
  - Eclipse data source: NASA Eclipse Website (https://eclipse.gsfc.nasa.gov/eclipse.html)
  - **Visibility regions defined**: Geographic bounds for solar paths, hemisphere zones for lunar
  - **Automatic until 2031**: No manual updates needed for next 5 years
  - Console warning system: Alerts in 2031+ with instructions to add new years
  - Template provided in source for easy extension
  - Created utility file: src/utils/eclipseCalculator.js
- Location search with type-ahead autocomplete (2026-01-06)
  - **Search by location name**: Users can type city names (e.g., "Paris, France") to find locations
  - **Debounced autocomplete dropdown**: 300ms delay after typing to prevent excessive API calls
  - **OpenStreetMap Nominatim API**: Free geocoding service for location search
  - **Deduplication algorithm**: Removes duplicate results using compound key (name + coordinates)
    - Groups by first 2 parts of location name (e.g., "Paris, Île-de-France")
    - Rounds coordinates to 1 decimal place for fuzzy matching
    - Prevents showing "Paris, France" multiple times from different result sets
  - **Auto-complete features**:
    - Shows up to 5 unique suggestions as user types
    - Minimum 2 characters to trigger search
    - Click outside to close dropdown
    - Selection auto-fills latitude/longitude fields
    - Formats display names as "City, Region/Country"
  - **Three distinct buttons**:
    - "Use This Location" (blue): Applies filled coordinates and updates clock
    - "Auto Detect" (purple): Uses browser geolocation API and applies immediately
    - Both buttons properly labeled to clarify their different purposes
  - Implementation: LocationInput.jsx with useRef for timeout and dropdown management
- Timezone handling for remote locations (2026-01-06)
  - **Problem**: JavaScript Date objects don't carry timezone information
  - **Core challenge**: When selecting Paris, France, need to show Paris local time (not user's PST)
  - **Solution**: Longitude-based timezone approximation (15° longitude = 1 hour offset)
  - **Day/Night gradient fix** (AlmanacClock.jsx):
    - Calculate timezone offset from longitude: `timezoneOffsetHours = location.longitude / 15`
    - Convert UTC hours to target location's local hours
    - Normalize to 0-24 range with proper wrapping
    - Calculate rotation angle based on local time at target location
    - Update all sun event angles (sunrise, sunset, dawn, dusk, etc.) using same conversion
    - Gradient now accurately reflects time of day at selected location
  - **Time display fix** (SunTimes.jsx):
    - Create `toLocalTime()` helper that adds timezone offset to UTC time
    - Bypass date-fns `format()` function (which auto-applies browser timezone)
    - Manual time formatting: extract UTC hours/minutes from adjusted date
    - Convert to 12-hour format with AM/PM
    - Sunrise/sunset times now display in target location's timezone
  - **Architectural decision**: Use longitude approximation instead of full timezone library
    - Keeps app lightweight with no external timezone dependencies
    - Generally accurate for visualization purposes
    - Trade-off: Doesn't account for DST or political timezone boundaries
    - Good enough for natural phenomena display (sun/moon cycles)
- Location persistence across sessions (2026-01-06)
  - **localStorage integration**: User's selected location saved automatically
  - **State initialization**: Load location from localStorage on App mount
  - **Auto-save**: Save to localStorage whenever location changes
  - **Smart geolocation**: Skip browser geolocation if saved location exists
  - **User experience**: Selected location persists across page refreshes
  - **Storage key**: 'userLocation' contains {latitude, longitude, name}
  - Implementation: App.jsx with useState initializer and useEffect for persistence
- Location search bug fixes (2026-01-06)
  - **Bug 1: "Gradient went bananas"**
    - Symptom: Harsh color transitions, chaotic gradient when switching to Paris
    - Root cause: Sun times in UTC but `.getHours()` converted to PST, causing wrong gradient angles
    - Failed fix: Switched everything to UTC, broke gradient for local viewing
    - Final fix: Keep local time display, calculate timezone offset from longitude
  - **Bug 2: Location not persisting**
    - Symptom: Refresh reverted location back to Renton instead of staying on Paris
    - Root cause: No localStorage persistence for location state
    - Fix: Initialize state from localStorage, save on every location change
  - **Bug 3: Duplicate autocomplete suggestions**
    - Symptom: Multiple identical "Paris, France" entries in dropdown
    - First fix: Deduplicate by coordinates (2 decimals) - removed one duplicate
    - Still seeing duplicates after first fix
    - Final fix: Compound deduplication key using both name AND coordinates
    - Key format: `"${nameParts}|${coordKey}"` where coordinates rounded to 1 decimal
  - **Bug 4: Times still showing PST**
    - Symptom: Gradient fixed but sunrise/sunset times still in PST not Paris time
    - Root cause: date-fns `format()` automatically applies browser's timezone
    - Fix: Bypass date-fns, manually extract UTC hours/minutes from adjusted date
    - Format time manually without any timezone library interference
- Responsive scaling refinement (2026-01-06)
  - **Problem**: max-w-6xl on parent container limited width, clock didn't scale with window
  - **Problem 2**: Clock used min(95vw, calc(100vh - 200px), 2400px) causing async scaling
    - When shrinking width, if height was still large, clock stayed big based on height
    - Side panels scaled with viewport width (18vw) but clock didn't, causing overlap
  - **Problem 3**: Even at full size, bottom of clock was cut off
  - **Solution**: Synchronized scaling across all elements
    - Removed max-w-6xl parent container limit
    - Changed clock size to min(85vw, 70vh, 1000px) - both width and height scale together
    - Reduced side panels from 18vw to 15vw with fixed width instead of max/min
    - Scaled down all panel fonts proportionally (emoji 3vw, headers 1.5vw, text 1vw)
    - Added hidden md:block to panels - hide on screens below 768px to prevent overlap
    - Reduced max clock size to 1000px (from 2400px) for better fit
    - Used 70vh instead of 90vh to account for header and margins
  - **Result**: Everything now scales smoothly and proportionally together
    - Clock and panels shrink at same rate when resizing window
    - No overlapping at any viewport size
    - Clock fully visible from top to bottom
    - Panels gracefully hide on smaller screens
- iOS native aesthetic implementation (2026-01-06)
  - **Goal**: Transform app to feel like a native iOS app while preserving astronomy/nature theme
  - **Typography**: SF Pro font stack (-apple-system, BlinkMacSystemFont, system-ui)
    - Antialiased rendering for crisp text
    - Proper weight hierarchy (600 semibold, 500 medium, 400 regular)
  - **Glassmorphism** (iOS signature look):
    - Heavy backdrop blur (20-40px saturation 180%)
    - Semi-transparent backgrounds (rgba 0.72-0.85 opacity)
    - Subtle borders (0.5px white at 10-15% opacity)
    - Breathing animation (8s subtle opacity pulse 100%→95%→100%)
  - **iOS Color System**:
    - System Blue: rgba(10, 132, 255, 0.8) for primary actions
    - System Purple: rgba(88, 86, 214, 0.8) for secondary actions
    - System Red: rgba(255, 69, 58, 1) for destructive actions
    - System Gray: rgba(142, 142, 147, 0.6) for cancel/neutral
    - Deep space gradient: black → dark blue → indigo
  - **Component Styling**:
    - All panels use .ios-glass or .ios-glass-thick classes
    - 12-24px border radius on all UI elements
    - 14px button radius, 600 weight text
    - Hover: opacity transitions instead of color changes
    - Shadows: soft layered (0 8px 32px rgba(0,0,0,0.3))
  - **UI Polish**:
    - Removed "Location:" label - just shows location name
    - Removed "Farmer's Almanac Clock" title for cleaner look
    - Increased clock size from 70vh to 85vh (more space available)
    - Container now uses full 100vh instead of calc(100vh - 100px)
    - Glowing clock rings instead of harsh borders
    - Sun/moon emoji glows (drop-shadow filters)
  - **Files Modified**:
    - src/index.css: Font stack, glass utilities, smooth transitions
    - src/App.jsx: Removed title, updated location display
    - src/components/SunTimes.jsx: iOS glass panels, glow effects
    - src/components/LocationInput.jsx: iOS input styling, buttons
    - src/components/EventManager.jsx: iOS modal, buttons, inputs
    - src/components/AlmanacClock.jsx: Glowing clock ring
    - src/components/MoonPhaseClock.jsx: Glowing clock ring, glass center
    - src/components/AnnualEventsClock.jsx: Glowing clock ring, glass center
- Cosmic background enhancements (2026-01-06)
  - **Animated Aurora Background**:
    - Slowly shifting gradient (60s cycle)
    - Colors: black → deep blue → indigo → purple
    - 400% background size with position animation
    - Subtle, non-distracting movement
  - **Grain Texture Overlay**:
    - 3% opacity SVG noise filter
    - Adds organic film-like quality
    - Fixed position, full screen coverage
  - **Twinkling Starfield** (24 stars total):
    - Two layers with different twinkle speeds (8s and 12s)
    - Star sizes: 2-3px with varying opacities (0.7-1.0)
    - Radial gradient points scattered across screen
    - Opacity animation: 0.5 → 1.0 → 0.5
    - Z-index: 1 (in front of nebulas)
  - **Nebula Clouds** (fills negative space):
    - Purple nebula (top left, 40vw x 40vh)
    - Blue nebula (top right, 35vw x 35vh)
    - Teal nebula (bottom left, 45vw x 45vh)
    - Pink nebula (bottom right, 38vw x 38vh)
    - Cosmic dust (center, 60vw x 60vh)
    - Heavy blur (60-100px) for dreamy effect
    - Slow drift animations (100-150s cycles)
    - Opacity 0.6-0.9 for visible but not distracting
    - Z-index: 0 (behind stars)
  - **Shooting Stars**:
    - Random appearance every ~30 seconds
    - 1.5s animation with fade out
    - Realistic tail trailing behind (100px gradient)
    - 30-60 degree angles across screen
    - White glow with double box-shadow
    - Delightful surprise moments
  - **Implementation**:
    - New component: src/components/CosmicBackground.jsx
    - CSS animations in src/index.css
    - Z-index layering: grain → aurora → nebulas (0) → stars (1) → clock (10+)
  - **Result**: Rich cosmic atmosphere that fills negative space around clock
    - Stars add life and depth
    - Nebulas create colorful ambient glow
    - Shooting stars provide occasional delight
    - Nothing distracts from clock itself
- Clock border rendering fix (2026-01-07)
  - **Problem**: Visible sliver artifacts appearing along the edge of rotating clock discs
    - Thin line of incorrect color visible on both day/night and lunar clocks
    - Sliver had no depth - appeared only at the circular edge
    - Initially suspected conic gradient wrapping issues at 360°/0° transition
  - **Root cause**: 1px solid border in .clock-glow class interacting with rotating gradient
    - Border rendered on top of animated gradient background
    - Created visual artifacts as gradient colors rotated underneath static border
    - Anti-aliasing between circular border and rotating gradient caused color bleeding
  - **Solution**: Removed border from .clock-glow class in src/index.css
    - Kept box-shadow glow effects (outer and inset) for visual depth
    - Border was aesthetic only, not functionally necessary
    - Slivers disappeared immediately after border removal
  - **Files modified**: src/index.css (line 286-287)
  - **Lesson**: Edge rendering artifacts with rotating elements often caused by layered borders/shadows, not the underlying gradient logic

## Celestial Events & Event Type System (2026-01-07)

### Overview
Expanded the annual events system to properly categorize and display astronomical events alongside personal events, with educational content and improved visual hierarchy.

### Event Type System
- **Type field added** to all events with automatic migration
  - `personal`: Birthdays, holidays, cultural events (circles on outer ring)
  - `celestial`: Solstices, equinoxes, perihelion, aphelion (diamonds on inner ring)
  - `meteor-shower`: Annual meteor showers (shooting stars on inner ring)
  - `solar-eclipse` / `lunar-eclipse`: Eclipse events (star-burst/crescent icons)

### New Default Events
Added 11 celestial events that appear for all users:
- **Meteor Showers**: Quadrantids (Jan 3), Lyrids (Apr 22), Eta Aquarids (May 6), Perseids (Aug 12), Orionids (Oct 21), Leonids (Nov 17), Geminids (Dec 13)
- **Earth's Orbit**: Perihelion (Jan 3 - closest to Sun), Aphelion (Jul 4 - farthest from Sun)
- **Solstices & Equinoxes**: Now properly categorized as `celestial` type

### Visual Improvements
1. **Two-ring layout** for better organization:
   - Personal events: Outer ring at radius 410px
   - Celestial events: Inner ring at radius 285px (closer to lunar clock)
   - Reduces visual clutter and separates event categories

2. **Meteor shower icons**:
   - Shooting star design with radially-oriented tails
   - Tails point inward toward Earth (meteors falling from space)
   - Sparkles on star head for visual interest
   - Positioned on inner ring with other celestial events

3. **Improved click detection**:
   - Transparent circular clickable areas around each event icon
   - Prevents overlapping click regions
   - Visual elements styled with `pointerEvents: 'none'`

### Multi-Event Modal System
- **Problem**: Multiple events on same date (e.g., Perihelion + Quadrantids on Jan 3)
- **Solution**: Clicking any event shows ALL events for that date
  - Modal header shows date and event count
  - Each event displayed as separate card
  - Scrollable list for dates with many events
  - Includes educational descriptions for celestial events
- **UX benefit**: No need to avoid overlapping dates; embraces the richness of concurrent events

### Educational Content
Added descriptions for celestial events:
- **Perihelion**: Explains Earth's closest approach to Sun, why distance doesn't determine seasons
- **Aphelion**: Earth's farthest point, emphasizes axial tilt importance
- **Meteor Showers**: Describes debris streams, best viewing times after midnight

### Migration Strategy
- Automatic localStorage migration on page load
- Infers event types from names for backwards compatibility
- Merges new celestial events without removing user's personal events
- Migration preserves all user data while adding new default events

### Files Modified
- `src/App.jsx`: Default events with types, migration logic
- `src/components/EventManager.jsx`: Event type selector in UI
- `src/components/AnnualEventsClock.jsx`:
  - Two-ring layout with different radii
  - Meteor shower rendering with radial orientation
  - Multi-event modal system
  - Click detection improvements
  - Educational descriptions

### Technical Details
- Meteor tail calculation uses `Math.atan2()` to compute radial angle from center
- Head positioned slightly toward center, tail extends outward
- Sparkles oriented along radial and perpendicular axes
- IIFE pattern used in JSX to calculate positions before rendering

## Mobile UX Improvements (2026-01-07)

### Clickable Sun & Moon Modals
- **Problem**: Limited space on mobile cards meant less information visible
- **Solution**: Made sun and moon cards tappable to reveal detailed modals

**Sun Modal Features:**
- Sunrise/sunset times (highlighted with color)
- Day length prominently displayed
- Solar noon, dawn, dusk (civil)
- Nautical dawn/dusk times
- Astronomical night begin/end times
- Scrollable content for smaller screens

**Moon Modal Features:**
- Large illumination percentage display
- Lunar cycle progress bar (visual % through cycle)
- Moonrise/moonset times
- Current altitude and azimuth
- Approximate distance from Earth (~384,400 km)
- Scrollable content

**Implementation:**
- iOS-style glass morphism design
- Portal-based modals (createPortal to body)
- Touch-friendly close button
- Tap outside modal to dismiss
- Mobile-only (md:hidden media query)
- Cards show pointer cursor to indicate clickability

### Mobile Clock Border
- **Problem**: Clock boundaries somewhat lost against cosmic background on mobile
- **Solution**: Added subtle border and multi-layer glow effect for mobile screens only

**Visual Treatment (mobile only):**
- 2px circular border (semi-transparent slate)
- Multi-layer outer glow (40px and 80px radius)
- Subtle inset shadow for depth perception
- Applied only on screens ≤768px width
- Doesn't affect desktop aesthetic

**Benefits:**
- Clearly defines clock edge without being harsh
- Soft halo effect separates clock from background
- Maintains cosmic atmosphere while improving clarity
- No impact on desktop/tablet experience

**Files Modified:**
- `src/components/SunTimes.jsx`: Modal state, click handlers, modal rendering
- `src/App.jsx`: Added mobile-clock-border class to clock container
- `src/index.css`: Mobile-specific border and glow styles with media query

## Interactive Lunar Disc (2026-01-08)

### Clickable Phase Markers & Ring Segments
- **Goal**: Make the lunar disc educational and interactive
- **Solution**: Added click handlers for both phase markers and ring segments

**Phase Marker Interactivity:**
- Each of the four principal phases (New Moon, First Quarter, Full Moon, Last Quarter) is clickable
- Clicking a phase marker shows detailed educational content:
  - Description of the phase's astronomical characteristics
  - Timing in the lunar cycle (when it occurs)
  - Visibility information (when to see it in the sky)
  - Astronomical facts (Sun-Earth-Moon angles, eclipse conditions, terminator visibility)
  - Cultural significance (traditions and meanings)
- Each marker has transparent hit area (radius + 8px) for easier clicking
- Markers prevent event propagation to avoid triggering ring clicks

**Ring Segment Interactivity:**
- Ring divided into 8 phase segments based on click position
- Clicking different parts of the ring shows info for that phase:
  - New Moon area (top): 0° - New Moon info
  - Waxing Crescent (top-left): ~15-80° counter-clockwise
  - First Quarter (left): 90° - First Quarter info
  - Waxing Gibbous (bottom-left): ~100-170° counter-clockwise
  - Full Moon (bottom): 180° - Full Moon info
  - Waning Gibbous (bottom-right): ~190-260° counter-clockwise
  - Last Quarter (right): 270° - Last Quarter info
  - Waning Crescent (top-right): ~280-345° counter-clockwise
- Click position is calculated accounting for disc rotation
- Formula: `clickPhase = ((360 - clickAngle) % 360) / 360` to match counter-clockwise phase progression

**Center Area Reserved:**
- Day/night clock center (inner 70% of disc) is non-interactive
- Ring uses SVG path with donut shape (outer ring only)
- Center left completely free for future day/night click handlers
- No pointer events blocking the AlmanacClock component underneath

**Modal Content:**
- **Principal phases** (clicked via marker or ring): Detailed educational content with 6 sections
- **Intermediate phases** (clicked via ring): General description with typical illumination
- **Current phase** indicator shows actual live data
- **Non-current phases** show "Typical Illumination" with approximate percentages
- Cycle progress bar only displays when viewing current phase
- Appropriate emoji for each phase (🌑 🌒 🌓 🌔 🌕 🌖 🌗 🌘)

### Rotation Logic Fix
- **Issue**: Phases appeared in wrong order (waxing/waning flipped)
- **Root cause**: Original clockwise rotation was correct, but phase marker positions needed adjustment
- **Solution**: Changed phase marker angles to match counter-clockwise time progression:
  - New Moon: 0° (top)
  - First Quarter: 270° (left) - was 90°
  - Full Moon: 180° (bottom)
  - Last Quarter: 90° (right) - was 270°
- Rotation formula: `setRotation(currentAngle)` where currentAngle = phase * 360
- Comment clarifies: "Positive rotation = clockwise, so past phases move to the right"
- Future phases appear counter-clockwise (to the left), past phases clockwise (to the right)

**Technical Implementation:**
- SVG `<path>` creates ring shape (donut) from 175px to 250px radius
- Path syntax: Two circles with even-odd fill rule creates hole in center
- Click handler calculates SVG coordinates from browser mouse position
- `Math.atan2(dy, dx)` computes angle from center
- Angle adjusted for rotation: `phaseAngle = (angle - rotation + 360) % 360`
- Phase lookup uses thresholds matching gradient boundaries

**Files Modified:**
- `src/components/MoonPhaseClock.jsx`:
  - Added `selectedPhaseMarker` and `displayPhaseName` state
  - `handleRingClick(e, clickAngle)` - determines clicked phase segment
  - `handlePhaseMarkerClick(e, phaseName)` - handles marker clicks
  - `getPhaseMarkerInfo(phaseName)` - returns detailed phase data
  - Clickable SVG groups for each phase marker with pointer events
  - SVG ring path with click calculation and rotation compensation
  - Modal renders different content based on selectedPhaseMarker vs displayPhaseName
  - Fixed phase marker angles (270° for First Quarter, 90° for Last Quarter)
  - Fixed click-to-phase calculation for counter-clockwise progression
