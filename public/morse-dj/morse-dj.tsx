import { useState, useRef, useCallback, useEffect } from "react";

const MORSE_MAP = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.",
  G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..",
  M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
  S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--..", "1": ".----", "2": "..---", "3": "...--",
  "4": "....-", "5": ".....", "6": "-....", "7": "--...", "8": "---..",
  "9": "----.", "0": "-----", ".": ".-.-.-", ",": "--..--",
  "?": "..--..", "'": ".----.", "!": "-.-.--", "/": "-..-.",
  "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...",
  ";": "-.-.-.", "=": "-...-", "+": ".-.-.", "-": "-....-",
  _: "..--.-", '"': ".-..-.", $: "...-..-", "@": ".--.-.",
  " ": " ",
};

const INTERVALS = [
  { name: "Unison", ratio: 1 },
  { name: "Min 3rd", ratio: 6 / 5 },
  { name: "Maj 3rd", ratio: 5 / 4 },
  { name: "4th", ratio: 4 / 3 },
  { name: "5th", ratio: 3 / 2 },
  { name: "Octave", ratio: 2 },
];

const WARHOL_PALETTES = [
  ["#FF1493", "#FFD700", "#00BFFF", "#FF4500"],
  ["#FF69B4", "#7FFF00", "#BA55D3", "#FF6347"],
  ["#00CED1", "#FF1493", "#FFD700", "#32CD32"],
  ["#FF4500", "#1E90FF", "#FFD700", "#FF69B4"],
];

const DEFAULT_TEXT = `Paste your text here.\n\nThe morse stream will play each character as tone — unknown characters are silently skipped. Adjust pitch, speed, and layer harmonic voices to create your own signal composition.`;

const WAVE_TYPES = ["sine", "square", "sawtooth", "triangle"];

export default function MorseDJ() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pitch, setPitch] = useState(600);
  const [wpm, setWpm] = useState(15);
  const [waveType, setWaveType] = useState("sine");
  const [voices, setVoices] = useState([{ on: true, interval: 0, vol: 0.5 }]);
  const [currentChar, setCurrentChar] = useState("");
  const [currentMorse, setCurrentMorse] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [paletteIdx, setPaletteIdx] = useState(0);
  const [showText, setShowText] = useState(false);
  const [gain, setGain] = useState(0.4);

  const ctxRef = useRef(null);
  const stopRef = useRef(false);
  const playingRef = useRef(false);

  const palette = WARHOL_PALETTES[paletteIdx % WARHOL_PALETTES.length];

  const unitDuration = useCallback(() => 1.2 / wpm, [wpm]);

  const playTone = useCallback(
    (ctx, duration, startTime) => {
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(gain, startTime);
      masterGain.gain.setValueAtTime(0, startTime + duration);
      masterGain.connect(ctx.destination);

      voices.forEach((v) => {
        if (!v.on) return;
        const osc = ctx.createOscillator();
        const vGain = ctx.createGain();
        osc.type = waveType;
        osc.frequency.setValueAtTime(
          pitch * INTERVALS[v.interval].ratio,
          startTime
        );
        vGain.gain.setValueAtTime(v.vol, startTime);
        osc.connect(vGain);
        vGain.connect(masterGain);
        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    },
    [voices, pitch, waveType, gain]
  );

  const playMorse = useCallback(async () => {
    if (playingRef.current) return;
    playingRef.current = true;
    stopRef.current = false;
    setIsPlaying(true);

    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    ctxRef.current = ctx;
    let time = ctx.currentTime + 0.05;
    const unit = unitDuration();

    for (let i = 0; i < text.length; i++) {
      if (stopRef.current) break;
      const ch = text[i].toUpperCase();
      const morse = MORSE_MAP[ch];

      if (!morse) continue;

      setCharIndex(i);
      setCurrentChar(ch === " " ? "␣" : ch);

      if (ch === " ") {
        setCurrentMorse("/");
        time += unit * 7;
      } else {
        setCurrentMorse(morse);
        for (let j = 0; j < morse.length; j++) {
          const sym = morse[j];
          const dur = sym === "." ? unit : unit * 3;
          playTone(ctx, dur, time);
          time += dur + unit;
        }
        time += unit * 2;
      }

      const waitUntil = time;
      while (ctx.currentTime < waitUntil - 0.05) {
        if (stopRef.current) break;
        await new Promise((r) => setTimeout(r, 30));
      }
    }

    setIsPlaying(false);
    playingRef.current = false;
    setCurrentChar("");
    setCurrentMorse("");
    ctx.close();
  }, [text, unitDuration, playTone]);

  const stop = useCallback(() => {
    stopRef.current = true;
    setIsPlaying(false);
    playingRef.current = false;
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
    }
  }, []);

  const addVoice = () => {
    if (voices.length < 4) {
      const nextInterval = voices.length === 1 ? 4 : voices.length === 2 ? 2 : 5;
      setVoices([...voices, { on: true, interval: nextInterval, vol: 0.3 }]);
    }
  };

  const removeVoice = (idx) => {
    if (voices.length > 1) setVoices(voices.filter((_, i) => i !== idx));
  };

  const updateVoice = (idx, key, val) => {
    const nv = [...voices];
    nv[idx] = { ...nv[idx], [key]: val };
    setVoices(nv);
  };

  const progress = text.length > 0 ? (charIndex / text.length) * 100 : 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1a1a1a",
        fontFamily: "'Courier New', monospace",
        color: "#fff",
        overflow: "auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: palette[0],
          padding: "24px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `6px solid ${palette[1]}`,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 42,
              fontWeight: 900,
              letterSpacing: -2,
              textTransform: "uppercase",
              color: "#000",
              textShadow: `3px 3px 0 ${palette[1]}`,
            }}
          >
            MORSE DJ
          </h1>
          <div
            style={{
              fontSize: 13,
              color: "#000",
              opacity: 0.7,
              marginTop: 2,
              fontWeight: 700,
            }}
          >
            SIGNAL AS ART • TEXT AS TONE
          </div>
        </div>
        <button
          onClick={() => setPaletteIdx((p) => p + 1)}
          style={{
            background: palette[2],
            border: `3px solid #000`,
            padding: "8px 16px",
            fontWeight: 900,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "inherit",
            textTransform: "uppercase",
          }}
        >
          Shift Palette
        </button>
      </div>

      {/* Big character display */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 16px",
          gap: 24,
          background: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 20px,
            ${palette[0]}11 20px,
            ${palette[0]}11 40px
          )`,
        }}
      >
        <div
          style={{
            width: 140,
            height: 140,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 80,
            fontWeight: 900,
            background: isPlaying ? palette[1] : "#333",
            color: isPlaying ? "#000" : "#555",
            border: `5px solid ${palette[0]}`,
            boxShadow: isPlaying
              ? `8px 8px 0 ${palette[2]}, -4px -4px 0 ${palette[3]}`
              : "none",
            transition: "all 0.1s",
          }}
        >
          {currentChar || "·"}
        </div>
        <div style={{ textAlign: "left" }}>
          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: 8,
              color: palette[2],
              minHeight: 44,
            }}
          >
            {currentMorse || "—"}
          </div>
          <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
            {isPlaying
              ? `TRANSMITTING ${charIndex + 1} / ${text.length}`
              : "IDLE"}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 6, background: "#333" }}>
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${palette[0]}, ${palette[1]}, ${palette[2]})`,
            transition: "width 0.1s",
          }}
        />
      </div>

      <div style={{ padding: "24px 32px", maxWidth: 900, margin: "0 auto" }}>
        {/* Transport */}
        <div
          style={{ display: "flex", gap: 12, marginBottom: 28 }}
        >
          <button
            onClick={isPlaying ? stop : playMorse}
            style={{
              flex: 1,
              padding: "14px 0",
              fontSize: 18,
              fontWeight: 900,
              fontFamily: "inherit",
              textTransform: "uppercase",
              letterSpacing: 3,
              cursor: "pointer",
              border: "4px solid #000",
              background: isPlaying ? palette[3] : palette[0],
              color: "#000",
              boxShadow: `4px 4px 0 ${palette[1]}`,
            }}
          >
            {isPlaying ? "■ STOP" : "▶ TRANSMIT"}
          </button>
          <button
            onClick={() => setShowText(!showText)}
            style={{
              padding: "14px 24px",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: "pointer",
              border: "4px solid #000",
              background: showText ? palette[2] : "#333",
              color: showText ? "#000" : "#aaa",
              textTransform: "uppercase",
            }}
          >
            {showText ? "Hide Text" : "Edit Text"}
          </button>
        </div>

        {/* Text input */}
        {showText && (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{
              width: "100%",
              height: 160,
              background: "#111",
              color: palette[1],
              border: `3px solid ${palette[0]}`,
              padding: 16,
              fontFamily: "inherit",
              fontSize: 14,
              resize: "vertical",
              marginBottom: 24,
              boxSizing: "border-box",
            }}
            placeholder="Paste your text here..."
          />
        )}

        {/* Controls grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            marginBottom: 28,
          }}
        >
          <SliderControl
            label="PITCH"
            value={pitch}
            min={100}
            max={2000}
            step={10}
            onChange={setPitch}
            display={`${pitch} Hz`}
            color={palette[0]}
            accent={palette[1]}
          />
          <SliderControl
            label="SPEED"
            value={wpm}
            min={3}
            max={40}
            step={1}
            onChange={setWpm}
            display={`${wpm} WPM`}
            color={palette[2]}
            accent={palette[3]}
          />
          <SliderControl
            label="VOLUME"
            value={gain}
            min={0}
            max={1}
            step={0.01}
            onChange={setGain}
            display={`${Math.round(gain * 100)}%`}
            color={palette[3]}
            accent={palette[0]}
          />
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 900,
                marginBottom: 8,
                color: palette[1],
                letterSpacing: 2,
              }}
            >
              WAVEFORM
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {WAVE_TYPES.map((w) => (
                <button
                  key={w}
                  onClick={() => setWaveType(w)}
                  style={{
                    flex: 1,
                    padding: "8px 4px",
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: "inherit",
                    cursor: "pointer",
                    border: `2px solid ${waveType === w ? palette[1] : "#444"}`,
                    background: waveType === w ? palette[1] : "#222",
                    color: waveType === w ? "#000" : "#888",
                    textTransform: "uppercase",
                  }}
                >
                  {w.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Voices / Harmonize section */}
        <div
          style={{
            border: `3px solid ${palette[2]}`,
            padding: 20,
            marginBottom: 24,
            background: "#111",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 900,
                letterSpacing: 3,
                color: palette[2],
              }}
            >
              VOICES / HARMONIZE
            </div>
            <button
              onClick={addVoice}
              disabled={voices.length >= 4}
              style={{
                background: voices.length >= 4 ? "#333" : palette[0],
                border: "2px solid #000",
                padding: "4px 14px",
                fontWeight: 900,
                fontSize: 12,
                cursor: voices.length >= 4 ? "default" : "pointer",
                fontFamily: "inherit",
                color: voices.length >= 4 ? "#666" : "#000",
              }}
            >
              + ADD VOICE
            </button>
          </div>

          {voices.map((v, idx) => (
            <div
              key={idx}
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr 1fr auto",
                gap: 12,
                alignItems: "center",
                padding: "10px 0",
                borderTop: idx > 0 ? "1px solid #333" : "none",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: v.on ? palette[idx % 4] : "#333",
                  color: v.on ? "#000" : "#666",
                  fontWeight: 900,
                  fontSize: 13,
                  cursor: "pointer",
                  border: "2px solid #000",
                }}
                onClick={() => updateVoice(idx, "on", !v.on)}
              >
                {idx + 1}
              </div>

              <div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#666",
                    marginBottom: 4,
                    letterSpacing: 1,
                  }}
                >
                  INTERVAL
                </div>
                <select
                  value={v.interval}
                  onChange={(e) =>
                    updateVoice(idx, "interval", parseInt(e.target.value))
                  }
                  style={{
                    width: "100%",
                    background: "#222",
                    color: "#fff",
                    border: `1px solid ${palette[idx % 4]}`,
                    padding: "6px 8px",
                    fontFamily: "inherit",
                    fontSize: 12,
                  }}
                >
                  {INTERVALS.map((iv, j) => (
                    <option key={j} value={j}>
                      {iv.name} ({Math.round(pitch * iv.ratio)} Hz)
                    </option>
                  ))}
                </select>
              </div>

              <SliderControl
                label="VOL"
                value={v.vol}
                min={0}
                max={1}
                step={0.01}
                onChange={(val) => updateVoice(idx, "vol", val)}
                display={`${Math.round(v.vol * 100)}%`}
                color={palette[idx % 4]}
                accent={palette[(idx + 1) % 4]}
                compact
              />

              {idx > 0 && (
                <button
                  onClick={() => removeVoice(idx)}
                  style={{
                    background: "transparent",
                    border: "1px solid #555",
                    color: "#888",
                    cursor: "pointer",
                    fontSize: 16,
                    width: 28,
                    height: 28,
                    padding: 0,
                    fontFamily: "inherit",
                  }}
                >
                  ×
                </button>
              )}
              {idx === 0 && <div style={{ width: 28 }} />}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            fontSize: 11,
            color: "#555",
            padding: "12px 0 32px",
            letterSpacing: 1,
          }}
        >
          MORSE DJ • SIGNAL AS ART • PASTE YOUR OWN TEXT
        </div>
      </div>
    </div>
  );
}

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
  color,
  accent,
  compact,
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: compact ? 4 : 8,
        }}
      >
        <span
          style={{
            fontSize: compact ? 10 : 11,
            fontWeight: 900,
            color: color,
            letterSpacing: 2,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: compact ? 11 : 13,
            fontWeight: 700,
            color: accent || "#fff",
          }}
        >
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          width: "100%",
          accentColor: color,
          height: compact ? 3 : 4,
        }}
      />
    </div>
  );
}
