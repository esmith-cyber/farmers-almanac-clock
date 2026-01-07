# Farmer's Almanac Clock

A beautiful, interactive astronomical clock visualizing the annual cycle, moon phases, day/night cycles, and zodiac constellations with iOS-native aesthetic design.

## Features

### 🌍 Multi-Layer Clock System
- **Annual Events Clock** - Outer ring showing the full year cycle with zodiac constellations
- **Moon Phase Clock** - Middle ring displaying lunar phases with visual representations
- **Day/Night Clock** - Inner clock showing sunrise, sunset, and twilight periods
- All layers rotate independently and synchronously with time

### 🎯 Event Management
- Add personal events (birthdays, anniversaries, etc.) with custom colors
- **Multi-day events** - Create events spanning date ranges (vacations, festivals)
  - Rendered as arcs spanning the date range
  - Visual start/end markers
  - "Today" detection highlights events currently active
  - Automatic year-boundary handling (e.g., Dec 20 - Jan 5)
- Automated celestial events (solar/lunar eclipses, solstices, equinoxes)
- Distinct visual markers for different event types

### ⭐ Zodiac Constellations
- Interactive constellation displays for all 12 zodiac signs
- Precise wedge-shaped hover areas for easy tooltip access
- Shows sign date ranges and current zodiac sign
- Constellations rotate with the annual cycle

### 🌙 Astronomical Data
- Real-time moon phase calculations using SunCalc
- Accurate sun times (sunrise, sunset, twilight periods)
- Location-based calculations
- Visual moon phase representations with detailed textures

### 📍 Location Features
- Search locations worldwide with autocomplete
- Automatic timezone detection
- Geolocation support for current position
- All astronomical calculations adjust to selected location

### 🎨 Design
- iOS-native glass morphism aesthetic
- Cosmic starfield background (160+ stars with random distribution)
- Smooth animations and transitions
- Responsive design adapting to all screen sizes
- Dark theme optimized for visibility

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **SunCalc** - Astronomical calculations
- **SVG** - Vector graphics for clocks and visualizations

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development
The app runs on `http://localhost:5173` with hot module replacement (HMR) enabled.

## Architecture

### Component Structure
```
src/
├── components/
│   ├── AnnualEventsClock.jsx    # Outer ring - annual cycle & events
│   ├── MoonPhaseClock.jsx       # Middle ring - lunar phases
│   ├── AlmanacClock.jsx         # Inner ring - day/night cycle
│   ├── EventManager.jsx         # Event creation/editing UI
│   ├── LocationInput.jsx        # Location search & selection
│   └── SunTimes.jsx             # Sun/moon time displays
├── App.jsx                      # Main app container
└── index.css                    # Global styles & starfield
```

### Key Design Decisions

**Constants & Magic Numbers**
All layout dimensions are extracted to named constants:
- `SVG_CENTER = 450` - Center point of all clocks
- `EVENT_RADIUS = 410` - Radius for event markers
- `CONSTELLATION_RADIUS = 340` - Radius for zodiac constellations
- Improves maintainability and makes adjustments easier

**Performance Optimizations**
- Month names array extracted outside render loops
- Explicit null checks instead of truthy-based
- Eliminated redundant calculations in multi-day events

**Date Handling**
- Dynamic year calculation (not hardcoded)
- Proper validation for date ranges
- Year-boundary crossing logic for multi-day events

**ID Generation**
- `Date.now() + Math.random()` prevents collisions
- Handles rapid event creation without duplicate IDs

## Recent Updates

### Multi-Day Event Support (2026-01-07)
- Added checkbox toggle for multi-day events
- Arc rendering spanning date ranges
- Enhanced validation ensuring end date comes after start
- Year-crossing event support

### Code Quality Refactor (2026-01-07)
- Extracted 40+ magic numbers to named constants
- Added radix to all parseInt() calls
- Fixed performance issues with array creation in render loops
- Enhanced validation and error messages

### Zodiac & Visual Improvements (2026-01-06)
- Wedge-shaped hover areas for zodiac signs
- Fixed Capricorn year-boundary positioning
- Regenerated starfield with true random distribution
- Enhanced celestial event icons with glows and shadows
- Removed spiral galaxy, increased star density

### iOS Native Aesthetic (2026-01-06)
- Glass morphism design system
- Cosmic starfield background
- Improved responsive scaling

## Contributing

This project was collaboratively developed with Claude Code (Claude Sonnet 4.5).

## License

MIT License - See LICENSE file for details
