# Binary Clock

A binary clock representation displaying the current time, date, and year as binary dots. Each row represents different time units converted to binary format.

## Display Format

- **Row 1**: Seconds (0-59)
- **Row 2**: Minutes (0-59) 
- **Row 3**: Hours (0-23)
- **Row 4**: Day of month (1-31)
- **Row 5**: Month (1-12)
- **Row 6**: Year (full year)

## Binary Representation

Each row shows an 11-bit binary representation with filled blue circles representing '1' bits and empty circles representing '0' bits. The rightmost circle represents 2^0 (1), the next represents 2^1 (2), and so on.

## Technical Implementation

Reimplemented from the original Processing sketch using:
- HTML5 Canvas for rendering
- Vanilla JavaScript for time calculation and binary conversion
- RequestAnimationFrame for smooth updates
- Responsive design with 90vmin canvas size

## Colors

- Background: Dark blue (#001e1e)
- Active bits: Blue (#0066ff)
- Inactive bits: Transparent with blue stroke

## Controls

The clock updates automatically every frame to show the current time in binary format.

---

Vincent Bruijn <vebruijn@gmail.com> • [y-a-v-a.org](https://www.y-a-v-a.org) • 2025