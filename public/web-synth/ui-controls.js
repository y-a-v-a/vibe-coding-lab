/**
 * UIControls — Custom SVG rotary knobs and slider initialization.
 * All knobs are rendered as SVG arcs with drag-to-rotate interaction.
 */
class UIControls {
  constructor() {
    this.knobs = new Map(); // element -> state
    this.listeners = new Map(); // param -> callback
    this._dragState = null;
    this._bindGlobalDrag();
  }

  /**
   * Initialize all knob elements found in the DOM.
   */
  initKnobs() {
    document.querySelectorAll('.knob').forEach(el => this._createKnob(el));
  }

  /**
   * Initialize slider change events.
   */
  initSliders() {
    document.querySelectorAll('.slider').forEach(el => {
      el.addEventListener('input', () => {
        const param = el.dataset.param;
        const value = parseFloat(el.value);
        this._emit(param, value);
      });
    });
  }

  /**
   * Register a callback for parameter changes.
   */
  onChange(param, callback) {
    this.listeners.set(param, callback);
  }

  /**
   * Register a callback for all parameter changes.
   */
  onAnyChange(callback) {
    this._anyChangeCallback = callback;
  }

  // --- Knob rendering ---

  _createKnob(el) {
    const min = parseFloat(el.dataset.min) || 0;
    const max = parseFloat(el.dataset.max) || 100;
    const value = parseFloat(el.dataset.value) || 0;
    const step = parseFloat(el.dataset.step) || 0;
    const curve = el.dataset.curve || 'linear';
    const param = el.dataset.param;

    const state = { el, min, max, value, step, curve, param };
    this.knobs.set(el, state);

    // Build SVG
    const size = 52;
    const cx = size / 2;
    const cy = size / 2;
    const r = 20;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`);

    // Arc parameters: 240 degree sweep, starting at 150 degrees
    const startAngle = 150;
    const endAngle = 390; // 150 + 240
    const arcLength = endAngle - startAngle;

    // Background arc
    const bgArc = this._createArcPath(cx, cy, r, startAngle, endAngle);
    const bgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    bgPath.setAttribute('d', bgArc);
    bgPath.setAttribute('class', 'knob-arc-bg');
    svg.appendChild(bgPath);

    // Value arc
    const valuePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    valuePath.setAttribute('class', 'knob-arc-value');
    svg.appendChild(valuePath);
    state.valuePath = valuePath;

    // Center circle
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', 13);
    circle.setAttribute('class', 'knob-center');
    svg.appendChild(circle);

    // Indicator line
    const indicator = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    indicator.setAttribute('class', 'knob-indicator');
    svg.appendChild(indicator);
    state.indicator = indicator;

    // Value text
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', cx);
    text.setAttribute('y', cy + 3);
    text.setAttribute('class', 'knob-value');
    svg.appendChild(text);
    state.text = text;

    state.cx = cx;
    state.cy = cy;
    state.r = r;
    state.startAngle = startAngle;
    state.arcLength = arcLength;

    el.appendChild(svg);
    this._updateKnobVisual(state);

    // Mouse/touch drag start
    el.addEventListener('mousedown', e => this._startDrag(e, state));
    el.addEventListener('touchstart', e => this._startDrag(e, state), { passive: false });

    // Double-click to reset
    el.addEventListener('dblclick', () => {
      state.value = parseFloat(el.dataset.value) || 0;
      this._updateKnobVisual(state);
      this._emit(state.param, state.value);
    });
  }

  _updateKnobVisual(state) {
    const { min, max, value, cx, cy, r, startAngle, arcLength, valuePath, indicator, text, curve } = state;

    // Normalized 0-1
    let norm;
    if (curve === 'log') {
      const logMin = Math.log(min || 1);
      const logMax = Math.log(max);
      norm = (Math.log(Math.max(value, min || 1)) - logMin) / (logMax - logMin);
    } else {
      norm = (value - min) / (max - min);
    }
    norm = Math.max(0, Math.min(1, norm));

    // Value arc
    const valueAngle = startAngle + norm * arcLength;
    if (norm > 0.005) {
      const d = this._createArcPath(cx, cy, r, startAngle, valueAngle);
      valuePath.setAttribute('d', d);
      valuePath.style.display = '';
    } else {
      valuePath.style.display = 'none';
    }

    // Indicator line
    const angleRad = (valueAngle * Math.PI) / 180;
    const ix1 = cx + 7 * Math.cos(angleRad);
    const iy1 = cy + 7 * Math.sin(angleRad);
    const ix2 = cx + 12 * Math.cos(angleRad);
    const iy2 = cy + 12 * Math.sin(angleRad);
    indicator.setAttribute('x1', ix1);
    indicator.setAttribute('y1', iy1);
    indicator.setAttribute('x2', ix2);
    indicator.setAttribute('y2', iy2);

    // Value text
    let displayVal;
    if (Math.abs(value) >= 1000) {
      displayVal = (value / 1000).toFixed(1) + 'k';
    } else if (Number.isInteger(value) || state.step >= 1) {
      displayVal = Math.round(value).toString();
    } else {
      displayVal = value.toFixed(1);
    }
    text.textContent = displayVal;
  }

  _createArcPath(cx, cy, r, startDeg, endDeg) {
    const startRad = (startDeg * Math.PI) / 180;
    const endRad = (endDeg * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  }

  // --- Drag interaction ---

  _startDrag(e, state) {
    e.preventDefault();
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    this._dragState = { state, startY: clientY, startValue: state.value };
  }

  _bindGlobalDrag() {
    const onMove = e => {
      if (!this._dragState) return;
      e.preventDefault();
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const { state, startY, startValue } = this._dragState;
      const dy = startY - clientY; // up = positive
      const range = state.max - state.min;
      const sensitivity = range / 150; // pixels for full range

      let newValue;
      if (state.curve === 'log') {
        const logMin = Math.log(state.min || 1);
        const logMax = Math.log(state.max);
        const startNorm = (Math.log(Math.max(startValue, state.min || 1)) - logMin) / (logMax - logMin);
        const newNorm = Math.max(0, Math.min(1, startNorm + dy / 150));
        newValue = Math.exp(logMin + newNorm * (logMax - logMin));
      } else {
        newValue = startValue + dy * sensitivity;
      }

      if (state.step > 0) {
        newValue = Math.round(newValue / state.step) * state.step;
      }
      newValue = Math.max(state.min, Math.min(state.max, newValue));
      state.value = newValue;
      this._updateKnobVisual(state);
      this._emit(state.param, state.value);
    };

    const onEnd = () => {
      this._dragState = null;
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
  }

  _emit(param, value) {
    const cb = this.listeners.get(param);
    if (cb) cb(value);
    if (this._anyChangeCallback) this._anyChangeCallback(param, value);
  }
}
