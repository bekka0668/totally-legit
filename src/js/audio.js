'use strict';
/* =========================================================================
   Synthesized sound effects (WebAudio, no files)
   ========================================================================= */
const SFX = {
  ctx: null, out: null, noiseBuf: null, vol: 0.7, botWindow: 0, botCount: 0, lim: {},
  gate(name, ms) { const t = performance.now(); if (t - (this.lim[name] || 0) < ms) return false; this.lim[name] = t; return true; },

  init() {
    if (this.ctx) { this.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try { this.ctx = new AC(); } catch (e) { this.ctx = null; return; }
    const c = this.ctx;
    this.out = c.createGain();
    this.out.gain.value = this.vol;
    const comp = c.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 5; comp.attack.value = 0.003; comp.release.value = 0.2;
    this.out.connect(comp); comp.connect(c.destination);
    const len = Math.floor(c.sampleRate * 1.2);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.noiseBuf = buf;
    this.resume();
  },
  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {}); },
  setVol(v) { this.vol = v; if (this.out) this.out.gain.value = v; },
  ok() { return !!(this.ctx && this.ctx.state === 'running' && this.vol > 0.001); },

  dest(pan) {
    const c = this.ctx;
    if (pan && c.createStereoPanner) {
      const p = c.createStereoPanner(); p.pan.value = U.clamp(pan, -1, 1); p.connect(this.out); return p;
    }
    return this.out;
  },
  nz(t, dur, o = {}) {
    const c = this.ctx;
    const s = c.createBufferSource(); s.buffer = this.noiseBuf;
    const f = c.createBiquadFilter(); f.type = o.type || 'lowpass';
    f.frequency.setValueAtTime(o.f || 2000, t);
    if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t + dur);
    f.Q.value = o.q == null ? 0.7 : o.q;
    const e = c.createGain();
    const g = Math.max(0.0002, o.g == null ? 0.4 : o.g);
    e.gain.setValueAtTime(0.0001, t);
    e.gain.exponentialRampToValueAtTime(g, t + (o.a || 0.002));
    e.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(e); e.connect(this.dest(o.pan));
    s.start(t, Math.random() * 0.6); s.stop(t + dur + 0.05);
  },
  tn(t, dur, o = {}) {
    const c = this.ctx;
    const osc = c.createOscillator(); osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(o.f || 440, t);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t + dur);
    const e = c.createGain();
    const g = Math.max(0.0002, o.g == null ? 0.2 : o.g);
    e.gain.setValueAtTime(0.0001, t);
    e.gain.exponentialRampToValueAtTime(g, t + (o.a || 0.003));
    e.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(e); e.connect(this.dest(o.pan));
    osc.start(t); osc.stop(t + dur + 0.05);
  },

  shot(kind, o = {}) {
    if (!this.ok() || (kind !== 'bot' && !this.gate('shot', 30))) return;
    const t = this.ctx.currentTime, v = o.vol == null ? 1 : o.vol, far = o.far || 0, pan = o.pan || 0;
    const lp = x => Math.max(250, x * (1 - far * 0.8));
    const crack = (1 - far) * v;
    switch (kind) {
      case 'smg':
        this.nz(t, 0.09, { f: lp(4200), g: 0.4 * v, pan }); this.tn(t, 0.06, { f: 210, f2: 70, g: 0.38 * v, pan });
        this.nz(t, 0.02, { type: 'highpass', f: 3500, g: 0.16 * crack, pan }); break;
      case 'shotgun':
        this.nz(t, 0.4, { f: lp(2000), g: 0.75 * v, pan }); this.tn(t, 0.17, { f: 115, f2: 38, g: 0.85 * v, pan });
        this.nz(t, 0.05, { type: 'highpass', f: 2500, g: 0.3 * crack, pan }); break;
      case 'rifle':
        this.nz(t, 0.17, { f: lp(3300), g: 0.58 * v, pan }); this.tn(t, 0.1, { f: 150, f2: 45, g: 0.7 * v, pan });
        this.nz(t, 0.03, { type: 'highpass', f: 3200, g: 0.24 * crack, pan }); break;
      case 'sniper':
        this.nz(t, 0.65, { f: lp(2600), f2: 280, g: 0.8 * v, pan }); this.tn(t, 0.24, { f: 95, f2: 30, g: 0.95 * v, pan });
        this.nz(t, 0.04, { type: 'highpass', f: 4000, g: 0.36 * crack, pan }); break;
      case 'rail':
        this.tn(t, 0.35, { f: 2600, f2: 160, type: 'sawtooth', g: 0.16 * v, pan }); this.tn(t, 0.45, { f: 130, f2: 40, g: 0.8 * v, pan });
        this.nz(t, 0.4, { type: 'bandpass', f: 1800, f2: 260, q: 2, g: 0.5 * v, pan }); break;
      case 'revolver':
        this.nz(t, 0.3, { f: lp(3000), g: 0.75 * v, pan }); this.tn(t, 0.14, { f: 120, f2: 40, g: 0.85 * v, pan });
        this.nz(t, 0.04, { type: 'highpass', f: 3200, g: 0.32 * crack, pan }); break;
      case 'lmg':
        this.nz(t, 0.12, { f: lp(2800), g: 0.5 * v, pan }); this.tn(t, 0.08, { f: 120, f2: 45, g: 0.55 * v, pan });
        this.nz(t, 0.02, { type: 'highpass', f: 3000, g: 0.18 * crack, pan }); break;
      case 'launcher':
        this.nz(t, 0.35, { type: 'bandpass', f: 900, f2: 300, q: 1.2, g: 0.6 * v, pan }); this.tn(t, 0.3, { f: 220, f2: 60, g: 0.5 * v, pan }); break;
      case 'bot':
        this.nz(t, 0.12, { f: lp(3000), g: 0.32 * v, pan }); this.tn(t, 0.07, { f: 170, f2: 60, g: 0.3 * v, pan }); break;
      default: // pistol
        this.nz(t, 0.15, { f: lp(3800), g: 0.52 * v, pan }); this.tn(t, 0.09, { f: 175, f2: 55, g: 0.6 * v, pan });
        this.nz(t, 0.025, { type: 'highpass', f: 3000, g: 0.22 * crack, pan });
    }
  },
  botShot(dist, pan) {
    if (!this.ok()) return;
    const now = this.ctx.currentTime;
    if (now - this.botWindow > 0.1) { this.botWindow = now; this.botCount = 0; }
    if (++this.botCount > 5) return;
    const v = U.clamp(1 - dist / 70, 0.06, 0.55);
    this.shot('bot', { vol: v, far: U.clamp(dist / 45, 0, 1), pan });
  },
  hit() { if (!this.ok() || !this.gate('hit', 35)) return; const t = this.ctx.currentTime; this.tn(t, 0.05, { f: 1150, type: 'triangle', g: 0.22 }); this.nz(t, 0.03, { type: 'highpass', f: 5000, g: 0.08 }); },
  head() { if (!this.ok() || !this.gate('head', 45)) return; const t = this.ctx.currentTime; this.tn(t, 0.28, { f: 1568, g: 0.26 }); this.tn(t, 0.2, { f: 3136, g: 0.09 }); this.nz(t, 0.03, { type: 'highpass', f: 6000, g: 0.1 }); },
  kill() { if (!this.ok() || !this.gate('kill', 60)) return; const t = this.ctx.currentTime; this.tn(t, 0.07, { f: 660, type: 'square', g: 0.07 }); this.tn(t + 0.06, 0.14, { f: 990, type: 'square', g: 0.07 }); },
  reload() { if (!this.ok()) return; const t = this.ctx.currentTime; this.nz(t, 0.04, { type: 'highpass', f: 2500, g: 0.2 }); this.tn(t, 0.03, { f: 700, type: 'square', g: 0.05 }); this.nz(t + 0.28, 0.05, { type: 'highpass', f: 1800, g: 0.25 }); this.tn(t + 0.28, 0.04, { f: 500, type: 'square', g: 0.06 }); },
  empty() { if (!this.ok()) return; const t = this.ctx.currentTime; this.tn(t, 0.03, { f: 1500, type: 'square', g: 0.05 }); },
  hurt() { if (!this.ok()) return; const t = this.ctx.currentTime; this.nz(t, 0.16, { f: 650, g: 0.45 }); this.tn(t, 0.14, { f: 130, f2: 60, g: 0.4 }); },
  die() { if (!this.ok()) return; const t = this.ctx.currentTime; this.tn(t, 0.7, { f: 320, f2: 55, type: 'sawtooth', g: 0.12 }); this.nz(t, 0.4, { f: 900, f2: 150, g: 0.4 }); },
  ui() { if (!this.ok()) return; this.tn(this.ctx.currentTime, 0.045, { f: 880, type: 'triangle', g: 0.07 }); },
  tick() { if (!this.ok()) return; this.tn(this.ctx.currentTime, 0.02, { f: 1500, g: 0.025 }); },
  buy() {
    if (!this.ok()) return;
    const t = this.ctx.currentTime;
    [523, 659, 784, 1046, 1318].forEach((f, i) => this.tn(t + i * 0.045, 0.12, { f, type: 'square', g: 0.05 }));
    this.nz(t, 0.35, { type: 'bandpass', f: 400, f2: 5000, q: 1.5, g: 0.12 });
  },
  deny() { if (!this.ok()) return; const t = this.ctx.currentTime; this.tn(t, 0.14, { f: 150, type: 'square', g: 0.07 }); this.tn(t + 0.1, 0.16, { f: 110, type: 'square', g: 0.07 }); },
  chat() { if (!this.ok() || !this.gate('chat', 90)) return; this.tn(this.ctx.currentTime, 0.04, { f: 1250, g: 0.035 }); },
  salt() { if (!this.ok() || !this.gate('salt', 120)) return; const t = this.ctx.currentTime; for (let i = 0; i < 3; i++) this.tn(t + i * 0.04, 0.06, { f: 2200 + Math.random() * 1400, g: 0.035 }); },
  coin() { if (!this.ok() || !this.gate('coin', 80)) return; const t = this.ctx.currentTime; this.tn(t, 0.08, { f: 1318, type: 'square', g: 0.05 }); this.tn(t + 0.07, 0.2, { f: 1760, type: 'square', g: 0.05 }); },
  pop() {
    if (!this.ok() || !this.gate('pop', 90)) return;
    const t = this.ctx.currentTime;
    this.nz(t, 0.25, { type: 'bandpass', f: 1300, q: 1.4, g: 0.55 }); this.tn(t, 0.14, { f: 420, f2: 90, g: 0.5 });
    for (let i = 0; i < 4; i++) this.tn(t + 0.05 + i * 0.03, 0.08, { f: 1800 + Math.random() * 2400, g: 0.04 });
  },
  freeze() { if (!this.ok()) return; const t = this.ctx.currentTime; this.nz(t, 0.9, { type: 'bandpass', f: 5000, f2: 300, q: 3, g: 0.4 }); this.tn(t, 0.7, { f: 1300, f2: 180, type: 'triangle', g: 0.18 }); },
  blink() { if (!this.ok()) return; const t = this.ctx.currentTime; this.tn(t, 0.2, { f: 280, f2: 2200, g: 0.25 }); this.nz(t, 0.2, { type: 'highpass', f: 2200, g: 0.18 }); },
  jump() { if (!this.ok()) return; this.nz(this.ctx.currentTime, 0.08, { f: 520, g: 0.12 }); },
  land() { if (!this.ok()) return; this.nz(this.ctx.currentTime, 0.1, { f: 320, g: 0.2 }); },
  step() { if (!this.ok()) return; this.nz(this.ctx.currentTime, 0.05, { f: 650 + Math.random() * 350, g: 0.05 }); },
  beep(hi) { if (!this.ok()) return; this.tn(this.ctx.currentTime, hi ? 0.35 : 0.12, { f: hi ? 1320 : 880, type: 'square', g: 0.07 }); },
  horn() { if (!this.ok()) return; const t = this.ctx.currentTime; [392, 494, 587].forEach(f => this.tn(t, 0.9, { f, type: 'sawtooth', g: 0.045, a: 0.02 })); },
  streak(n) { if (!this.ok() || !this.gate('streak', 150)) return; const t = this.ctx.currentTime; for (let i = 0; i < Math.min(n, 6); i++) this.tn(t + i * 0.05, 0.1, { f: 660 * Math.pow(1.12, i), type: 'square', g: 0.045 }); },
};
