'use strict';
/* =========================================================================
   Input, main loop, boot
   ========================================================================= */
const Input = {
  keys: {}, pressed: {}, mdx: 0, mdy: 0, fireHeld: false, firePressed: false, altHeld: false, wheel: 0,
  locked: false, noLock: false, touch: false, touchMove: [0, 0], touchJump: false, touchFire: false, touchScope: false,

  init() {
    this.touch = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches && 'ontouchstart' in window);
    window.addEventListener('keydown', e => this.keyDown(e));
    window.addEventListener('keyup', e => { this.keys[e.code] = false; });
    document.addEventListener('mousemove', e => {
      if (Game.mode !== 'match' || !Match.on || Match.paused) return;
      if (this.locked || this.noLock) {
        let dx = e.movementX || 0, dy = e.movementY || 0;
        if (Math.abs(dx) > 300 || Math.abs(dy) > 300) return; // browser glitch spikes
        this.mdx += dx; this.mdy += dy;
      }
    });
    document.getElementById('gl').addEventListener('mousedown', () => {
      // clicking the 3D view grabs the mouse again, e.g. to take over from AFK FARM
      if (Game.mode === 'match' && Match.on && !this.locked && !this.noLock && !this.touch && !Match.paused && (Match.phase === 'play' || Match.phase === 'countdown')) this.lock();
    });
    document.addEventListener('mousedown', e => {
      SFX.init();
      if (Game.mode !== 'match' || !Match.on || Match.paused || Match.phase === 'prompt' || Match.phase === 'over') return;
      if (!(this.locked || this.noLock)) return;
      if (e.button === 0) { this.fireHeld = true; this.firePressed = true; }
      if (e.button === 2) this.altHeld = true;
    });
    document.addEventListener('mouseup', e => {
      if (e.button === 0) this.fireHeld = false;
      if (e.button === 2) this.altHeld = false;
    });
    document.addEventListener('wheel', e => { if (Game.mode === 'match' && this.locked) this.wheel += Math.sign(e.deltaY); }, { passive: true });
    document.addEventListener('contextmenu', e => { if (Game.mode === 'match') e.preventDefault(); });
    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === document.getElementById('gl');
      if (this.locked) { this.everLocked = true; this.noLock = false; }
      if (!Match.on) return;
      if (this.locked) {
        if (Match.phase === 'prompt') Match.begin();
        else if (Match.paused) Match.resume();
      } else {
        this.fireHeld = false; this.altHeld = false; this.keys = {};
        Chat.typing = false;
        if (Match.phase === 'countdown' || Match.phase === 'play') Match.pause();
      }
    });
    document.addEventListener('pointerlockerror', () => this.lockFailed());
    window.addEventListener('blur', () => { this.keys = {}; this.fireHeld = false; this.altHeld = false; });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { Save.save(); if (Game.mode === 'match' && !Match.afk) Match.pause(); }
    });
    if (this.touch) this.initTouch();
  },
  keyDown(e) {
    const code = e.code;
    if (Game.mode === 'match' && Match.on) {
      if (Chat.typing) {
        e.preventDefault();
        if (code === 'Enter') { Chat.playerSay(Chat.draft); Chat.typing = false; Chat.draft = ''; }
        else if (code === 'Escape') { Chat.typing = false; Chat.draft = ''; }
        else if (code === 'Backspace') Chat.draft = Chat.draft.slice(0, -1);
        else if (e.key && e.key.length === 1 && Chat.draft.length < 90) Chat.draft += e.key;
        return;
      }
      if (['Tab', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Slash'].includes(code)) e.preventDefault();
      if ((code === 'KeyT' || code === 'Enter') && Match.phase === 'play' && !Match.paused) {
        e.preventDefault(); Chat.typing = true; Chat.draft = ''; this.keys = {}; this.fireHeld = false; return;
      }
      if (code === 'KeyF' && Match.phase === 'play' && !e.repeat) Match.toggleAfk();
      if (code === 'Escape' && (this.noLock || this.touch) && Match.phase !== 'over') { if (Match.paused) Match.resume(); else Match.pause(); }
    } else if (code === 'Escape') Hub.closeModal();
    if (!this.keys[code]) this.pressed[code] = true;
    this.keys[code] = true;
  },
  lock() {
    const cv = document.getElementById('gl');
    if (!cv.requestPointerLock) { this.lockFailed(); return; }
    const fail = () => this.lockFailed();
    try {
      const r = cv.requestPointerLock({ unadjustedMovement: true });
      if (r && r.catch) r.catch(err => {
        // raw mouse input is optional; retry plain lock when that is what got refused
        if (err && err.name === 'NotSupportedError') {
          try { const r2 = cv.requestPointerLock(); if (r2 && r2.catch) r2.catch(fail); } catch (e2) { fail(); }
        } else fail();
      });
    } catch (err) {
      try { cv.requestPointerLock(); } catch (err2) { fail(); }
    }
  },
  lockFailed() {
    if (this.locked) return;
    const now = performance.now();
    if (now - (this.failAt || 0) < 400) return;
    this.failAt = now;
    // browsers refuse a re-lock for about a second after Esc; that is not a reason to give up on mouse lock
    if (this.everLocked) { if (Match.on) Hub.toast('Click again to grab the mouse.', ''); return; }
    this.noLock = true;
    if (!Match.on) return;
    Hub.toast('Mouse lock is blocked here: move the mouse inside the window, or turn with the arrow keys.', '');
    if (Match.phase === 'prompt') Match.begin(); else if (Match.paused) Match.resume();
  },
  unlock() { if (document.pointerLockElement && document.exitPointerLock) document.exitPointerLock(); },
  endFrame() {
    this.pressed = {}; this.firePressed = false; this.mdx = 0; this.mdy = 0; this.wheel = 0; this.touchJump = false;
  },
  initTouch() {
    const stick = document.getElementById('t-stick'), look = document.getElementById('t-look'), knob = stick.querySelector('i');
    let sid = null, sx = 0, sy = 0, lid = null, lx = 0, ly = 0;
    stick.addEventListener('touchstart', e => { e.preventDefault(); const t = e.changedTouches[0]; sid = t.identifier; sx = t.clientX; sy = t.clientY; }, { passive: false });
    stick.addEventListener('touchmove', e => {
      e.preventDefault();
      for (const t of e.changedTouches) if (t.identifier === sid) {
        const dx = U.clamp((t.clientX - sx) / 50, -1, 1), dy = U.clamp((t.clientY - sy) / 50, -1, 1);
        this.touchMove[0] = dx; this.touchMove[1] = -dy;
        knob.style.transform = `translate(${dx * 30}px, ${dy * 30}px)`;
      }
    }, { passive: false });
    const endStick = e => { for (const t of e.changedTouches) if (t.identifier === sid) { sid = null; this.touchMove[0] = this.touchMove[1] = 0; knob.style.transform = ''; } };
    stick.addEventListener('touchend', endStick); stick.addEventListener('touchcancel', endStick);
    look.addEventListener('touchstart', e => { e.preventDefault(); const t = e.changedTouches[0]; lid = t.identifier; lx = t.clientX; ly = t.clientY; }, { passive: false });
    look.addEventListener('touchmove', e => {
      e.preventDefault();
      for (const t of e.changedTouches) if (t.identifier === lid) { this.mdx += (t.clientX - lx) * 1.6; this.mdy += (t.clientY - ly) * 1.6; lx = t.clientX; ly = t.clientY; }
    }, { passive: false });
    const endLook = e => { for (const t of e.changedTouches) if (t.identifier === lid) lid = null; };
    look.addEventListener('touchend', endLook); look.addEventListener('touchcancel', endLook);
    const hold = (id, on, off) => {
      const b = document.getElementById(id);
      b.addEventListener('touchstart', e => { e.preventDefault(); SFX.init(); on(); }, { passive: false });
      b.addEventListener('touchend', e => { e.preventDefault(); if (off) off(); }, { passive: false });
    };
    hold('t-fire', () => { this.touchFire = true; this.firePressed = true; }, () => { this.touchFire = false; });
    hold('t-jump', () => { this.touchJump = true; });
    hold('t-reload', () => { this.pressed.KeyR = true; });
    hold('t-pause', () => { if (Match.paused) Match.resume(); else Match.pause(); });
  },
};

const Game = {
  mode: 'hub', last: 0, fps: 60, fpsAcc: 0, fpsN: 0, errors: 0,
  dropIn() {
    SFX.init();
    if (Input.touch) {
      if (Match.phase === 'prompt') Match.begin(); else Match.resume();
      return;
    }
    // always ask for mouse lock; if the browser refuses, lockFailed() falls back to free-mouse play
    Input.failAt = 0;
    Input.lock();
  },
  loop(now) {
    const dt = Math.min(0.05, Math.max(0, (now - this.last) / 1000));
    this.last = now;
    this.fpsAcc += dt; this.fpsN++;
    if (this.fpsAcc > 0.5) { this.fps = Math.round(this.fpsN / this.fpsAcc); this.fpsAcc = 0; this.fpsN = 0; }
    try {
      GFX.resize();
      if (this.mode === 'match') { Match.update(dt); Match.render(); }
      else { Hub.update(dt); Hub.render3D(); }
      HUD.draw(dt);
    } catch (err) {
      this.errors++;
      if (this.errors < 5) console.error(err);
    }
    Input.endFrame();
    requestAnimationFrame(t => this.loop(t));
  },
};

function boot(hot) {
  Save.load(hot && hot.save);
  Shop.compute();
  GFX.quality = Save.data.settings.quality || 1;
  SFX.vol = Save.data.settings.vol;
  if (!GFX.init(document.getElementById('gl'))) {
    document.getElementById('nogl').hidden = false;
    document.getElementById('hub').hidden = true;
    return;
  }
  HUD.init();
  Hub.init();
  Input.init();
  Hub.show();
  window.addEventListener('pagehide', () => Save.save());
  setInterval(() => Save.save(), 15000);
  requestAnimationFrame(t => { Game.last = t; Game.loop(t); });
}

// debug + test hooks
window.TL_DEBUG = {
  give(cr, salt) { Save.data.credits += cr || 0; Save.data.salt += salt || 0; if (Game.mode === 'hub') Hub.render(); },
  own(ids) { for (const id of ids) Save.data.owned[id] = true; Shop.compute(); if (Game.mode === 'hub') Hub.render(); },
  buyAll() {
    for (const u of UPGRADES) Save.data.owned[u.id] = true;
    for (const m of MAPS) Save.data.maps[m.id] = true;
    for (const w of WEAPONS) Save.data.weapons[w.id] = true;
    Shop.compute(); if (Game.mode === 'hub') Hub.render();
  },
  start(id, auto) { Save.data.maps[id] = true; Match.start(id, { auto: !!auto }); if (!auto) Match.begin(); },
  step(sec) { const n = Math.round(sec * 60); for (let i = 0; i < n && Match.on; i++) { Match.update(1 / 60); Input.endFrame(); } },
  afk(on) { Match.afk = !!on; },
  tab(t) { Hub.setTab(t); },
  look(yaw, pitch) { Match.p.yaw = yaw; Match.p.pitch = pitch; },
  state() {
    return {
      mode: Game.mode, phase: Match.phase, paused: Match.paused, credits: Math.round(Save.data.credits), salt: Save.data.salt,
      kills: Match.p ? Match.p.kills : 0, deaths: Match.p ? Match.p.deaths : 0, hp: Match.p ? Math.round(Match.p.hp) : 0,
      bots: Match.bots.filter(b => b.alive).length, sus: Math.round(Chat.sus), chat: Chat.log.length, errors: Game.errors, fps: Game.fps,
      botKills: Match.bots.reduce((a, b) => a + b.kills, 0), time: Math.round(Match.time),
    };
  },
};

(function start() {
  const hot = window.claude && window.claude.hot;
  try { if (hot && hot.snapshot) hot.snapshot(() => ({ save: Save.data })); } catch (e) { /* optional */ }
  if (hot && hot.ready) hot.ready(boot); else boot((hot && hot.data) || {});
})();
