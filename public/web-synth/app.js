/**
 * App — Main entry point. Wires UI controls to the audio engine.
 */
(function () {
  const engine = new AudioEngine();
  const ui = new UIControls();
  const keyboard = new Keyboard('keyboard');

  // Parameter mapping: UI data-param -> engine param name + transform
  const paramMap = {
    'osc1-detune':     { param: 'osc1Detune',     transform: v => v },
    'osc1-gain':       { param: 'osc1Gain',        transform: v => v / 100 },
    'osc1-octave':     { param: 'osc1Octave',      transform: v => v },
    'osc2-detune':     { param: 'osc2Detune',      transform: v => v },
    'osc2-gain':       { param: 'osc2Gain',        transform: v => v / 100 },
    'osc2-octave':     { param: 'osc2Octave',      transform: v => v },
    'noise-gain':      { param: 'noiseGain',        transform: v => v / 100 },
    'filter-cutoff':   { param: 'filterCutoff',     transform: v => v },
    'filter-resonance':{ param: 'filterResonance',  transform: v => v / 100 },
    'filter-env':      { param: 'filterEnvAmount',  transform: v => v / 100 },
    'filter-attack':   { param: 'filterAttack',     transform: v => v / 1000 },
    'filter-decay':    { param: 'filterDecay',       transform: v => v / 1000 },
    'filter-sustain':  { param: 'filterSustain',     transform: v => v / 100 },
    'filter-release':  { param: 'filterRelease',     transform: v => v / 1000 },
    'amp-attack':      { param: 'ampAttack',         transform: v => v / 1000 },
    'amp-decay':       { param: 'ampDecay',           transform: v => v / 1000 },
    'amp-sustain':     { param: 'ampSustain',         transform: v => v / 100 },
    'amp-release':     { param: 'ampRelease',         transform: v => v / 1000 },
    'master-gain':     { param: 'masterGain',         transform: v => v / 100 },
    'glide':           { param: 'glide',              transform: v => v },
    'delay-time':      { param: 'delayTime',          transform: v => v / 1000 },
    'delay-feedback':  { param: 'delayFeedback',      transform: v => v / 100 },
    'delay-mix':       { param: 'delayMix',            transform: v => v / 100 },
    'reverb-size':     { param: 'reverbSize',          transform: v => v / 100 },
    'reverb-damping':  { param: 'reverbDamping',       transform: v => v / 100 },
    'reverb-mix':      { param: 'reverbMix',           transform: v => v / 100 },
    'dist-amount':     { param: 'distAmount',          transform: v => v / 100 },
    'dist-mix':        { param: 'distMix',             transform: v => v / 100 },
    'lfo-rate':        { param: 'lfoRate',             transform: v => v },
    'lfo-depth':       { param: 'lfoDepth',            transform: v => v / 100 },
  };

  // --- Initialize UI ---
  ui.initKnobs();
  ui.initSliders();

  // Route all knob/slider changes to engine
  ui.onAnyChange((uiParam, rawValue) => {
    const mapping = paramMap[uiParam];
    if (mapping) {
      engine.setParam(mapping.param, mapping.transform(rawValue));
    }
  });

  // --- Wave select buttons ---
  document.querySelectorAll('.wave-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const osc = btn.dataset.osc;
      const wave = btn.dataset.wave;

      // Toggle active state within group
      btn.parentElement.querySelectorAll('.wave-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      engine.setParam(osc === '1' ? 'osc1Wave' : 'osc2Wave', wave);
    });
  });

  // Filter type buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      engine.setParam('filterType', btn.dataset.filter);
    });
  });

  // LFO wave buttons
  document.querySelectorAll('.lfo-wave-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.lfo-wave-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      engine.setParam('lfoWave', btn.dataset.wave);
    });
  });

  // LFO target buttons
  document.querySelectorAll('.lfo-target-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.lfo-target-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      engine.setParam('lfoTarget', btn.dataset.target);
    });
  });

  // --- Power button ---
  const powerBtn = document.getElementById('power-btn');
  const audioStatus = document.getElementById('audio-status');

  powerBtn.addEventListener('click', async () => {
    if (!engine.running) {
      await engine.init();
      audioStatus.textContent = 'AUDIO ON';
      audioStatus.className = 'status-on';
    } else {
      engine.destroy();
      audioStatus.textContent = 'AUDIO OFF';
      audioStatus.className = 'status-off';
    }
  });

  // --- Keyboard -> Engine ---
  keyboard.onNoteOn = (note, freq) => {
    if (!engine.running) {
      engine.init().then(() => {
        audioStatus.textContent = 'AUDIO ON';
        audioStatus.className = 'status-on';
        engine.noteOn(note, freq);
      });
    } else {
      engine.noteOn(note, freq);
    }
  };

  keyboard.onNoteOff = (note) => {
    engine.noteOff(note);
  };

  // --- Set initial engine params from UI defaults ---
  Object.entries(paramMap).forEach(([uiParam, mapping]) => {
    // Knobs
    const knobEl = document.querySelector(`[data-param="${uiParam}"].knob`);
    if (knobEl) {
      const value = parseFloat(knobEl.dataset.value) || 0;
      engine.setParam(mapping.param, mapping.transform(value));
      return;
    }
    // Sliders
    const sliderEl = document.querySelector(`[data-param="${uiParam}"].slider`);
    if (sliderEl) {
      const value = parseFloat(sliderEl.value) || 0;
      engine.setParam(mapping.param, mapping.transform(value));
    }
  });
})();
