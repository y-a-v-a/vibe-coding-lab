# Antipodal Map

An interactive Google Maps application that displays the antipodal point (opposite side of the Earth) for any location you click on the map.

## How it works

1. **Click anywhere on the map** to mark a location with a blue marker
2. **The antipodal point** is automatically calculated and marked with a red marker
3. **Antipodal coordinates** are computed by:
   - Inverting the latitude (multiply by -1)
   - Adjusting longitude by 180° (add/subtract 180°)

## Features

- **Interactive map** powered by Google Maps API
- **Dual markers** - blue for clicked location, red for antipodal point
- **Global coverage** - works anywhere on Earth
- **Real-time calculation** - instant antipodal point display

## What is an antipodal point?

An antipodal point is the location on Earth's surface that is diametrically opposite to a given point. If you could drill a straight line through the center of the Earth from any point, it would emerge at the antipodal point on the other side.

## Usage

Simply open the HTML file in a web browser and start clicking on the map to explore antipodal relationships around the globe.

## Technical details

- Built with vanilla JavaScript and Google Maps API
- Uses mathematical calculation: `antipodal_lat = -lat` and `antipodal_lng = lng ± 180°`
- Responsive design that fills the entire viewport

Vincent Bruijn <vebruijn@gmail.com> (c) 2025
Serein de Rijcke (c) 2025
