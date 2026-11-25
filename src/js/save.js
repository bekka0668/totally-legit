'use strict';
/* =========================================================================
   Save data + shop/economy rules + computed cheat stats
   ========================================================================= */
const SAVE_KEY = 'totally-legit-save-v1';

const Save = {
  data: null,
  defaults() {
    return {
      v: 1, credits: 0, salt: 0, smurf: 0,
      owned: {}, off: {},
      weapons: { pistol: true }, equipped: 'pistol',
      skins: { factory: true }, skinOf: {},
      xhair: { style: 'cross', color: '#7cffb2', size: 7, gap: 4, thick: 2, outline: true, dot: false },
      xhairs: { cross: true, dot: true },
      killfx: 'scrap', killfxs: { scrap: true },
      maps: { closet: true }, lastMap: 'closet', modes: { ffa: true }, mode: 'ffa',
      stats: {
        kills: 0, deaths: 0, hs: 0, matches: 0, wins: 0, crEarned: 0, crSpent: 0, saltEarned: 0, reports: 0,
        ragequits: 0, shots: 0, hits: 0, playTime: 0, bestStreak: 0, peakSus: 0, chatMsgs: 0, bestMatch: 0,
      },
      settings: { name: 'legit_player', sens: 1, fov: 74, vol: 0.7, quality: 1, dmgNums: true, shake: true, fps: false, invert: false },
      flags: { intro: false, firstMatch: false, autoQueue: true, banditHint: false },
      contracts: [], ach: {}, rankSeen: 0, det: 0,
    };
  },
  isObj(o) { return o && typeof o === 'object' && !Array.isArray(o); },
  merge(def, d) {
    const out = Object.assign({}, def);
    if (!this.isObj(d)) return out;
    for (const k of Object.keys(d)) {
      if (this.isObj(def[k]) && this.isObj(d[k])) out[k] = this.merge(def[k], d[k]);
      else if (d[k] !== undefined && d[k] !== null) out[k] = d[k];
    }
    return out;
  },
  load(hot) {
    let d = null;
    if (hot && this.isObj(hot)) d = hot;
    else {
      try { const raw = localStorage.getItem(SAVE_KEY); if (raw) d = JSON.parse(raw); } catch (e) { d = null; }
    }
    this.data = this.merge(this.defaults(), d || {});
    if (!Number.isFinite(this.data.credits)) this.data.credits = 0;
    if (!Number.isFinite(this.data.salt)) this.data.salt = 0;
  },
  save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.data)); } catch (e) { /* storage blocked: progress lives for this session */ }
  },
  exportCode() {
    try { return btoa(unescape(encodeURIComponent(JSON.stringify(this.data)))); } catch (e) { return ''; }
  },
  importCode(code) {
    try {
      const d = JSON.parse(decodeURIComponent(escape(atob(String(code).trim()))));
      if (!this.isObj(d) || d.v !== 1) return false;
      this.data = this.merge(this.defaults(), d);
      this.save();
      Shop.compute();
      return true;
    } catch (e) { return false; }
  },
  reset() { const keepSettings = this.data.settings; this.data = this.defaults(); this.data.settings = keepSettings; this.save(); Shop.compute(); },
};

const Shop = {
  S: null,
  owned(id) { return !!Save.data.owned[id]; },
  modOn(mod) { return !Save.data.off[mod]; },
  active(id) { const u = UPGRADE_BY_ID[id]; return !!u && this.owned(id) && this.modOn(u.mod); },
  state(id) {
    if (this.owned(id)) return 'owned';
    const u = UPGRADE_BY_ID[id];
    return (u.req || []).every(r => this.owned(r)) ? 'available' : 'locked';
  },
  modProgress(mod) {
    const list = UPGRADES.filter(u => u.mod === mod);
    return { owned: list.filter(u => this.owned(u.id)).length, total: list.length };
  },
  affordableCount() {
    return UPGRADES.filter(u => this.state(u.id) === 'available' && Save.data.credits >= u.cost).length;
  },
  spend(n) {
    if (Save.data.credits < n) return false;
    Save.data.credits -= n; Save.data.stats.crSpent += n; return true;
  },
  buy(id) {
    const u = UPGRADE_BY_ID[id];
    if (!u || this.state(id) !== 'available' || !this.spend(u.cost)) return false;
    Save.data.owned[id] = true;
    this.compute(); Save.save();
    return true;
  },
  buyMap(id) {
    const m = MAP_BY_ID[id];
    if (!m || Save.data.maps[id] || !this.spend(m.unlock)) return false;
    Save.data.maps[id] = true; Save.save(); return true;
  },
  modeOwned(id) { return id === 'ffa' || !!Save.data.modes[id]; },
  nextMode() { return MODES.find(m => !this.modeOwned(m.id)); },
  buyMode(id) {
    const m = MODE_BY_ID[id], next = this.nextMode();
    if (!m || this.modeOwned(id) || !next || next.id !== id || !this.spend(m.cost)) return false;
    Save.data.modes[id] = true; Save.data.mode = id; Save.save(); return true;
  },
  buyWeapon(id) {
    const w = WEAPON_BY_ID[id];
    if (!w || Save.data.weapons[id] || !this.spend(w.cost)) return false;
    Save.data.weapons[id] = true; Save.data.equipped = id; Save.save(); return true;
  },
  spendSalt(n) {
    if (Save.data.salt < n) return false;
    Save.data.salt -= n; return true;
  },
  buyCosmetic(kind, id) {
    const table = kind === 'skin' ? SKINS : kind === 'xhair' ? XHAIRS : KILLFX;
    const bag = kind === 'skin' ? 'skins' : kind === 'xhair' ? 'xhairs' : 'killfxs';
    const item = table.find(i => i.id === id);
    if (!item || Save.data[bag][id] || !this.spendSalt(item.cost)) return false;
    Save.data[bag][id] = true; Save.save(); return true;
  },
  panic: false,
  // the panic key unloads everything except the stealth modules themselves
  live(id) {
    if (!this.active(id)) return false;
    if (!this.panic) return true;
    const m = MODULE_BY_ID[UPGRADE_BY_ID[id].mod];
    return !!(m && m.stealth);
  },
  riskOf(mod) { return UPGRADES.filter(u => (!mod || u.mod === mod) && this.live(u.id)).reduce((t, u) => t + u.risk, 0); },
  compute() {
    const a = id => this.live(id);
    const S = {};
    // LOCK-ON
    S.aim = a('aim1');
    S.aimStr = a('aim2') ? 10 : 3.2;
    S.aimFov = (a('aim8') ? 180 : a('aim3') ? 18 : 7) * DEG;
    S.aimHead = a('aim4'); S.aimAlways = a('aim5'); S.aimSnap = a('aim6'); S.aimSilent = a('aim7'); S.spin = a('aim8');
    // X-RAY
    S.chams = a('esp1'); S.boxes = a('esp2'); S.names = a('esp3'); S.hpbars = a('esp4'); S.lines = a('esp5'); S.radar = a('esp6'); S.ambush = a('esp7');
    // TRIGGER HAPPY
    S.trig = a('trg1'); S.trigDelay = a('trg4') ? 0 : a('trg2') ? 0.08 : 0.25; S.fullAuto = a('trg3'); S.tacReload = a('trg5'); S.doubleTap = a('trg6');
    // BIGHEAD
    S.hbBody = a('hb5') ? 3.5 : a('hb2') ? 2 : a('hb1') ? 1.5 : 1;
    S.headVisual = a('hb5') ? 3.5 : a('hb3') ? 2.2 : 1;
    S.hbHead = Math.max(S.hbBody, S.headVisual);
    S.allHead = a('hb4');
    // STEADY (you start with zero skill: double spread + a wobbly crosshair)
    S.sway = a('st3') ? 0 : a('st1') ? 0.4 : 1;
    S.spread = a('st3') ? 0 : a('st1') ? 1.2 : 1.6;
    S.recoil = a('st2') ? 0 : 1;
    S.fireRate = (a('st4') ? 1.35 : 1) * (a('st5') ? 1.8 : 1) * (a('trg3') ? 1.15 : 1);
    // ZOOMIES
    S.speed = a('mv6') ? 2.5 : a('mv4') ? 1.75 : a('mv1') ? 1.3 : 1;
    S.bhop = a('mv2'); S.airJumps = a('mv3') ? 1 : 0; S.blink = a('mv5');
    // BOTTOMLESS
    S.mag = a('am1') ? 1.5 : 1; S.reload = a('am2') ? 0.5 : 1; S.infAmmo = a('am4'); S.pierce = a('am3'); S.wallbang = a('am5'); S.popper = a('am6'); S.magic = a('am7');
    // PLOT ARMOR
    S.dmgTaken = a('pa3') ? 0.35 : a('pa1') ? 0.7 : 1; S.regen = a('pa2'); S.reflect = a('pa4'); S.ghost = a('pa5'); S.immortal = a('pa6');
    // MONEY GLITCH
    S.cr = (a('mn1') ? 1.25 : 1) * (a('mn6') ? 2 : 1) * (a('mn8') ? 2 : 1) * this.smurfMult();
    S.hsBonus = a('mn2') ? 0.5 : 0; S.streak = a('mn3'); S.overtime = a('mn4') ? 30 : 0; S.salt = a('mn5') ? 2 : 1; S.afk = a('mn7');
    // LAG SWITCH
    S.botAcc = a('lg7') ? 0.06 : a('lg1') ? 0.65 : 1; S.botSpeed = a('lg2') ? 0.65 : 1; S.freeze = a('lg4');
    S.extraBots = (a('lg3') ? 2 : 0) + (a('lg5') ? 4 : 0); S.magnet = a('lg6');
    // KILLSTREAK.EXE
    S.recon = a('ks1'); S.carePkg = a('ks2'); S.airstrike = a('ks3'); S.hardline = a('ks4'); S.orbital = a('ks5'); S.nuke = a('ks6');
    // SOCIAL HACK
    S.susGain = a('so1') ? 0.65 : 1; S.salt *= a('so2') ? 1.5 : 1; S.admin = a('so3'); S.ragebait = a('so4'); S.bounty = a('so5'); S.clip = a('so6');
    // GUNSMITH
    S.dmgMul = a('gs1') ? 1.2 : 1; S.hsMul = a('gs2') ? 1.5 : 1; S.vamp = a('gs3'); S.exRounds = a('gs4'); S.ricochet = a('gs5'); S.chain = a('gs6');
    // CHRONO
    S.reload *= a('ch1') ? 0.7 : 1; S.swapMul = a('ch1') ? 0.7 : 1; S.slowmo = a('ch2'); S.rewind = a('ch3'); S.matrix = a('ch4'); S.timeThief = a('ch5');
    // INSIDER
    S.chips = a('in1'); S.chipRange = a('in2') ? 10 : 1.8; S.interest = a('in3'); S.sponsor = a('in4'); S.insider = a('in5');
    // GHOSTWARE
    S.scanMul = (a('gh1') ? 0.7 : 1) * (a('gh6') ? 0.6 : 1) * (a('gh7') ? 0 : 1); S.humanizer = a('gh2'); S.kernel = a('gh3');
    S.panicKey = a('gh4'); S.streamProof = a('gh5'); S.coolMul = a('gh6') ? 2 : 1;
    // SPOOFER
    S.shredder = a('sp1'); S.bribe = a('sp2'); S.hwid = a('sp3'); S.alt = a('sp4'); S.appeal = a('sp5');
    S.risk = this.riskOf();
    this.S = S;
    return S;
  },
  // prestige: start over on a fresh account, keep cosmetics, earn more forever
  smurfMult(lvl) { return 1 + 0.5 * (lvl == null ? (Save.data.smurf || 0) : lvl); },
  smurfNeeds() {
    const d = Save.data;
    return { maps: MAPS.every(m => d.maps[m.id]), cheats: Object.keys(d.owned).filter(k => d.owned[k]).length, need: 40 };
  },
  canSmurf() { const n = this.smurfNeeds(); return n.maps && n.cheats >= n.need; },
  smurf() {
    if (!this.canSmurf()) return false;
    const d = Save.data;
    const keep = { salt: d.salt, skins: d.skins, skinOf: d.skinOf, xhair: d.xhair, xhairs: d.xhairs, killfx: d.killfx, killfxs: d.killfxs,
      stats: d.stats, settings: d.settings, flags: d.flags, smurf: (d.smurf || 0) + 1 };
    Save.data = Save.merge(Save.defaults(), keep);
    this.compute(); Save.save();
    return true;
  },
  activeModuleNames() {
    return MODULES.filter(m => this.modOn(m.id) && UPGRADES.some(u => u.mod === m.id && this.owned(u.id))).map(m => m.name);
  },
};
