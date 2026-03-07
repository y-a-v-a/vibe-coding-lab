# Web Synth

A browser-based modular synthesizer built entirely with web technologies. No frameworks, no build tools — just the Web Audio API, Canvas-free SVG knobs, and vanilla JavaScript.

## Features

### Oscillators
- **Two oscillators** with selectable waveforms (saw, square, sine, triangle)
- Per-oscillator **detune**, **level**, and **octave** controls
- **White noise** generator with independent level control

### Filter
- Multimode filter: **lowpass**, **highpass**, **bandpass**, **notch**
- **Cutoff** frequency knob with logarithmic response
- **Resonance** control
- Dedicated **ADSR envelope** with adjustable envelope amount

### Amplifier
- Full **ADSR envelope** for amplitude shaping
- **Master volume** knob
- **Glide/portamento** between notes

### Effects
- **Delay** — time, feedback, and wet/dry mix
- **Reverb** — algorithmic convolution with size and damping controls
- **Distortion** — waveshaper drive with wet/dry mix

### LFO
- Low-frequency oscillator with **sine**, **triangle**, **square**, **sawtooth** waveforms
- **Rate** and **depth** knobs
- Routable to **filter cutoff**, **pitch**, or **amplitude**

### Keyboard
- On-screen piano keyboard (2 octaves) with mouse/touch interaction
- Computer keyboard mapping: `A`–`L` for white keys, `W`,`E`,`T`,`Y`,`U`,`O`,`P` for black keys
- `Z`/`X` to shift octave down/up
- Polyphonic — play chords freely

## Architecture

The project is split into four modules:

| File | Responsibility |
|------|---------------|
| `audio-engine.js` | Web Audio API graph: oscillators, filter, envelopes, LFO, effects chain |
| `ui-controls.js` | Custom SVG rotary knobs, slider initialization, drag interaction |
| `keyboard.js` | Piano keyboard rendering, mouse/touch/keyboard input |
| `app.js` | Wiring layer — maps UI parameters to engine, handles button groups |

All audio runs through a signal chain: **Oscillators → Filter → Amp Envelope → Distortion → Delay → Reverb → Master Gain → Output**.

## Controls

- **Knobs**: Click and drag up/down to adjust. Double-click to reset to default.
- **Sliders**: Vertical ADSR sliders — drag to set attack, decay, sustain, release.
- **Buttons**: Click waveform/filter/LFO buttons to select type.
- **Power**: Click POWER to initialize or stop the audio context.

## Usage

Open `index.html` in any modern browser. Press a key or click the keyboard to start making sound.

```bash
# Serve locally
python3 -m http.server 8000
# then open http://localhost:8000/web-synth/
```

## Technical Details

- **Zero dependencies** — pure HTML, CSS, and JavaScript
- **Web Audio API** for all sound generation and processing
- **SVG** rotary knobs with arc indicators rendered in JavaScript
- Algorithmic reverb impulse response generated at runtime
- Polyphonic voice architecture with per-voice filter and amp envelopes

## Attribution

Vincent Bruijn <vebruijn@gmail.com> • [y-a-v-a.org](https://www.y-a-v-a.org) • 2026
