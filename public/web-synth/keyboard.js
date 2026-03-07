/**
 * Keyboard — On-screen piano keyboard with mouse and computer keyboard input.
 * Generates note-on/off events with MIDI note numbers and frequencies.
 */
class Keyboard {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.octave = 4; // current base octave
    this.activeKeys = new Set();
    this.onNoteOn = null;  // callback(note, freq)
    this.onNoteOff = null; // callback(note)

    // Computer keyboard to note mapping (relative to octave)
    // Bottom row: A=C, S=D, D=E, F=F, G=G, H=A, J=B, K=C+1, L=D+1
    // Top row: W=C#, E=D#, T=F#, Y=G#, U=A#, O=C#+1, P=D#+1
    this.keyMap = {
      'a': 0,   // C
      'w': 1,   // C#
      's': 2,   // D
      'e': 3,   // D#
      'd': 4,   // E
      'f': 5,   // F
      't': 6,   // F#
      'g': 7,   // G
      'y': 8,   // G#
      'h': 9,   // A
      'u': 10,  // A#
      'j': 11,  // B
      'k': 12,  // C+1
      'o': 13,  // C#+1
      'l': 14,  // D+1
      'p': 15,  // D#+1
    };

    this.noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    this._buildKeys();
    this._bindKeyboard();
    this._bindMouse();
  }

  _midiToFreq(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  _buildKeys() {
    this.container.innerHTML = '';
    this.keyElements = new Map();

    // Build 2 octaves of keys starting from current octave
    const startNote = this.octave * 12 + 12; // MIDI note (C0 = 12)
    const numKeys = 25; // 2 octaves + 1

    for (let i = 0; i < numKeys; i++) {
      const midiNote = startNote + i;
      const noteInOctave = i % 12;
      const isBlack = [1, 3, 6, 8, 10].includes(noteInOctave);

      if (isBlack) continue; // We'll add black keys separately

      const key = document.createElement('div');
      key.className = 'key key-white';
      key.dataset.note = midiNote;

      // Find keyboard shortcut for this note
      const relativeNote = i;
      const shortcut = Object.entries(this.keyMap).find(([, v]) => v === relativeNote);
      if (shortcut) {
        key.textContent = shortcut[0].toUpperCase();
      }

      this.container.appendChild(key);
      this.keyElements.set(midiNote, key);
    }

    // Add black keys (positioned over white keys)
    for (let i = 0; i < numKeys; i++) {
      const midiNote = startNote + i;
      const noteInOctave = i % 12;
      const isBlack = [1, 3, 6, 8, 10].includes(noteInOctave);

      if (!isBlack) continue;

      const key = document.createElement('div');
      key.className = 'key key-black';
      key.dataset.note = midiNote;

      const relativeNote = i;
      const shortcut = Object.entries(this.keyMap).find(([, v]) => v === relativeNote);
      if (shortcut) {
        key.textContent = shortcut[0].toUpperCase();
      }

      // Insert after the previous white key
      const prevWhite = this.keyElements.get(midiNote - 1);
      if (prevWhite && prevWhite.nextSibling) {
        this.container.insertBefore(key, prevWhite.nextSibling);
      } else {
        this.container.appendChild(key);
      }
      this.keyElements.set(midiNote, key);
    }
  }

  _bindKeyboard() {
    document.addEventListener('keydown', e => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();

      // Octave change
      if (key === 'z') {
        this.octave = Math.max(1, this.octave - 1);
        this._buildKeys();
        return;
      }
      if (key === 'x') {
        this.octave = Math.min(7, this.octave + 1);
        this._buildKeys();
        return;
      }

      const offset = this.keyMap[key];
      if (offset === undefined) return;

      const midiNote = this.octave * 12 + 12 + offset;
      if (this.activeKeys.has(midiNote)) return;

      this.activeKeys.add(midiNote);
      this._activateKey(midiNote);
      if (this.onNoteOn) this.onNoteOn(midiNote, this._midiToFreq(midiNote));
    });

    document.addEventListener('keyup', e => {
      const key = e.key.toLowerCase();
      const offset = this.keyMap[key];
      if (offset === undefined) return;

      const midiNote = this.octave * 12 + 12 + offset;
      this.activeKeys.delete(midiNote);
      this._deactivateKey(midiNote);
      if (this.onNoteOff) this.onNoteOff(midiNote);
    });
  }

  _bindMouse() {
    let mouseDown = false;

    this.container.addEventListener('mousedown', e => {
      const key = e.target.closest('.key');
      if (!key) return;
      mouseDown = true;
      const note = parseInt(key.dataset.note);
      this.activeKeys.add(note);
      this._activateKey(note);
      if (this.onNoteOn) this.onNoteOn(note, this._midiToFreq(note));
    });

    this.container.addEventListener('mouseenter', e => {
      if (!mouseDown) return;
      const key = e.target.closest('.key');
      if (!key) return;
      const note = parseInt(key.dataset.note);
      if (this.activeKeys.has(note)) return;
      this.activeKeys.add(note);
      this._activateKey(note);
      if (this.onNoteOn) this.onNoteOn(note, this._midiToFreq(note));
    }, true);

    this.container.addEventListener('mouseleave', e => {
      if (!mouseDown) return;
      const key = e.target.closest('.key');
      if (!key) return;
      const note = parseInt(key.dataset.note);
      this.activeKeys.delete(note);
      this._deactivateKey(note);
      if (this.onNoteOff) this.onNoteOff(note);
    }, true);

    document.addEventListener('mouseup', () => {
      if (!mouseDown) return;
      mouseDown = false;
      this.activeKeys.forEach(note => {
        this._deactivateKey(note);
        if (this.onNoteOff) this.onNoteOff(note);
      });
      this.activeKeys.clear();
    });

    // Touch support
    this.container.addEventListener('touchstart', e => {
      e.preventDefault();
      for (const touch of e.changedTouches) {
        const key = document.elementFromPoint(touch.clientX, touch.clientY);
        if (!key || !key.classList.contains('key')) continue;
        const note = parseInt(key.dataset.note);
        this.activeKeys.add(note);
        this._activateKey(note);
        if (this.onNoteOn) this.onNoteOn(note, this._midiToFreq(note));
      }
    }, { passive: false });

    this.container.addEventListener('touchend', e => {
      e.preventDefault();
      this.activeKeys.forEach(note => {
        this._deactivateKey(note);
        if (this.onNoteOff) this.onNoteOff(note);
      });
      this.activeKeys.clear();
    }, { passive: false });
  }

  _activateKey(note) {
    const el = this.keyElements.get(note);
    if (el) el.classList.add('active');
  }

  _deactivateKey(note) {
    const el = this.keyElements.get(note);
    if (el) el.classList.remove('active');
  }
}
