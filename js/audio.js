// Web Audio: механическая клавиатура, бипы, гул старого ПК (кулеры + сеть + HDD)
(function () {
  let ctx = null;
  let fanNodes = null;
  let enabled = true;

  function ensureCtx() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { return null; }
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function setEnabled(v) { enabled = !!v; if (!enabled) stopHum(); }

  // === Механическая клавиатура ===
  // Два компонента: низкий "thock" от корпуса + высокий "click" от купола/переключателя.
  function key() {
    if (!enabled) return;
    const ac = ensureCtx(); if (!ac) return;
    const t = ac.currentTime;

    // 1. THOCK — низкий корпусной удар (короткий отфильтрованный шум)
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

    // 2. CLICK — резкий переключательный щелчок (короткий полосовой всплеск)
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

  // === Гул старого ПК: большой корпусной кулер + кулер БП + 60Гц трансформатор + шум HDD ===
  function startHum() {
    if (!enabled) return;
    const ac = ensureCtx(); if (!ac) return;
    if (fanNodes) return;

    const master = ac.createGain();
    master.gain.value = 0.9;

    // 60 Гц сетевой гул трансформатора БП + 120 Гц гармоника
    const mains60 = ac.createOscillator();
    mains60.type = 'sine';
    mains60.frequency.value = 60;
    const mains60g = ac.createGain();
    mains60g.gain.value = 0.015;

    const mains120 = ac.createOscillator();
    mains120.type = 'sine';
    mains120.frequency.value = 120;
    const mains120g = ac.createGain();
    mains120g.gain.value = 0.008;

    // БОЛЬШОЙ кулер — широкополосный шум через lowpass + медленная модуляция
    const noiseBuf = ac.createBuffer(1, ac.sampleRate * 3, ac.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    // розовый шум (приблизительно через фильтрацию белого)
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < nd.length; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + w * 0.0990460;
      b1 = 0.96300 * b1 + w * 0.2965164;
      b2 = 0.57000 * b2 + w * 1.0526913;
      nd[i] = (b0 + b1 + b2 + w * 0.1848) * 0.18;
    }

    // Основной кулер — массивный low-frequency rumble
    const fanBig = ac.createBufferSource();
    fanBig.buffer = noiseBuf;
    fanBig.loop = true;
    const fanBigLP = ac.createBiquadFilter();
    fanBigLP.type = 'lowpass';
    fanBigLP.frequency.value = 180;
    fanBigLP.Q.value = 0.8;
    const fanBigPeak = ac.createBiquadFilter();
    fanBigPeak.type = 'peaking';
    fanBigPeak.frequency.value = 95;   // "тон" лопастей
    fanBigPeak.Q.value = 2;
    fanBigPeak.gain.value = 8;
    const fanBigG = ac.createGain();
    fanBigG.gain.value = 0.55;

    // Маленький кулер БП — более высокий свист
    const fanPSU = ac.createBufferSource();
    fanPSU.buffer = noiseBuf;
    fanPSU.loop = true;
    const fanPSUBand = ac.createBiquadFilter();
    fanPSUBand.type = 'bandpass';
    fanPSUBand.frequency.value = 420;
    fanPSUBand.Q.value = 4;
    const fanPSUG = ac.createGain();
    fanPSUG.gain.value = 0.12;

    // Фоновый шипящий HDD / воздуховод (высокочастотный лёгкий шум)
    const fanHiss = ac.createBufferSource();
    fanHiss.buffer = noiseBuf;
    fanHiss.loop = true;
    const fanHissHP = ac.createBiquadFilter();
    fanHissHP.type = 'highpass';
    fanHissHP.frequency.value = 2200;
    const fanHissG = ac.createGain();
    fanHissG.gain.value = 0.035;

    // Медленный LFO на основном кулере — «плавание» оборотов
    const lfo = ac.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.13;
    const lfoGain = ac.createGain();
    lfoGain.gain.value = 0.1; // ±0.1 от базовых 0.55
    lfo.connect(lfoGain).connect(fanBigG.gain);

    // Коммутация
    mains60.connect(mains60g).connect(master);
    mains120.connect(mains120g).connect(master);
    fanBig.connect(fanBigLP).connect(fanBigPeak).connect(fanBigG).connect(master);
    fanPSU.connect(fanPSUBand).connect(fanPSUG).connect(master);
    fanHiss.connect(fanHissHP).connect(fanHissG).connect(master);
    master.connect(ac.destination);

    mains60.start();
    mains120.start();
    fanBig.start();
    fanPSU.start();
    fanHiss.start();
    lfo.start();

    fanNodes = { master, stop: [mains60, mains120, fanBig, fanPSU, fanHiss, lfo] };
  }

  function stopHum() {
    if (!fanNodes) return;
    try { fanNodes.stop.forEach(n => { try { n.stop(); } catch (e) {} }); } catch (e) {}
    fanNodes = null;
  }

  function setHumVolume(v) {
    if (fanNodes) fanNodes.master.gain.value = Math.max(0, Math.min(1.5, v));
  }

  window.SCPAudio = { key, beep, error, granted, denied, startHum, stopHum, setEnabled, setHumVolume };
})();
