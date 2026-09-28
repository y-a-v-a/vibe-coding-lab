# Morse DJ

Paste any text and transmit it as Morse code, turning language into a stream of tones. Pitch, speed, waveform, and up to four harmonized voices can be adjusted while it plays, so a plain signal becomes a small composition. The interface borrows the loud, flat, shifting color schemes of Pop art silkscreens.

## Artistic inspiration

Morse code, developed by Samuel Morse and Alfred Vail in the late 1830s and 1840s, reduces writing to a rhythm of short and long pulses. Stripped of meaning for anyone who can't decode it, it becomes pure rhythm and pitch, a quality artists and musicians have long used. Kraftwerk wove Morse into *Radio-Activity* (1975), and Katie Paterson's *Earth–Moon–Earth* (2007) translated Beethoven's *Moonlight Sonata* into Morse, bounced it off the Moon, and played back what returned, gaps and all.

Morse DJ treats the code the same way: as a score. Any text becomes a rhythm, and stacking voices at musical intervals (thirds, fourths, fifths, octaves) turns a single beep into chords.

The four palettes nod to Andy Warhol's silkscreens, where the same image is repeated in different high-contrast color combinations.

## Controls

| Input | Action |
|---|---|
| Transmit / Stop button, or Space | Start or stop the transmission |
| R | Restart from the beginning |
| Edit Text | Show the text field to paste your own text |
| Pitch | Base frequency, 100–2000 Hz |
| Speed | 3–40 words per minute |
| Volume | Master volume |
| Waveform | Sine, square, sawtooth, or triangle |
| + Add Voice | Up to four voices, each with its own interval and volume; click a voice's number to mute it |
| Shift Palette, or P | Cycle the color palette |
| H | Hide or show the controls |

Pitch, speed, waveform, volume, and voice changes take effect on the next character, even mid-transmission.

## Technical details

- Single-file HTML, CSS, and vanilla JavaScript with no dependencies
- Sound is synthesized with the Web Audio API: each dot or dash starts one oscillator per active voice, mixed through per-voice and master gain nodes
- Timing follows the standard "PARIS" convention, where one unit lasts `1.2 / WPM` seconds; a dot is 1 unit, a dash 3, with 1 unit between symbols and 3 between characters. Word gaps are a little longer than standard (10 units instead of 7)
- Tones are scheduled on the audio clock one character ahead, so the display stays in sync with what you hear
- Characters without a Morse equivalent (such as line breaks) are skipped
- Palettes are applied through CSS custom properties

The piece was first built as a React component; `morse-dj.tsx` is that original source, kept for reference. `index.html` is a dependency-free port of it.

Vincent Bruijn <vebruijn@gmail.com> • [y-a-v-a.org](https://www.y-a-v-a.org) • 2026

(c) Vincent Bruijn 2026
