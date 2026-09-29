# Windows 95 Starfield

A tribute to the classic Windows "Starfield Simulation" screensaver: square pixel stars stream out of the center of a black screen as if you were flying through space. This version adds stars that pulse in size and brightness, plus live controls for density, speed, drift direction, color, and the pulse behavior.

## Inspiration

"Starfield Simulation" shipped with Windows 3.1 and stayed with Windows 95 and its successors, becoming one of the most recognizable images of 1990s personal computing. Screensavers originally existed to prevent phosphor burn-in on CRT monitors, but by the mid-90s they had become a small, ambient art form of their own: generative, endlessly looping, and seen by millions of people on idle office desks. The original offered just two settings, warp speed and starfield density.

The pulsating stars add a slow, breathing rhythm on top of the steady forward motion, shifting the piece from a simulation of travel toward something more contemplative.

## Controls

| Control | Effect |
|---|---|
| Stars | Number of stars, 50–1000 (regenerates the field) |
| Speed | Forward speed, 1–20 |
| X Angle / Y Angle | Sideways and vertical drift, making the field stream off-center |
| Pixel Size | Base size of each star, 1–4 |
| Star Color | Color of all stars |
| Pulsing Stars % | Share of stars that pulse |
| Pulse Intensity | How much pulsing stars grow at their peak |
| Pulse Speed | Overall pulse tempo |
| H, or the toggle button | Hide or show the controls |

## Technical details

- Single-file HTML, CSS, and vanilla JavaScript with a full-window Canvas
- Each star has an `x`, `y`, `z` position; it is projected to the screen by dividing by `z` (`screenX = x / z × width + width / 2`), so stars accelerate and grow as `z` approaches zero, giving the classic perspective rush
- Stars that pass the viewer or drift out of bounds are reset to the far plane at a new random position
- Pulsing stars follow a sine wave with a random phase and rate per star, modulating both brightness (30–100%) and size
- Stars are drawn as filled squares rather than circles, keeping the blocky look of the original
- Animation runs on `requestAnimationFrame`; pulse time advances a fixed step per frame

Vincent Bruijn <vebruijn@gmail.com> • [y-a-v-a.org](https://www.y-a-v-a.org) • 2026

(c) Vincent Bruijn 2026
