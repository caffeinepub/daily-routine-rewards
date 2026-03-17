# DISTRESSO

## Current State
FitnessTab has a GPS tracker that draws the user's path on an HTML `<canvas>` element with a plain colored background. No real map tiles are shown.

## Requested Changes (Diff)

### Add
- Real satellite map in the GPS section using Leaflet.js with Esri World Imagery satellite tiles (free, no API key)
- Live user location marker (blue dot) that updates as GPS moves
- Route polyline drawn on top of the satellite tiles
- Start (green) and end (red/gold) markers on the route

### Modify
- Replace the `<canvas>` element with a Leaflet map container
- Map auto-centers on the user's current position when tracking starts
- Map follows the user in real-time while tracking is active

### Remove
- Canvas-based path drawing code

## Implementation Plan
1. Install `leaflet` and `@types/leaflet` npm packages
2. Import Leaflet CSS in the component
3. Create a `SatelliteMap` sub-component using `useEffect` to initialize Leaflet map with Esri World Imagery tile layer (`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`)
4. When waypoints update, draw/update polyline and markers on the map
5. Auto-pan map to latest waypoint while tracking is active
6. Preserve all existing step counter, calorie, and GPS tracking logic
