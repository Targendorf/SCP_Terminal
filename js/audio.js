// Web Audio: механическая клавиатура + бипы. Гул убран.
(function () {
  let ctx = null;
  let enabled = true;

  function ensureCtx() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { return null; }
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function setEnabled(v) { enabled = !!v; }

  // === Механическая клавиатура ===
  function key() {
    if (!enabled) return;
    const ac = ensureCtx(); if (!ac) return;
    const t = ac.currentTime;

    // 1. THOCK — низкий корпусной удар
    const thockBuf = ac.createBuffer(1, ac.sampleRate * 0.06, ac.sampleRate);
    const thockData = thockBuf.getChannelData(0);
    for (let i = 0; i < thockData.length; i++) {
      const env = Math.pow(1 - i / thockData.length, 2.2);
      thockData[i] = (Math.random() * 2 - 1) * env;
    }
    const thockSrc = ac.createBufferSource();
    thockSrc.buffer = thockBuf;
    const thockFilt = ac.createBiquadFilter();
    thockFilt.type = 'lowpass';
    thockFilt.frequency.value = 280 + Math.random() * 80;
    thockFilt.Q.value = 3.5;
    const thockGain = ac.createGain();
    thockGain.gain.value = 0.16;
    thockSrc.connect(thockFilt).connect(thockGain).connect(ac.destination);
    thockSrc.start(t);
    thockSrc.stop(t + 0.08);

    // 2. CLICK — резкий переключательный щелчок
    const clickBuf = ac.createBuffer(1, ac.sampleRate * 0.012, ac.sampleRate);
    const clickData = clickBuf.getChannelData(0);
    for (let i = 0; i < clickData.length; i++) {
      const env = Math.pow(1 - i / clickData.length, 1.1);
      clickData[i] = (Math.random() * 2 - 1) * env;
    }
    const clickSrc = ac.createBufferSource();
    clickSrc.buffer = clickBuf;
    const clickFilt = ac.createBiquadFilter();
    clickFilt.type = 'bandpass';
    clickFilt.frequency.value = 4200 + Math.random() * 1500;
    clickFilt.Q.value = 4;
    const clickGain = ac.createGain();
    clickGain.gain.value = 0.09;
    clickSrc.connect(clickFilt).connect(clickGain).connect(ac.destination);
    clickSrc.start(t + 0.002);
    clickSrc.stop(t + 0.02);
  }

  function beep(freq, dur) {
    if (!enabled) return;
    const ac = ensureCtx(); if (!ac) return;
    const t = ac.currentTime;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(freq || 880, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.15));
    o.connect(g).connect(ac.destination);
    o.start(t); o.stop(t + (dur || 0.15) + 0.02);
  }

  function error() {
    if (!enabled) return;
    beep(220, 0.1);
    setTimeout(() => beep(160, 0.2), 90);
  }

  function granted() {
    if (!enabled) return;
    beep(520, 0.08);
    setTimeout(() => beep(740, 0.08), 80);
    setTimeout(() => beep(980, 0.14), 160);
  }

  function denied() { error(); }

  // Заглушки — совместимость со старым кодом, если где-то вызывались.
  function noop() {}

  window.SCPAudio = {
    key, beep, error, granted, denied,
    setEnabled,
    startHum: noop, stopHum: noop, setHumVolume: noop,
  };
})();
