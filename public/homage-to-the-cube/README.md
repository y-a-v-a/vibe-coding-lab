# Homage to the Cube

Four nested, translucent cubes slowly turn in space, their colors overlapping and shifting as the viewing angle changes. Twelve palettes, each named after a pigment or mood, can be cycled through as a series of "studies."

## Artistic inspiration

The piece takes its cue from Josef Albers' *Homage to the Square*, a series he began in 1950 and continued until his death in 1976, producing more than a thousand paintings and prints. Each work consists of three or four nested squares, set slightly below center, in carefully chosen flat colors. The format stayed fixed so that color itself could become the subject: how one hue changes character depending on its neighbors, how flat planes appear to advance or recede.

Albers codified these observations in *Interaction of Color* (1963), arguing that color is "the most relative medium in art" and is almost never perceived as it physically is.

*Homage to the Cube* moves that experiment into three dimensions. Instead of fixed adjacent planes, the nested cubes are semi-transparent, so the colors are mixed optically by overlap, and every rotation produces a new set of relationships. The outermost cube is the most opaque and the innermost the most transparent, echoing the way Albers' inner squares often seem to glow from within.

## Controls

| Input | Action |
|---|---|
| Drag (mouse or touch) | Rotate the cubes |
| Click / tap | Next palette |
| Space / Right arrow | Next palette |
| Left arrow | Previous palette |
| H | Hide or show the title and palette bar |
| R | Reset rotation and return to Study I |

After a drag, the cubes resume their slow auto-rotation after about three seconds of inactivity.

## Technical details

- Pure HTML, CSS, and vanilla JavaScript, no dependencies or canvas
- Cubes are built from six `div` faces each, positioned with CSS 3D transforms (`preserve-3d`, `rotateX/Y`, `translateZ`)
- Cube sizes scale with the viewport (outer cube at 55% of the smaller viewport dimension, inner cubes at 74%, 52%, and 34% of that)
- Each palette defines a background plus four colors, applied as `rgba` with decreasing opacity from outer to inner cube
- Palette changes crossfade over 1.8 seconds via CSS transitions
- Rotation is driven by a `requestAnimationFrame` loop; short clicks (under 200 ms) are distinguished from drags
- Uses the DM Mono typeface when installed locally, falling back to the system monospace font

## Palettes

Dusk, Ochre Field, Viridian, Cadmium, Cerulean, Sienna, Ash, Saffron, Mauve, Terre Verte, Rose, Ivory Black.

Vincent Bruijn <vebruijn@gmail.com> • [y-a-v-a.org](https://www.y-a-v-a.org) • 2026
