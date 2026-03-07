/**
 * AudioEngine — Web Audio API synthesizer core.
 * Manages oscillators, filter, envelopes, LFO, and effects chain.
 */
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.running = false;
    this.voices = new Map(); // note -> voice object
    this.lastFreq = 440;

    // Default parameters
    this.params = {
      osc1Wave: 'sawtooth',
      osc1Detune: 0,
      osc1Gain: 0.8,
      osc1Octave: 0,
      osc2Wave: 'square',
      osc2Detune: 7,
      osc2Gain: 0.6,
      osc2Octave: 0,
      noiseGain: 0,
      filterType: 'lowpass',
      filterCutoff: 8000,
      filterResonance: 0,
      filterEnvAmount: 0.3,
      filterAttack: 0.01,
      filterDecay: 0.3,
      filterSustain: 0.4,
      filterRelease: 0.2,
      ampAttack: 0.01,
      ampDecay: 0.2,
      ampSustain: 0.7,
      ampRelease: 0.3,
      masterGain: 0.7,
      glide: 0,
      delayTime: 0.3,
      delayFeedback: 0.4,
      delayMix: 0,
      reverbSize: 0.5,
      reverbDamping: 0.5,
      reverbMix: 0,
      distAmount: 0,
      distMix: 0,
      lfoWave: 'sine',
      lfoRate: 4,
      lfoDepth: 0,
      lfoTarget: 'filter',
    };
  }

  async init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();

    // Master gain
    this.masterGainNode = this.ctx.createGain();
    this.masterGainNode.gain.value = this.params.masterGain;

    // Effects chain: voice -> distortion -> delay -> reverb -> master -> dest
    this._buildDistortion();
    this._buildDelay();
    this._buildReverb();

    this.distWet.connect(this.delayInput);
    this.distDry.connect(this.delayInput);
    this.delayOutput.connect(this.reverbInput);
    this.reverbOutput.connect(this.masterGainNode);
    this.masterGainNode.connect(this.ctx.destination);

    // Noise buffer (shared)
    this.noiseBuffer = this._createNoiseBuffer();

    // LFO
    this._buildLFO();

    this.running = true;
  }

  // --- Voice management ---

  noteOn(note, freq) {
    if (!this.running) return;

    // If voice exists, release first
    if (this.voices.has(note)) {
      this.noteOff(note);
    }

    const now = this.ctx.currentTime;
    const voice = {};

    // Glide frequency
    const targetFreq = freq;
    const glideTime = this.params.glide / 1000;

    // OSC 1
    voice.osc1 = this.ctx.createOscillator();
    voice.osc1.type = this.params.osc1Wave;
    voice.osc1.detune.value = this.params.osc1Detune;
    const osc1Freq = targetFreq * Math.pow(2, this.params.osc1Octave);
    if (glideTime > 0) {
      voice.osc1.frequency.setValueAtTime(this.lastFreq * Math.pow(2, this.params.osc1Octave), now);
      voice.osc1.frequency.linearRampToValueAtTime(osc1Freq, now + glideTime);
    } else {
      voice.osc1.frequency.setValueAtTime(osc1Freq, now);
    }
    voice.osc1Gain = this.ctx.createGain();
    voice.osc1Gain.gain.value = this.params.osc1Gain;
    voice.osc1.connect(voice.osc1Gain);

    // OSC 2
    voice.osc2 = this.ctx.createOscillator();
    voice.osc2.type = this.params.osc2Wave;
    voice.osc2.detune.value = this.params.osc2Detune;
    const osc2Freq = targetFreq * Math.pow(2, this.params.osc2Octave);
    if (glideTime > 0) {
      voice.osc2.frequency.setValueAtTime(this.lastFreq * Math.pow(2, this.params.osc2Octave), now);
      voice.osc2.frequency.linearRampToValueAtTime(osc2Freq, now + glideTime);
    } else {
      voice.osc2.frequency.setValueAtTime(osc2Freq, now);
    }
    voice.osc2Gain = this.ctx.createGain();
    voice.osc2Gain.gain.value = this.params.osc2Gain;
    voice.osc2.connect(voice.osc2Gain);

    // Noise
    voice.noise = this.ctx.createBufferSource();
    voice.noise.buffer = this.noiseBuffer;
    voice.noise.loop = true;
    voice.noiseGain = this.ctx.createGain();
    voice.noiseGain.gain.value = this.params.noiseGain;
    voice.noise.connect(voice.noiseGain);

    // Filter
    voice.filter = this.ctx.createBiquadFilter();
    voice.filter.type = this.params.filterType;
    voice.filter.Q.value = this.params.filterResonance * 30; // scale 0-1 to 0-30

    // Filter envelope
    const baseCutoff = this.params.filterCutoff;
    const envAmount = this.params.filterEnvAmount;
    const filterPeak = Math.min(baseCutoff + envAmount * 18000, 20000);
    const fSustain = baseCutoff + envAmount * this.params.filterSustain * 18000;

    voice.filter.frequency.setValueAtTime(baseCutoff, now);
    voice.filter.frequency.linearRampToValueAtTime(filterPeak, now + this.params.filterAttack);
    voice.filter.frequency.linearRampToValueAtTime(fSustain, now + this.params.filterAttack + this.params.filterDecay);

    // Connect sources -> filter
    voice.osc1Gain.connect(voice.filter);
    voice.osc2Gain.connect(voice.filter);
    voice.noiseGain.connect(voice.filter);

    // Amp envelope
    voice.ampGain = this.ctx.createGain();
    voice.ampGain.gain.setValueAtTime(0, now);
    voice.ampGain.gain.linearRampToValueAtTime(1, now + this.params.ampAttack);
    voice.ampGain.gain.linearRampToValueAtTime(
      this.params.ampSustain,
      now + this.params.ampAttack + this.params.ampDecay
    );

    voice.filter.connect(voice.ampGain);

    // Connect to effects input (distortion)
    voice.ampGain.connect(this.distInput);

    // LFO modulation per voice
    if (this.params.lfoDepth > 0) {
      this._connectLFOToVoice(voice);
    }

    // Start
    voice.osc1.start(now);
    voice.osc2.start(now);
    voice.noise.start(now);

    this.voices.set(note, voice);
    this.lastFreq = targetFreq;
  }

  noteOff(note) {
    const voice = this.voices.get(note);
    if (!voice) return;

    const now = this.ctx.currentTime;
    const release = this.params.ampRelease;
    const filterRelease = this.params.filterRelease;

    // Amp release
    voice.ampGain.gain.cancelScheduledValues(now);
    voice.ampGain.gain.setValueAtTime(voice.ampGain.gain.value, now);
    voice.ampGain.gain.linearRampToValueAtTime(0, now + release);

    // Filter release
    voice.filter.frequency.cancelScheduledValues(now);
    voice.filter.frequency.setValueAtTime(voice.filter.frequency.value, now);
    voice.filter.frequency.linearRampToValueAtTime(this.params.filterCutoff, now + filterRelease);

    // Schedule cleanup
    const stopTime = now + Math.max(release, filterRelease) + 0.05;
    voice.osc1.stop(stopTime);
    voice.osc2.stop(stopTime);
    voice.noise.stop(stopTime);

    this.voices.delete(note);
  }

  // --- Parameter setters ---

  setParam(name, value) {
    this.params[name] = value;

    // Live-update active voices where applicable
    switch (name) {
      case 'masterGain':
        if (this.masterGainNode) {
          this.masterGainNode.gain.setTargetAtTime(value, this.ctx.currentTime, 0.02);
        }
        break;
      case 'filterCutoff':
      case 'filterResonance':
        this.voices.forEach(v => {
          v.filter.frequency.setTargetAtTime(this.params.filterCutoff, this.ctx.currentTime, 0.02);
          v.filter.Q.setTargetAtTime(this.params.filterResonance * 30, this.ctx.currentTime, 0.02);
        });
        break;
      case 'filterType':
        this.voices.forEach(v => { v.filter.type = value; });
        break;
      case 'osc1Wave':
        this.voices.forEach(v => { v.osc1.type = value; });
        break;
      case 'osc2Wave':
        this.voices.forEach(v => { v.osc2.type = value; });
        break;
      case 'osc1Detune':
        this.voices.forEach(v => { v.osc1.detune.setTargetAtTime(value, this.ctx.currentTime, 0.02); });
        break;
      case 'osc2Detune':
        this.voices.forEach(v => { v.osc2.detune.setTargetAtTime(value, this.ctx.currentTime, 0.02); });
        break;
      case 'osc1Gain':
        this.voices.forEach(v => { v.osc1Gain.gain.setTargetAtTime(value, this.ctx.currentTime, 0.02); });
        break;
      case 'osc2Gain':
        this.voices.forEach(v => { v.osc2Gain.gain.setTargetAtTime(value, this.ctx.currentTime, 0.02); });
        break;
      case 'noiseGain':
        this.voices.forEach(v => { v.noiseGain.gain.setTargetAtTime(value, this.ctx.currentTime, 0.02); });
        break;
      case 'delayTime':
        if (this.delayNode) this.delayNode.delayTime.setTargetAtTime(value, this.ctx.currentTime, 0.05);
        break;
      case 'delayFeedback':
        if (this.delayFbGain) this.delayFbGain.gain.setTargetAtTime(value, this.ctx.currentTime, 0.02);
        break;
      case 'delayMix':
        if (this.delayWetGain) this.delayWetGain.gain.setTargetAtTime(value, this.ctx.currentTime, 0.02);
        if (this.delayDryGain) this.delayDryGain.gain.setTargetAtTime(1 - value, this.ctx.currentTime, 0.02);
        break;
      case 'reverbMix':
        if (this.reverbWetGain) this.reverbWetGain.gain.setTargetAtTime(value, this.ctx.currentTime, 0.02);
        if (this.reverbDryGain) this.reverbDryGain.gain.setTargetAtTime(1 - value, this.ctx.currentTime, 0.02);
        break;
      case 'reverbSize':
      case 'reverbDamping':
        this._updateReverbIR();
        break;
      case 'distAmount':
        if (this.distNode) this.distNode.curve = this._makeDistCurve(value);
        break;
      case 'distMix':
        if (this.distWet) this.distWet.gain.setTargetAtTime(value, this.ctx.currentTime, 0.02);
        if (this.distDry) this.distDry.gain.setTargetAtTime(1 - value, this.ctx.currentTime, 0.02);
        break;
      case 'lfoRate':
        if (this.lfo) this.lfo.frequency.setTargetAtTime(value, this.ctx.currentTime, 0.02);
        break;
      case 'lfoWave':
        if (this.lfo) this.lfo.type = value;
        break;
      case 'lfoDepth':
      case 'lfoTarget':
        this._updateLFORouting();
        break;
    }
  }

  // --- Effects ---

  _buildDistortion() {
    this.distInput = this.ctx.createGain();
    this.distNode = this.ctx.createWaveShaper();
    this.distNode.curve = this._makeDistCurve(this.params.distAmount);
    this.distNode.oversample = '4x';
    this.distWet = this.ctx.createGain();
    this.distWet.gain.value = this.params.distMix;
    this.distDry = this.ctx.createGain();
    this.distDry.gain.value = 1 - this.params.distMix;

    this.distInput.connect(this.distNode);
    this.distNode.connect(this.distWet);
    this.distInput.connect(this.distDry);
  }

  _makeDistCurve(amount) {
    const k = amount * 400;
    const samples = 256;
    const curve = new Float32Array(samples);
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = k === 0 ? x : ((3 + k) * x * 20 * (Math.PI / 180)) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  _buildDelay() {
    this.delayInput = this.ctx.createGain();
    this.delayNode = this.ctx.createDelay(2);
    this.delayNode.delayTime.value = this.params.delayTime;
    this.delayFbGain = this.ctx.createGain();
    this.delayFbGain.gain.value = this.params.delayFeedback;
    this.delayWetGain = this.ctx.createGain();
    this.delayWetGain.gain.value = this.params.delayMix;
    this.delayDryGain = this.ctx.createGain();
    this.delayDryGain.gain.value = 1 - this.params.delayMix;
    this.delayOutput = this.ctx.createGain();

    // Delay path
    this.delayInput.connect(this.delayNode);
    this.delayNode.connect(this.delayFbGain);
    this.delayFbGain.connect(this.delayNode);
    this.delayNode.connect(this.delayWetGain);
    this.delayWetGain.connect(this.delayOutput);

    // Dry path
    this.delayInput.connect(this.delayDryGain);
    this.delayDryGain.connect(this.delayOutput);
  }

  _buildReverb() {
    this.reverbInput = this.ctx.createGain();
    this.reverbConvolver = this.ctx.createConvolver();
    this._updateReverbIR();
    this.reverbWetGain = this.ctx.createGain();
    this.reverbWetGain.gain.value = this.params.reverbMix;
    this.reverbDryGain = this.ctx.createGain();
    this.reverbDryGain.gain.value = 1 - this.params.reverbMix;
    this.reverbOutput = this.ctx.createGain();

    this.reverbInput.connect(this.reverbConvolver);
    this.reverbConvolver.connect(this.reverbWetGain);
    this.reverbWetGain.connect(this.reverbOutput);

    this.reverbInput.connect(this.reverbDryGain);
    this.reverbDryGain.connect(this.reverbOutput);
  }

  _updateReverbIR() {
    if (!this.ctx) return;
    const size = this.params.reverbSize;
    const damping = this.params.reverbDamping;
    const sampleRate = this.ctx.sampleRate;
    const length = Math.max(sampleRate * (0.5 + size * 4), sampleRate * 0.1);
    const buffer = this.ctx.createBuffer(2, length, sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        const decay = Math.exp(-t * (2 + damping * 8));
        data[i] = (Math.random() * 2 - 1) * decay;
      }
    }
    this.reverbConvolver.buffer = buffer;
  }

  _createNoiseBuffer() {
    const length = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // --- LFO ---

  _buildLFO() {
    this.lfo = this.ctx.createOscillator();
    this.lfo.type = this.params.lfoWave;
    this.lfo.frequency.value = this.params.lfoRate;
    this.lfoGain = this.ctx.createGain();
    this.lfoGain.gain.value = 0;
    this.lfo.connect(this.lfoGain);
    this.lfo.start();
    this._updateLFORouting();
  }

  _connectLFOToVoice(voice) {
    const target = this.params.lfoTarget;
    const depth = this.params.lfoDepth;

    if (target === 'filter') {
      const lfoToFilter = this.ctx.createGain();
      lfoToFilter.gain.value = depth * this.params.filterCutoff * 0.5;
      this.lfoGain.connect(lfoToFilter);
      lfoToFilter.connect(voice.filter.frequency);
      voice._lfoNode = lfoToFilter;
    } else if (target === 'pitch') {
      const lfoToPitch1 = this.ctx.createGain();
      lfoToPitch1.gain.value = depth * 100; // cents
      this.lfoGain.connect(lfoToPitch1);
      lfoToPitch1.connect(voice.osc1.detune);
      const lfoToPitch2 = this.ctx.createGain();
      lfoToPitch2.gain.value = depth * 100;
      this.lfoGain.connect(lfoToPitch2);
      lfoToPitch2.connect(voice.osc2.detune);
      voice._lfoNode = lfoToPitch1;
      voice._lfoNode2 = lfoToPitch2;
    } else if (target === 'amp') {
      const lfoToAmp = this.ctx.createGain();
      lfoToAmp.gain.value = depth * 0.5;
      this.lfoGain.connect(lfoToAmp);
      lfoToAmp.connect(voice.ampGain.gain);
      voice._lfoNode = lfoToAmp;
    }
  }

  _updateLFORouting() {
    if (!this.lfoGain) return;
    this.lfoGain.gain.value = this.params.lfoDepth > 0 ? 1 : 0;
  }

  // --- Cleanup ---

  destroy() {
    this.voices.forEach((_, note) => this.noteOff(note));
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this.running = false;
  }
}
