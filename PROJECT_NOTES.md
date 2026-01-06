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
├── App.jsx (Main app with 3-layer clock display)
├── components/
│   ├── AlmanacClock.jsx (Day/Night - 350px, z-20, innermost)
│   ├── MoonPhaseClock.jsx (Lunar phases - 500px, z-10)
│   ├── AnnualEventsClock.jsx (Annual events + Zodiac - 900px, z-0, outermost)
│   ├── EventManager.jsx (Event CRUD interface)
│   ├── LocationInput.jsx (Location picker with validation)
│   └── SunTimes.jsx (Detailed sun event times display)
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

// Layered clock structure (z-index order):
// - AnnualEventsClock with Zodiac (z-0, outermost, 900px)
// - MoonPhaseClock (z-10, middle, 500px)
// - AlmanacClock (z-20, innermost, 350px)
// Container: minHeight: 900px
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
- **NOW is always at 12:00** - A fixed arrow indicator at the top of each disk marks the current moment
- The disk rotates beneath this fixed pointer
- You watch events approach from one side, pass through NOW, and recede on the other side

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

**Sizing Specifications:**
- Day/Night: 350px diameter (center disk, z-20)
- Lunar: 500px diameter (75px ring width, z-10)
- Annual Events + Zodiac: 900px diameter (200px ring width, z-0)
- Total display size: 900px

The annual ring is extra wide (200px) to accommodate both zodiac constellations and custom event markers with plenty of breathing room. Z-index values ensure proper layering with innermost disk on top.

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
- **Event markers:** Colored dots (6px radius) positioned at 410px radius (outer edge of ring)
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
- **Delete Event**: Click "Delete" with confirmation dialog
- **Color Options**: 8 preset colors (Blue, Pink, Green, Yellow, Orange, Purple, Red, Cyan)
- **Date Validation**: Ensures valid day for selected month
- **Sorted List**: Events displayed chronologically by date
- **Persistence**: All changes saved to localStorage automatically

**Event Manager UI:**
- Accessible via "+ Add Event" button above clock display
- Modal interface with dark theme (bg-slate-800)
- Form fields: Event name (text), Month (dropdown), Day (number), Color (color picker grid)
- Event list shows all events sorted by date with Edit/Delete actions
- Responsive design with max-height scrollable areas

**Integration:**
- Component: `src/components/AnnualEventsClock.jsx` (includes zodiac constellations)
- Event Manager: `src/components/EventManager.jsx`
- Props: `currentDate` (Date object), `onEventsChange` (callback)
- State management: Events stored in App.jsx and passed down
- Z-index: 0 (outermost layer)
- Storage: localStorage key 'annualEvents'
- SVG viewBox: 0 0 900 900 (matches component size)
- Center point: 450, 450
- No location dependency (events and zodiac based on date only)

## UI/UX Design Notes
- **Single NOW marker**: Only the outermost ring (Annual Events) displays the NOW indicator arrow at 12:00
- **No descriptive labels**: Clock labels removed for cleaner aesthetic (previously showed "Lunar Cycle (~29.5 days)", "Zodiac Cycle", etc.)
- **Minimal text**: Only essential information shown in center displays
- **UI controls repositioned**: Location display and event manager moved from center to corners (2026-01-06)
  - Location display: Fixed position top-left with semi-transparent background
  - Event manager: Fixed position top-right with semi-transparent background
  - Both use backdrop-blur effect and subtle styling to stay out of the way
  - Keeps clock display front and center without clutter

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
