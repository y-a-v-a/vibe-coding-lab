# Glossolalia

A screen-filling grid of characters drawn at random from dozens of Unicode scripts and symbol sets. Each glyph flares up, fades out, and sounds a short tone whose pitch is derived from its codepoint. The result is a continuous, unreadable, audible "speech" made from the world's writing systems.

## Artistic inspiration

*Glossolalia* ("speaking in tongues," from the Greek *glōssa*, tongue, and *lalein*, to talk) names fluent-sounding speech that carries no semantic content. It is best known from religious practice, from the Pentecost account in Acts 2 to modern charismatic worship, and has been studied by linguists such as William Samarin, who described it as sound that resembles language without being one.

The idea has a parallel history in the avant-garde. Hugo Ball performed his sound poem *Karawane* at the Cabaret Voltaire in 1916, and Kurt Schwitters spent a decade on his *Ursonate* (1922–1932): both treated the phonetic surface of language as material in its own right, freed from meaning.

This piece applies the same move to writing. Latin, Cyrillic, Devanagari, Hangul, Cherokee, Braille, box-drawing characters, musical notation, and emoji all appear side by side at equal weight, each reduced to shape, color, and a pitch. Nothing can be read; everything looks like it could be.

## Controls

The HUD in the lower left appears on any change and fades after five seconds.

| Key | Action |
|---|---|
| Up / Down arrow | Faster / slower (tick interval 10–500 ms) |
| Left / Right arrow | Narrower / wider pitch range (×0.1–×4.0) |
| + / - | Denser grid (smaller glyphs) / sparser grid (larger glyphs) |
| D | Cycle decay time (1–8 s) |
| W | Cycle waveform: sine, square, sawtooth, triangle |
| C | Cycle color mode: random, monochrome, hue-drift, fire, ice |
| M | Mute / unmute |
| Space | Pause / resume |
| H | Hide / show the HUD |

Audio starts after the first click or key press, as browsers require a user gesture before playing sound.

## Technical details

- Vanilla HTML, CSS, and JavaScript with no dependencies
- The glyph pool is built from 42 curated Unicode ranges (6,413 codepoints), from Basic Latin up to the CJK Compatibility Ideographs Supplement
- The grid is a CSS Grid of `span` elements sized from the font size and viewport; it rebuilds on resize or size change
- Each tick places new glyphs in about 4% of the cells; a `requestAnimationFrame` loop fades every lit cell linearly over the decay time
- Sound uses the Web Audio API: every glyph triggers a short oscillator grain (30–110 ms) with an exponential envelope, routed through a master gain and a dynamics compressor to keep the texture from clipping
- Pitch is mapped linearly from codepoint (`80 Hz + cp / 0x10FFFF × 2000 Hz × range`), so at the default range the curated glyphs span roughly 80–430 Hz, with emoji and CJK ideographs sounding highest
- Glyph rendering depends on the fonts installed on the viewer's system; missing glyphs show as fallback boxes

Vincent Bruijn <vebruijn@gmail.com> • [y-a-v-a.org](https://www.y-a-v-a.org) • 2026

(c) Vincent Bruijn 2026
