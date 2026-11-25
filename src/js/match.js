'use strict';
/* =========================================================================
   Match: player controller, weapons, bots, cheats, credits, effects
   ========================================================================= */
const PLAYER_SPEED = 5.2, AIR_ACCEL = 22, GRAVITY = 20, JUMP_V = 6.8, EYE_H = 1.62;

const Match = {
  on: false, phase: 'idle', paused: false, def: null, time: 0, total: 0, countdown: 0, clock: 0,
  p: null, bots: [], parts: [], partIdx: 0, tracers: [], decals: [], decalIdx: 0, floaters: [], blasts: [], pops: [],
  st: null, earn: null, freezeT: 0, aimTarget: null, aimPt: null, afk: false, angHist: [], autoT: 0, leftEarly: false,
  fx: null, cam: null, deathCam: null, vmMat: M4.create(), tmpM: M4.create(), namePool: [], lastCount: 4,
  mode: null, score: null, intel: null, spotT: 0, round: 0, roundsWon: 0, roundsLost: 0, roundTime: 0, roundOver: false, roundGap: 0,
  countLabel: '', blueSpawns: [], redSpawns: [],

  /* ---------------- lifecycle ---------------- */
  start(mapId, opts = {}) {
    const def = MAP_BY_ID[mapId];
    if (!def) return;
    Shop.panic = false;
    const S = Shop.compute();
    this.def = def;
    World.load(def);
    GFX.setStatic(World.inst);
    GFX.setEnv(def.env);
    this.on = true; this.paused = false; this.leftEarly = false;
    this.phase = opts.auto ? 'countdown' : 'prompt';
    this.countdown = 3; this.lastCount = 4;
    this.total = this.time = def.time + S.overtime;
    this.clock = 0; this.freezeT = 0; this.autoT = 0;
    this.parts = []; this.partIdx = 0; this.tracers = []; this.decals = []; this.decalIdx = 0; this.floaters = []; this.blasts = []; this.pops = [];
    this.angHist = []; this.aimTarget = null; this.deathCam = null; this.afkPlan = null;
    this.fx = { flash: 0, muzzle: 0, shake: 0, fovKick: 0, hurt: [], hitmark: 0, hitHead: false, hitKill: false, lowHp: 0, freezeTint: 0 };
    this.st = { kills: 0, deaths: 0, hs: 0, shots: 0, hits: 0, best: 0, multiMax: 1, allyKills: 0 };
    this.earn = { base: 0, bonus: 0, mult: 0, win: 0, total: 0, salt: 0, team: 0, rounds: 0, special: 0, streak: 0, kick: 0, clip: 0, xp: 0,
      chips: 0, interest: 0, bribe: 0, forfeit: 0, fine: 0, style: 0, streakx: 0, gun: 0 };
    this.bossDown = false; this.ggIdx = 0;
    this.afk = !!(opts.auto && S.afk);
    // mode + teams
    let mode = MODE_BY_ID[opts.mode] || MODE_BY_ID[Save.data.mode] || MODES[0];
    if (!Shop.modeOwned(mode.id)) mode = MODES[0];
    if (mode.id === 'tdm' && lineup(def, 'tdm').allies < 1) mode = MODES[0];
    this.mode = mode;
    this.score = { blue: 0, red: 0 };
    this.intel = null; this.spotT = 0;
    this.round = 0; this.roundsWon = 0; this.roundsLost = 0; this.roundOver = false; this.roundGap = 0; this.countLabel = '';
    // team bases: the spawns nearest your start belong to blue, the far half to red
    const bySide = World.spawns.slice().sort((a, b) => V.dist2D(a, World.pspawn) - V.dist2D(b, World.pspawn));
    const half = Math.max(1, Math.floor(bySide.length / 2));
    this.blueSpawns = bySide.slice(0, half);
    this.redSpawns = bySide.length > 1 ? bySide.slice(half) : bySide.slice();
    // player
    const p = this.p = this.newPlayer();
    V.copy(p.pos, World.pspawn);
    p.yaw = this.yawToCenter(p.pos);
    for (const w of WEAPONS) if (Save.data.weapons[w.id]) p.ammo[w.id] = this.magSize(w);
    if (!Save.data.weapons[p.weapon]) p.weapon = 'pistol';
    // bots
    this.namePool = U.shuffle(BOT_NAMES.slice());
    this.bots = [];
    const lu = lineup(def, mode.id, S.extraBots);
    for (let i = 0; i < lu.allies + lu.foes; i++) {
      const team = mode.ffa ? 'ffa' + i : (i < lu.allies ? 'blue' : 'red');
      this.bots.push(this.newBot(this.namePool.pop() || ('bot_' + i), i, team));
    }
    for (const b of this.bots) this.spawnBot(b, true);
    if (mode.id === 'clutch') {
      this.round = 1;
      this.roundTime = mode.roundTime + (S.overtime ? 15 : 0);
      this.countLabel = 'ROUND 1';
    }
    Chat.reset();
    Chat.onMatchStart();
    Extras.onMatchStart();
    AC.onMatchStart();
    Style.onMatchStart();
    More.onMatchStart();
    if (mode.weapons) { p.weapon = mode.weapons[0]; for (const id of mode.weapons) p.ammo[id] = this.magSize(WEAPON_BY_ID[id]); }
    Save.data.lastMap = mapId;
    Game.mode = 'match';
    Hub.hide();
    HUD.enterMatch();
    this.computeAim();
    this.cam = this.camera();
  },
  begin() {
    if (this.phase === 'prompt') { this.phase = 'countdown'; this.countdown = 3; this.lastCount = 4; }
    this.paused = false;
    HUD.setOverlay(null);
  },
  pause() {
    if (!this.on || this.phase === 'over' || this.phase === 'prompt') return;
    if (this.afk) return;
    this.paused = true;
    Input.fireHeld = false; Input.altHeld = false;
    HUD.setOverlay('pause');
  },
  resume() { this.paused = false; HUD.setOverlay(null); },
  finish(early) {
    if (this.phase === 'over') return;
    this.leftEarly = !!early;
    this.phase = 'over';
    this.paused = false;
    const p = this.p, S = Shop.S;
    const board = this.board();
    const rank = board.findIndex(e => e.isPlayer) + 1;
    let won;
    switch (this.mode.id) {
      case 'squad': won = p.kills > p.deaths; break;
      case 'clutch': won = this.roundsWon > this.roundsLost; break;
      case 'tdm': won = this.score.blue > this.score.red; break;
      case 'gungame': won = this.ggIdx >= GUNGAME_ORDER.length; break;
      case 'boss': won = !!this.bossDown; break;
      default: won = rank === 1 && p.kills > 0;
    }
    const win = !early && won && !AC.banned && !AC.kicked;
    if (win) {
      const bonus = this.def.cr * (this.mode.win || 5) * S.cr * (S.sponsor ? 3 : 1) * S.winMul;
      this.earn.win = bonus; this.earn.total += bonus;
      Save.data.credits += bonus;
    }
    Extras.onMatchEnd(win, !!early);
    AC.onMatchEnd(win);
    Style.onMatchEnd(AC.banned);
    const s = Save.data.stats;
    s.matches++; if (win) s.wins++;
    s.roundsWon = (s.roundsWon || 0) + this.roundsWon;
    s.allyKills = (s.allyKills || 0) + (this.st.allyKills || 0);
    if (win && this.mode.id !== 'ffa') { s.modeWins = s.modeWins || {}; s.modeWins[this.mode.id] = (s.modeWins[this.mode.id] || 0) + 1; }
    s.kills += this.st.kills; s.deaths += this.st.deaths; s.hs += this.st.hs; s.shots += this.st.shots; s.hits += this.st.hits;
    s.crEarned += this.earn.total; s.saltEarned += this.earn.salt; s.reports += Chat.reports;
    s.peakSus = Math.max(s.peakSus, Math.round(Chat.peak)); s.bestStreak = Math.max(s.bestStreak, this.st.best);
    s.bestMatch = Math.max(s.bestMatch, Math.round(this.earn.total)); s.chatMsgs += Chat.msgs;
    s.playTime += this.clock;
    Extras.afterStats();
    Save.data.flags.firstMatch = true;
    Save.save();
    Input.unlock();
    Input.fireHeld = false;
    SFX.horn();
    HUD.showSummary({ rank, of: board.length, win, early: !!early && !AC.kicked && !AC.banned, banned: AC.banned, kicked: AC.kicked });
    if (this.afk && S.afk && Save.data.flags.autoQueue && !early) this.autoT = 7;
  },
  leave() {
    if (this.on && this.phase !== 'over') this.finish(true);
    this.on = false; this.phase = 'idle'; this.afk = false;
    Input.unlock();
    HUD.exitMatch();
    Game.mode = 'hub';
    Hub.show();
    const wave = AC.rollWave();
    if (wave) Hub.showWave(wave);
  },
  playAgain(auto) {
    const id = this.def.id;
    HUD.hideSummary();
    const wave = AC.rollWave();
    this.start(id, { auto: !!auto, mode: this.mode.id });
    if (wave) AC.announceWave(wave);
  },

  /* ---------------- factories ---------------- */
  newPlayer() {
    return {
      pos: [0, 0, 0], vel: [0, 0, 0], r: 0.34, h: 1.8, onGround: false, blocked: false,
      yaw: 0, pitch: 0, hp: 100, alive: true, respawnT: 0, lastHurt: -99, prot: 1.5,
      eye: [0, EYE_H, 0], aimDir: [0, 0, -1], aimYaw: 0, aimPitch: 0,
      weapon: Save.data.equipped || 'pistol', ammo: {}, reloadT: 0, reloadMax: 1, fireT: 0, switchT: 0, clickBuf: 0, trigT: 0,
      swayT: Math.random() * 10, swayX: 0, swayY: 0, recoil: 0, recoilYaw: 0, bloom: 0, moveSpread: 0, strafeRoll: 0,
      airJumps: 0, hop: 0, groundT: 0, walkPhase: 0, stepAcc: 0,
      kills: 0, deaths: 0, streak: 0, multi: 0, lastKillT: -99,
      freezeCD: 0, blinkCD: 0, lastBlinkT: -99, scoped: false, kick: 0, pump: 0, vmSwayX: 0, vmSwayY: 0,
    };
  },
  newBot(name, i, team) {
    team = team || ('ffa' + i);
    const pal = TEAM_ACCENTS[team];
    const acc = pal ? pal[i % pal.length] : BOT_ACCENTS[i % BOT_ACCENTS.length];
    return {
      id: i, name, team, pers: U.pick(PERSONAS), col: { body: U.pick(BOT_BODIES), dark: U.hex('#3a3f4a'), acc }, colHex: U.toHex(acc),
      pos: [0, 0, 0], vel: [0, 0, 0], r: 0.34, h: 1.8, onGround: false, blocked: false,
      yaw: 0, aimPitch: 0, hp: 100, alive: false, gone: false, respawnT: 0,
      target: null, canSee: false, seeT: 0, react: 0.6, lostT: 0, lastSeen: null, thinkT: Math.random() * 0.25,
      path: null, pathI: 0, repathAt: 0, fireT: 0.6, strafeDir: 1, strafeT: 0, stuckT: 0,
      walkPhase: Math.random() * 6, moveAmt: 0, hitFlash: 0, kills: 0, deaths: 0, aggroT: 0, sawPlayerT: -99,
      speedVar: U.rand(0.9, 1.1), accVar: U.rand(0.8, 1.2), bubble: null, bubbleT: 0, rejoinT: 0,
    };
  },
  yawToCenter(pos) {
    const c = [World.W * CS / 2, 0, World.H * CS / 2];
    return V.yawOf([c[0] - pos[0], 0, c[2] - pos[2]]);
  },
  magSize(w) { return Math.max(1, Math.round(w.mag * Shop.S.mag * (Shop.attOf(w.id).extmag ? 1.4 : 1))); },
  weapon() { return WEAPON_BY_ID[this.p.weapon] || WEAPONS[0]; },

  /* ---------------- spawning ---------------- */
  // pick a spawn from `list`, preferring spots far from `threats`
  pickFrom(list, threats) {
    if (!list || !list.length) list = World.spawns;
    const scored = list.map(s => {
      let d = 1e9;
      for (const t of threats) d = Math.min(d, V.dist2D(s, t));
      return { s, d: d + Math.random() * 6 };
    });
    scored.sort((a, b) => b.d - a.d);
    return U.pick(scored.slice(0, Math.max(1, Math.ceil(scored.length * 0.45)))).s.slice();
  },
  foePositions() { return this.bots.filter(b => b.alive && !b.gone && b.team !== 'blue').map(b => b.pos); },
  pickSpawn(forPlayer) {
    const p = this.p;
    return this.pickFrom(World.spawns, forPlayer ? this.foePositions() : (p && p.alive ? [p.pos] : []));
  },
  spawnNear(center, rmin, rmax) {
    for (let k = 0; k < 24; k++) {
      const c = World.randomReach();
      const d = V.dist2D(c, center);
      if (d >= rmin && d <= rmax) return c;
    }
    return null;
  },
  spawnBot(b, initial) {
    const S = Shop.S, p = this.p;
    let pos = null;
    if (S.magnet && !initial && p && p.alive && b.team !== 'blue') pos = this.spawnNear(p.pos, 8, 18);
    if (!pos && this.mode && !this.mode.ffa) {
      pos = b.team === 'blue' ? this.pickFrom(this.blueSpawns, this.foePositions()) : this.pickFrom(this.redSpawns, p && p.alive ? [p.pos] : []);
    }
    if (!pos) pos = this.pickSpawn(false);
    b.pos[0] = pos[0] + U.rand(-0.4, 0.4); b.pos[1] = 0; b.pos[2] = pos[2] + U.rand(-0.4, 0.4);
    b.vel[0] = b.vel[1] = b.vel[2] = 0;
    b.hp = 100; b.alive = true; b.yaw = this.yawToCenter(b.pos) + U.rand(-0.6, 0.6);
    b.target = null; b.canSee = false; b.path = null; b.seeT = 0; b.fireT = U.rand(0.3, 0.9); b.thinkT = Math.random() * 0.2;
    b.aggroT = 0; b.sawPlayerT = -99; b.stuckT = 0;
  },
  respawnPlayer() {
    const p = this.p;
    const pos = this.mode.id === 'tdm' ? this.pickFrom(this.blueSpawns, this.foePositions()) : this.pickSpawn(true);
    V.copy(p.pos, pos); V.set(p.vel, 0, 0, 0);
    p.hp = 100; p.alive = true; p.prot = 1.5; p.yaw = this.yawToCenter(p.pos); p.pitch = 0;
    for (const w of WEAPONS) if (Save.data.weapons[w.id]) p.ammo[w.id] = this.magSize(w);
    p.reloadT = 0; p.switchT = 0.3;
    if (this.mode.id === 'gungame') p.ammo[p.weapon] = this.magSize(this.weapon());
    if (this.mode.weapons) for (const id of this.mode.weapons) p.ammo[id] = this.magSize(WEAPON_BY_ID[id]);
    this.deathCam = null;
    HUD.setDead(null);
  },

  /* ---------------- main update ---------------- */
  update(dt) {
    if (!this.on) return;
    if (this.paused) { this.cam = this.camera(); GFX.setCamera(this.cam); return; }
    this.clock += dt;
    GFX.time = this.clock;
    const S = Shop.S;
    if (this.phase === 'countdown') {
      this.countdown -= dt;
      const c = Math.ceil(this.countdown);
      if (c !== this.lastCount && c > 0) {
        this.lastCount = c; SFX.beep(false);
        if (this.countLabel) { HUD.callout(this.countLabel, 'round'); this.countLabel = ''; } else HUD.callout(String(c), 'count');
      }
      if (this.countdown <= 0) { this.phase = 'play'; SFX.beep(true); HUD.callout('GO', 'count'); }
    } else if (this.phase === 'play') {
      if (this.mode.id === 'clutch') this.updateRound(dt);
      else {
        this.time -= dt;
        if (this.time <= 0) { this.time = 0; this.finish(false); }
      }
    } else if (this.phase === 'over') {
      if (this.autoT > 0) {
        this.autoT -= dt;
        HUD.autoQueue(this.autoT);
        if (this.autoT <= 0) { this.playAgain(true); return; }
      }
    }
    const live = this.phase === 'play';
    this.freezeT = Math.max(0, this.freezeT - dt);
    if (this.phase !== 'over') this.updatePlayer(dt, live, this.phase === 'countdown' || live);
    this.cam = this.camera();
    GFX.setCamera(this.cam);
    if (live) this.updateWeapon(dt);
    if (live) this.updateBots(dt * Extras.botTime());
    if (live) Extras.update(dt);
    if (this.phase === 'play') AC.update(dt);
    if (live) Style.update(dt);
    if (live) More.update(dt);
    this.updateFx(dt);
    Chat.update(dt);
  },

  /* ---------------- clutch rounds: one life each, wipe the squad ---------------- */
  updateRound(dt) {
    if (this.roundOver) {
      this.roundGap -= dt;
      if (this.roundGap <= 0) {
        if (this.roundsWon >= this.mode.rounds || this.roundsLost >= this.mode.rounds) this.finish(false);
        else this.startRound();
      }
      return;
    }
    this.roundTime -= dt;
    if (this.roundTime <= 0) { this.roundTime = 0; this.endRound(false, 'time'); }
  },
  startRound() {
    const S = Shop.S, p = this.p;
    this.round++;
    this.roundOver = false;
    this.roundTime = this.mode.roundTime + (S.overtime ? 15 : 0);
    for (const b of this.bots) {
      if (b.gone) {
        b.gone = false; b.name = this.namePool.pop() || ('bot_' + Math.floor(Math.random() * 999));
        b.kills = 0; b.deaths = 0; b.pers = U.pick(PERSONAS);
        Chat.onJoin(b);
      }
      this.spawnBot(b, true);
    }
    V.copy(p.pos, World.pspawn); V.set(p.vel, 0, 0, 0);
    p.hp = 100; p.alive = true; p.prot = 0; p.yaw = this.yawToCenter(p.pos); p.pitch = 0;
    for (const w of WEAPONS) if (Save.data.weapons[w.id]) p.ammo[w.id] = this.magSize(w);
    p.reloadT = 0; p.switchT = 0; p.scoped = false;
    this.deathCam = null; HUD.setDead(null);
    this.freezeT = 0; this.pops = []; this.intel = null; this.aimTarget = null;
    this.phase = 'countdown'; this.countdown = 2; this.lastCount = 3; this.countLabel = 'ROUND ' + this.round;
  },
  endRound(won, why) {
    if (this.roundOver || this.mode.id !== 'clutch') return;
    this.roundOver = true; this.roundGap = 2.6;
    if (won) {
      this.roundsWon++;
      const foes = this.bots.filter(b => b.team !== 'blue').length;
      const bonus = this.def.cr * foes * this.mode.roundBonus * Shop.S.cr;
      this.earn.rounds += bonus; this.earn.total += bonus; Save.data.credits += bonus;
      HUD.callout(`ROUND WON +${U.fmt(bonus)} CR`, 'multi');
      SFX.streak(4);
    } else {
      this.roundsLost++;
      HUD.callout(why === 'time' ? 'TIME UP' : 'ROUND LOST', 'multi');
    }
    Chat.onRound(won);
  },

  /* ---------------- player ---------------- */
  updatePlayer(dt, live, canLook) {
    const p = this.p, S = Shop.S, st = Save.data.settings;
    if (canLook && !this.afk) {
      const sens = 0.0022 * st.sens * (p.scoped ? 0.3 : 1) * (1 - 0.3 * (p.adsT || 0));
      p.yaw -= Input.mdx * sens;
      p.pitch -= Input.mdy * sens * (st.invert ? -1 : 1);
      const kt = (Input.keys.ArrowLeft ? 1 : 0) - (Input.keys.ArrowRight ? 1 : 0);
      const kp = (Input.keys.ArrowUp ? 1 : 0) - (Input.keys.ArrowDown ? 1 : 0);
      p.yaw += kt * 2.4 * dt * st.sens; p.pitch += kp * 1.6 * dt * st.sens;
    }
    p.vmSwayX = U.damp(p.vmSwayX, U.clamp(-Input.mdx * 0.0005, -0.035, 0.035), 10, dt);
    p.vmSwayY = U.damp(p.vmSwayY, U.clamp(Input.mdy * 0.0005, -0.035, 0.035), 10, dt);
    p.pitch = U.clamp(p.pitch, -1.5, 1.5);
    p.kick = U.damp(p.kick, 0, 14, dt);
    p.pump = U.damp(p.pump, 0, 7, dt);
    p.prot = Math.max(0, p.prot - dt);
    p.freezeCD = Math.max(0, p.freezeCD - dt);
    p.blinkCD = Math.max(0, p.blinkCD - dt);
    if (!p.alive) {
      p.respawnT -= dt;
      if (p.respawnT <= 0 && live) this.respawnPlayer();
      else HUD.setDead(this.deathCam, p.respawnT);
      this.computeAim();
      return;
    }
    // movement intent
    let fw = 0, sr = 0, jumpPress = false, jumpHeld = false;
    if (live && !Chat.typing) {
      if (this.afk) { const a = this.afkDrive(dt); fw = a.fw; sr = a.sr; jumpPress = jumpHeld = a.jump; }
      else {
        fw = (Input.keys.KeyW ? 1 : 0) - (Input.keys.KeyS ? 1 : 0) + Input.touchMove[1];
        sr = (Input.keys.KeyD ? 1 : 0) - (Input.keys.KeyA ? 1 : 0) + Input.touchMove[0];
        jumpPress = !!(Input.pressed.Space || Input.touchJump);
        jumpHeld = !!(Input.keys.Space || Input.touchJump);
      }
    }
    const sy = Math.sin(p.yaw), cy = Math.cos(p.yaw);
    let wx = -sy * fw + cy * sr, wz = -cy * fw - sy * sr;
    const wl = Math.hypot(wx, wz);
    if (wl > 1) { wx /= wl; wz /= wl; }
    // aiming down sights eases in and slows you down a bit
    p.adsT = U.damp(p.adsT || 0, p.ads ? 1 : 0, (Shop.attOf(p.weapon).holo ? 21 : 14) * S.adsFast, dt);
    const maxSpd = PLAYER_SPEED * S.speed * (p.scoped ? 0.55 : 1) * (1 - 0.35 * p.adsT);
    // without Bunny Hop, holding Space doesn't chain jumps: each jump needs its own press
    // (buffered briefly so a press just before landing still counts)
    p.jumpBuf = jumpPress ? 0.12 : Math.max(0, (p.jumpBuf || 0) - dt);
    const wantJump = S.bhop ? jumpHeld : p.jumpBuf > 0;
    if (p.onGround) {
      p.groundT += dt;
      if (wantJump) {
        p.jumpBuf = 0;
        p.vel[1] = JUMP_V * S.jump;
        if (S.bhop) {
          p.hop = Math.min(p.hop + 0.1, 0.7);
          const hs = Math.hypot(p.vel[0], p.vel[2]);
          const want = Math.max(hs, maxSpd * (1 + p.hop));
          if (wl > 0.01) { p.vel[0] = wx / Math.max(1, wl) * want; p.vel[2] = wz / Math.max(1, wl) * want; }
        } else {
          p.hop = 0;
          const k = 1 - Math.exp(-12 * dt);
          p.vel[0] += (wx * maxSpd - p.vel[0]) * k; p.vel[2] += (wz * maxSpd - p.vel[2]) * k;
          const hs = Math.hypot(p.vel[0], p.vel[2]);
          if (hs > maxSpd) { p.vel[0] *= maxSpd / hs; p.vel[2] *= maxSpd / hs; }
        }
        SFX.jump();
      } else {
        if (p.groundT > 0.25) p.hop = 0;
        const k = 1 - Math.exp(-(wl > 0.01 ? 12 : 11) * dt);
        p.vel[0] += (wx * maxSpd - p.vel[0]) * k; p.vel[2] += (wz * maxSpd - p.vel[2]) * k;
      }
    } else {
      p.groundT = 0;
      const cur = Math.hypot(p.vel[0], p.vel[2]);
      // only Bunny Hop lets you keep speed above a normal run in the air
      const cap = S.bhop ? Math.max(cur, maxSpd * (1 + p.hop)) : maxSpd;
      p.vel[0] += wx * AIR_ACCEL * S.airAccel * dt; p.vel[2] += wz * AIR_ACCEL * S.airAccel * dt;
      const n = Math.hypot(p.vel[0], p.vel[2]);
      if (n > cap) { p.vel[0] *= cap / n; p.vel[2] *= cap / n; }
      if (jumpPress && p.airJumps > 0) {
        p.airJumps--; p.vel[1] = JUMP_V * 0.92 * S.jump; SFX.jump();
        for (let i = 0; i < 6; i++) this.addPart(p.pos[0], p.pos[1] + 0.1, p.pos[2], U.rand(-2, 2), U.rand(0, 1), U.rand(-2, 2), 0.08, [0.8, 0.9, 1], 0.35, 2, 0.8, 0);
      }
    }
    p.vel[1] -= GRAVITY * (this.def.grav || 1) * dt;
    const wasGround = p.onGround, vyBefore = p.vel[1];
    World.move(p, p.vel[0] * dt, p.vel[1] * dt, p.vel[2] * dt);
    if (p.onGround) { p.airJumps = S.airJumps; if (!wasGround && vyBefore < -4) SFX.land(); }
    const hs = Math.hypot(p.vel[0], p.vel[2]);
    if (p.onGround && hs > 0.6) {
      p.walkPhase += hs * dt * 1.7;
      p.stepAcc += hs * dt;
      if (p.stepAcc > 2.3) { p.stepAcc = 0; SFX.step(); }
    }
    // moving costs accuracy, jumping costs a lot (worst right after takeoff); a short ease-in on landing
    p.airT = p.onGround ? 0 : (p.airT || 0) + dt;
    p.landT = p.onGround ? Math.max(0, (p.landT || 0) - dt) : 0.18;
    const moveK = U.clamp(hs / PLAYER_SPEED, 0, 2) * 0.042;
    const airK = p.onGround ? 0.06 * (p.landT / 0.18) : 0.1 + 0.05 * U.clamp(1 - p.airT / 0.4, 0, 1);
    p.moveSpread = (moveK + airK) * S.spread * 0.5 * S.airSpread;
    p.strafeRoll = U.damp(p.strafeRoll, -sr * 0.018, 8, dt);
    V.set(p.eye, p.pos[0], p.pos[1] + EYE_H, p.pos[2]);
    // "zero skill": the crosshair wanders until you buy steady hands
    p.swayT += dt;
    const sa = 0.018 * S.sway * (p.scoped ? 0.6 : 1) * (this.afk ? 0.3 : 1) * (1 - 0.5 * p.adsT);
    p.swayX = sa * (Math.sin(p.swayT * 1.3) * 0.6 + Math.sin(p.swayT * 2.9 + 1.3) * 0.4);
    p.swayY = sa * (Math.sin(p.swayT * 1.7 + 0.7) * 0.6 + Math.sin(p.swayT * 3.3 + 2.1) * 0.4) * 0.8;
    p.recoil = U.damp(p.recoil, 0, 6.5, dt);
    p.recoilYaw = U.damp(p.recoilYaw, 0, 6.5, dt);
    p.bloom = U.damp(p.bloom, 0, 5, dt);
    if (S.regen && this.clock - p.lastHurt > 3 && p.hp < 100) p.hp = Math.min(100, p.hp + 12 * dt);
    if (live) this.applyAim(dt);
    this.computeAim();
    // angle history for snap / spin detection
    this.angHist.push([this.clock, p.yaw, p.pitch]);
    while (this.angHist.length && this.clock - this.angHist[0][0] > 0.6) this.angHist.shift();
  },
  computeAim() {
    const p = this.p;
    p.aimYaw = p.yaw + p.swayX + p.recoilYaw;
    p.aimPitch = U.clamp(p.pitch + p.swayY + p.recoil, -1.55, 1.55);
    V.fromAngles(p.aimDir, p.aimYaw, p.aimPitch);
  },
  recentTurn(win) {
    const p = this.p, now = V.fromAngles([], p.yaw, p.pitch);
    let mx = 0;
    for (const h of this.angHist) {
      if (this.clock - h[0] > win) continue;
      mx = Math.max(mx, V.angleBetween(now, V.fromAngles([], h[1], h[2])));
    }
    return mx;
  },
  headPoint(b, out) {
    const hs = Shop.S.hbHead;
    out = out || [0, 0, 0];
    const k = b.scale || 1;
    out[0] = b.pos[0]; out[1] = b.pos[1] + (1.47 + 0.15 * hs) * k; out[2] = b.pos[2];
    return out;
  },
  chestPoint(b, out) { out = out || [0, 0, 0]; out[0] = b.pos[0]; out[1] = b.pos[1] + 1.15 * (b.scale || 1); out[2] = b.pos[2]; return out; },

  /* ---------------- LOCK-ON ---------------- */
  applyAim(dt) {
    const S = Shop.S, p = this.p;
    this.aimTarget = null;
    const firing = (Input.fireHeld || Input.touchFire) && !Chat.typing;
    const afkOnly = this.afk && !S.aim;
    if (!S.aim && !this.afk) return;
    if (S.aim && !(firing || S.aimAlways || this.afk)) return;
    const fov = afkOnly ? 24 * DEG : S.aimFov;
    const str = afkOnly ? 3 : S.aimStr;
    const head = S.aimHead;
    const cur = V.fromAngles([], p.yaw + p.swayX, p.pitch + p.swayY);
    let best = null, bestScore = 1e9;
    const pt = [0, 0, 0], d = [0, 0, 0];
    let bestPt = null;
    for (const b of this.bots) {
      if (!b.alive || b.gone || b.team === 'blue') continue;
      if (head) this.headPoint(b, pt); else this.chestPoint(b, pt);
      V.sub(d, pt, p.eye);
      const dist = V.len(d);
      if (dist < 0.3) continue;
      V.scale(d, d, 1 / dist);
      const ang = Math.acos(U.clamp(V.dot(d, cur), -1, 1));
      if (ang > fov) continue;
      const score = S.spin ? dist : ang + dist * 0.002;
      if (score >= bestScore) continue;
      if (!S.wallbang && !World.los(p.eye, pt)) continue;
      best = b; bestScore = score; bestPt = pt.slice();
    }
    if (!best) return;
    this.aimTarget = best; this.aimPt = bestPt;
    V.sub(d, bestPt, p.eye);
    const wantYaw = V.yawOf(d) - p.swayX - p.recoilYaw;
    const wantPitch = V.pitchOf(d) - p.swayY - p.recoil;
    if (S.aimSnap && !afkOnly) { p.yaw = wantYaw; p.pitch = U.clamp(wantPitch, -1.5, 1.5); }
    else {
      const k = 1 - Math.exp(-str * dt);
      p.yaw += U.angDiff(p.yaw, wantYaw) * k;
      p.pitch = U.clamp(p.pitch + (wantPitch - p.pitch) * k, -1.5, 1.5);
    }
  },

  /* ---------------- AFK FARM autopilot ---------------- */
  afkDrive(dt) {
    const p = this.p, S = Shop.S;
    if (!this.afkPlan || this.clock > this.afkPlan.until || !this.afkPlan.target || !this.afkPlan.target.alive) {
      let nb = null, nd = 1e9;
      for (const b of this.bots) if (b.alive && !b.gone && b.team !== 'blue') { const d = V.dist2D(b.pos, p.pos); if (d < nd) { nd = d; nb = b; } }
      this.afkPlan = { target: nb, path: nb ? World.findPath(p.pos, nb.pos) : null, i: 0, until: this.clock + 0.9 };
    }
    const plan = this.afkPlan, t = plan.target;
    let mx = 0, mz = 0;
    if (t && t.alive) {
      const d = V.dist2D(p.pos, t.pos);
      if (this.aimTarget && d < 14) {
        const ux = (t.pos[0] - p.pos[0]) / (d || 1), uz = (t.pos[2] - p.pos[2]) / (d || 1);
        const s = Math.sin(this.clock * 1.6) > 0 ? 1 : -1;
        mx = -uz * s; mz = ux * s;
        if (d > 7) { mx += ux * 0.7; mz += uz * 0.7; }
      } else if (plan.path && plan.i < plan.path.length) {
        const wp = plan.path[plan.i];
        const dx = wp[0] - p.pos[0], dz = wp[1] - p.pos[2], dd = Math.hypot(dx, dz);
        if (dd < 0.7) plan.i++; else { mx = dx / dd; mz = dz / dd; }
      }
      if (S.freeze && p.freezeCD <= 0 && this.visibleBotCount() >= 3) this.doFreeze();
      if (S.blink && p.blinkCD <= 0 && d > 14 && U.chance(dt * 2)) this.doBlink(t);
    }
    const fw = mx * -Math.sin(p.yaw) + mz * -Math.cos(p.yaw);
    const sr = mx * Math.cos(p.yaw) + mz * -Math.sin(p.yaw);
    if (!this.aimTarget && (mx || mz)) {
      p.yaw += U.angDiff(p.yaw, Math.atan2(-mx, -mz)) * (1 - Math.exp(-5 * dt));
      p.pitch = U.damp(p.pitch, 0, 4, dt);
    }
    const jump = (mx || mz) && (S.bhop || (p.blocked && U.chance(0.5)));
    return { fw, sr, jump };
  },
  visibleBotCount() {
    let n = 0;
    const pt = [0, 0, 0];
    for (const b of this.bots) {
      if (!b.alive || b.gone || b.team === 'blue') continue;
      if (V.dist(b.pos, this.p.pos) > 40) continue;
      if (World.los(this.p.eye, this.chestPoint(b, pt))) n++;
      if (n >= 3) break;
    }
    return n;
  },

  /* ---------------- weapons ---------------- */
  updateWeapon(dt) {
    const p = this.p, S = Shop.S, w = this.weapon();
    if (!p.alive) return;
    p.fireT -= dt;
    p.clickBuf = Math.max(0, p.clickBuf - dt);
    if (p.switchT > 0) p.switchT = Math.max(0, p.switchT - dt);
    if (p.reloadT > 0) {
      p.reloadT -= dt;
      if (p.reloadT <= 0) { p.reloadT = 0; p.ammo[w.id] = this.magSize(w); }
    }
    if (S.infAmmo) p.ammo[w.id] = this.magSize(w);
    const typing = Chat.typing;
    if (!typing && !this.afk) {
      if (Input.pressed.KeyR) this.startReload();
      for (let i = 0; i < WEAPONS.length; i++) if (Input.pressed['Digit' + ((i + 1) % 10)]) this.switchWeapon(WEAPONS[i].id);
      if (Input.wheel) this.cycleWeapon(Input.wheel > 0 ? 1 : -1);
      if (Input.pressed.KeyQ) this.doFreeze();
      if (Input.pressed.KeyE) this.doBlink(null);
    }
    const aimHeld = (Input.altHeld || Input.touchScope) && p.reloadT <= 0 && p.switchT <= 0 && !this.afk && !typing;
    p.scoped = !!(w.scope && aimHeld);
    p.ads = !!(!w.scope && aimHeld);
    // triggerbot / autopilot fire check
    let trig = false;
    if (S.trig || this.afk) {
      const hit = this.traceBots(p.eye, p.aimDir, S.wallbang || w.pierceAll);
      if (hit) { p.trigT += dt; if (p.trigT >= (S.trig ? S.trigDelay : 0.14)) trig = true; }
      else p.trigT = 0;
    }
    if (Input.firePressed) p.clickBuf = 0.2;
    const auto = w.auto || S.fullAuto;
    const held = (Input.fireHeld || Input.touchFire) && !typing && !this.afk;
    let want = trig || (held && (auto || p.clickBuf > 0));
    if (w.spinUp) {
      p.spin = U.clamp((p.spin || 0) + (want ? dt / w.spinUp : -dt / w.spinUp * 1.5), 0, 1);
      if (p.spin < 1) want = false;
    }
    if (!held && p.clickBuf > 0 && !this.afk && !typing) want = true;
    // tactical reload: top up whenever nothing is in sight
    if (S.tacReload && !want && !trig && p.reloadT <= 0 && p.ammo[w.id] < this.magSize(w) && !this.aimTarget && p.fireT < -0.25) this.startReload();
    // burst guns fire the rest of their burst on their own
    if (p.burstLeft > 0) {
      p.burstT -= dt;
      if (p.burstT <= 0) {
        if (p.reloadT <= 0 && p.switchT <= 0 && (p.ammo[w.id] > 0 || S.infAmmo)) { p.burstLeft--; p.burstT = w.burstGap || 0.07; this.fire(w, true); }
        else p.burstLeft = 0;
      }
    }
    if (want && p.fireT <= 0 && p.reloadT <= 0 && p.switchT <= 0 && !(p.burstLeft > 0)) {
      if (p.ammo[w.id] > 0 || S.infAmmo) this.fire(w);
      else this.startReload();
    }
  },
  switchWeapon(id) {
    const p = this.p;
    const mw = this.mode.weapons;
    if (mw ? !mw.includes(id) : !Save.data.weapons[id]) return;
    if (p.weapon === id || this.mode.id === 'gungame') return;
    p.burstLeft = 0;
    p.weapon = id; p.switchT = 0.35 * (Shop.S.swapMul || 1); p.lastSwitchT = this.clock; p.reloadT = 0; p.scoped = false; p.fireT = Math.max(p.fireT, 0);
    if (p.ammo[id] == null) p.ammo[id] = this.magSize(WEAPON_BY_ID[id]);
    SFX.ui();
  },
  cycleWeapon(dir) {
    const owned = this.mode.weapons ? this.mode.weapons.map(id => WEAPON_BY_ID[id]) : WEAPONS.filter(w => Save.data.weapons[w.id]);
    if (owned.length < 2 || this.mode.id === 'gungame') return;
    const i = owned.findIndex(w => w.id === this.p.weapon);
    this.switchWeapon(owned[(i + dir + owned.length) % owned.length].id);
  },
  startReload(extra) {
    const p = this.p, w = this.weapon(), S = Shop.S;
    if (p.reloadT > 0 || S.infAmmo || p.ammo[w.id] >= this.magSize(w)) return;
    p.reloadMax = p.reloadT = w.reload * S.reload * (Shop.attOf(w.id).fastmag ? 0.65 : 1) + (extra || 0);
    p.scoped = false;
    SFX.reload();
  },
  fire(w, inBurst) {
    const p = this.p, S = Shop.S;
    p.fireT = w.rate / S.fireRate;
    if (w.burst && !inBurst) { p.burstLeft = w.burst - 1; p.burstT = w.burstGap || 0.07; }
    p.clickBuf = 0;
    if (!S.infAmmo) p.ammo[w.id]--;
    const muzzle = this.muzzleWorld([0, 0, 0]);
    const shots = S.doubleTap ? 2 : 1;
    for (let s = 0; s < shots; s++) for (let k = 0; k < w.pellets; k++) this.shootRay(w, muzzle);
    const att = Shop.attOf(w.id);
    p.recoil += w.recoil * S.recoil * (p.scoped ? 0.5 : 1) * (1 - 0.3 * (p.adsT || 0)) * (att.comp ? 0.6 : 1);
    p.recoilYaw += (Math.random() - 0.5) * w.recoil * 0.6 * S.recoil;
    p.bloom = Math.min(0.06, p.bloom + w.spread * 0.3 * S.spread);
    p.kick = 1;
    if (w.id === 'shotgun') p.pump = 1;
    this.fx.muzzle = 0.055;
    this.fx.flash = 0.05;
    if (w.id === 'sniper' || w.id === 'rail' || w.id === 'shotgun' || w.id === 'launcher' || w.id === 'revolver') this.fx.shake = Math.max(this.fx.shake, 0.35);
    this.st.shots++;
    SFX.shot(w.snd);
    if (!S.infAmmo && p.ammo[w.id] <= 0) this.startReload(0.12);
  },
  shootRay(w, muzzle) {
    const p = this.p, S = Shop.S;
    const ads = p.adsT || 0, att = Shop.attOf(w.id);
    let spread = (p.scoped ? (w.scopeSpread || 0) : w.spread * (1 - (w.pellets > 1 ? 0.2 : 0.55) * ads) * (att.reddot ? 1 - 0.15 * ads : 1)) * S.spread
      + p.moveSpread * (1 - 0.4 * ads) + p.bloom * (S.spread > 0 ? 1 : 0) * (1 - 0.3 * ads);
    if (w.pellets > 1) spread = Math.max(spread, w.spread * 0.25);
    let dir = V.cone([0, 0, 0], p.aimDir, spread);
    let silent = false;
    if (S.aimSilent && this.aimTarget && this.aimTarget.alive) {
      dir = V.norm([0, 0, 0], V.sub([0, 0, 0], this.aimPt, p.eye));
      if (w.pellets > 1) V.cone(dir, dir, w.spread * 0.2);
      silent = true;
    }
    let res = this.trace(p.eye, dir, w);
    let magic = false;
    if (!res.hits.length && S.magic) {
      const mt = this.magicTarget(dir, w);
      if (mt) { dir = mt; res = this.trace(p.eye, dir, w); magic = true; }
    }
    for (const h of res.hits) {
      const hp = V.madd([0, 0, 0], p.eye, dir, h.t);
      const crit = S.crit > 0 && Math.random() < S.crit;
      const dmg = w.dmg * (h.head ? w.head * S.hsMul : 1) * S.dmgMul * (att.suppressor ? 0.9 : 1) * (crit ? 2 : 1);
      if (crit) this.addFloater([hp[0], hp[1] + 0.4, hp[2]], 'CRIT', '#ff9a3c', 0.9);
      this.sparks(hp, h.bot.col.acc, 5);
      this.damageBot(h.bot, dmg, h.head, { wall: h.throughWall, silent, magic, dir, hitPos: hp });
      if (S.vamp || S.vampAdd) p.hp = Math.min(100, p.hp + (S.vamp ? 3 : 0) + S.vampAdd);
      if (S.exRounds && !w.splash) Extras.splash(hp, { r: 2.5 * Math.sqrt(S.exMul), dmg: 40 * S.exMul }, h.bot, true);
    }
    if (S.ricochet && !res.hits.length && res.wall && res.wallReached && !w.splash) Extras.ricochet(V.madd([0, 0, 0], res.wallPt, dir, -0.2), w);
    if (res.wall && res.wallReached) {
      const wp = res.wallPt;
      this.addDecal(wp, res.wall.n);
      this.dust(wp, res.wall.n);
    }
    if (w.splash) {
      const first = res.hits[0];
      const pt = first ? V.madd([0, 0, 0], p.eye, dir, first.t) : res.wall && res.wallReached ? V.madd([0, 0, 0], res.wallPt, dir, -0.3) : res.end;
      Extras.splash(pt, w.splash, first ? first.bot : null);
    }
    const tracerEnd = res.end;
    this.addTracer(muzzle, tracerEnd, w.id === 'rail' ? [0.45, 0.9, 1] : [1, 0.86, 0.5], w.id === 'rail' ? 0.05 : 0.018, w.id === 'rail' ? 0.25 : 0.07);
  },
  trace(o, d, w) {
    const S = Shop.S;
    const pierceWalls = S.wallbang || !!w.pierceAll;
    const pierceBots = S.pierce || !!w.pierceAll;
    const range = w.range;
    const wall = World.raycast(o, d, range);
    const wallT = wall ? wall.t : range;
    const hits = [];
    for (const b of this.bots) {
      if (!b.alive || b.gone || b.team === 'blue') continue; // no friendly fire: bullets pass through teammates
      const h = this.rayBot(o, d, b, range);
      if (!h) continue;
      if (h.t > wallT && !pierceWalls) continue;
      h.bot = b; h.throughWall = h.t > wallT;
      hits.push(h);
    }
    hits.sort((a, b) => a.t - b.t);
    let endT = pierceWalls ? range : wallT;
    if (!pierceBots && hits.length) { hits.length = 1; endT = hits[0].t; }
    const wallReached = !!wall && (pierceWalls || pierceBots || !hits.length || hits[0].t > wall.t);
    return { hits, wall, wallReached, wallPt: wall ? V.madd([0, 0, 0], o, d, wall.t) : null, end: V.madd([0, 0, 0], o, d, Math.min(endT, range)) };
  },
  traceBots(o, d, throughWalls) {
    const wall = throughWalls ? null : World.raycast(o, d, 300);
    const maxT = wall ? wall.t : 300;
    let best = null;
    for (const b of this.bots) {
      if (!b.alive || b.gone || b.team === 'blue') continue;
      const h = this.rayBot(o, d, b, maxT);
      if (h && (!best || h.t < best.t)) { best = h; best.bot = b; }
    }
    return best;
  },
  rayBot(o, d, b, maxT) {
    const S = Shop.S, hs = S.hbHead, bs = S.hbBody;
    let best = null;
    const hc = this.headPoint(b, [0, 0, 0]);
    const k = b.scale || 1;
    const tH = raySphere(o, d, hc, 0.2 * hs * k);
    if (tH !== null && tH < maxT) best = { t: tH, head: true };
    const tB = rayCylY(o, d, b.pos[0], b.pos[2], 0.3 * bs * k, b.pos[1] + 0.02, b.pos[1] + 1.47 * k);
    if (tB !== null && tB < maxT && (!best || tB < best.t - 0.02)) best = { t: tB, head: false };
    if (best && S.allHead) best.head = true;
    return best;
  },
  magicTarget(dir, w) {
    const p = this.p, S = Shop.S;
    let best = null, bestA = 12 * DEG;
    for (const b of this.bots) {
      if (!b.alive || b.gone || b.team === 'blue') continue;
      const hp = this.headPoint(b);
      const d = V.norm([0, 0, 0], V.sub([0, 0, 0], hp, p.eye));
      const a = Math.acos(U.clamp(V.dot(d, dir), -1, 1));
      if (a < bestA && (S.wallbang || w.pierceAll || World.los(p.eye, hp))) { bestA = a; best = d; }
    }
    return best;
  },

  /* ---------------- damage & kills ---------------- */
  damageBot(b, dmg, head, info) {
    if (!b.alive) return;
    if (this.mode.id === 'heads' && !head && !info.popper && !info.splash && !info.strike && !info.reflect) {
      if (Save.data.settings.dmgNums && U.chance(0.5)) this.addFloater(info.hitPos || this.chestPoint(b), 'BODY', '#8e9ab5', 0.8);
      return;
    }
    b.hp -= dmg;
    if (b.boss) Extras.onBossHit(b);
    b.hitFlash = 0.08;
    b.aggroT = 4;
    if (!info.reflect && !info.popper) this.st.hits++;
    if (Save.data.settings.dmgNums) this.addFloater(info.hitPos || this.headPoint(b), String(Math.round(dmg)), head ? '#ffd23f' : '#ffffff', head ? 1.15 : 0.9);
    this.fx.hitmark = 0.2; this.fx.hitHead = head; this.fx.hitKill = false;
    if (head) SFX.head(); else SFX.hit();
    if (b.hp <= 0) this.killBot(b, 'player', Object.assign({}, info, { head }));
  },
  killBot(b, killer, info) {
    b.alive = false; b.hp = 0; b.deaths++;
    const rs = this.mode.respawn || 2.8;
    b.respawnT = Shop.S.magnet && b.team !== 'blue' ? Math.min(rs, 2.2) : rs;
    if (b.boss) b.respawnT = 999;
    this.debris(b, info.dir);
    if (killer === 'player') {
      const p = this.p, S = Shop.S;
      p.kills++; p.streak++;
      if (S.lifeOnKill && p.alive) p.hp = Math.min(100, p.hp + S.lifeOnKill);
      this.st.kills++;
      if (!this.mode.ffa) this.score.blue++;
      if (info.head) this.st.hs++;
      this.st.best = Math.max(this.st.best, p.streak);
      if (this.clock - p.lastKillT < 1.25) p.multi++; else p.multi = 1;
      p.lastKillT = this.clock;
      this.st.multiMax = Math.max(this.st.multiMax, p.multi);
      const ctx = {
        head: info.head, popper: !!info.popper, reflect: !!info.reflect, silent: !!info.silent, magic: !!info.magic,
        wall: !!info.wall, snap: false, spin: false, multi: p.multi, frozen: this.freezeT > 0,
        blink: this.clock - p.lastBlinkT < 1.5, speed: Math.hypot(p.vel[0], p.vel[2]) > 8.5, long: V.dist(p.pos, b.pos) > 45,
        ambush: S.ambush && this.clock - b.sawPlayerT > 2.5,
        suppressed: !info.strike && !info.splash && !info.popper && !info.reflect && !info.chain && (!!Shop.attOf(this.weapon().id).suppressor || !!this.weapon().silent),
        quiet: !info.strike && !info.splash && !info.popper && !info.reflect && !info.chain && !!this.weapon().silent,
      };
      if (!info.popper && !info.reflect) {
        ctx.snap = this.recentTurn(0.15) > 35 * DEG;
        ctx.spin = this.recentTurn(0.4) > 100 * DEG;
        if (!ctx.wall) ctx.wall = !World.los(p.eye, this.chestPoint(b)) && !World.los(p.eye, this.headPoint(b));
      }
      const base = this.def.cr * (this.mode.pay || 1);
      let bonus = 0;
      if (info.head) bonus += S.hsBonus;
      if (S.streak) bonus += Math.min(2, (p.streak - 1) * 0.1);
      if (ctx.ambush) bonus += 0.6 + S.ambushBonus;
      // the gun that got the kill pays its small multiplier; strikes, lasers, chains and confetti don't
      const killGun = info.nade ? null : info.splash ? WEAPON_BY_ID.launcher : (info.strike || info.chain || info.popper || info.reflect || info.nuke) ? null : this.weapon();
      const xg = killGun ? killGun.pay : 1;
      const xm = Extras.killMult(b, info), xs = Style.killMult(p.streak);
      const raw = base * (1 + bonus) * S.cr;
      const value = raw * xg * xm * xs;
      this.earn.gun += raw * (xg - 1);
      this.earn.streakx += raw * xg * (xs - 1);
      this.earn.special += raw * xg * xs * (xm - 1);
      this.earn.base += base; this.earn.bonus += base * bonus; this.earn.mult += base * (1 + bonus) * (S.cr - 1);
      this.earn.total += value;
      Save.data.credits += value;
      this.addFloater([b.pos[0], b.pos[1] + 2.2, b.pos[2]], '+' + U.fmt(value) + ' CR', '#ffd23f', 1.1, true);
      this.fx.hitKill = true; this.fx.hitmark = 0.3;
      SFX.kill();
      const wname = info.nade ? 'grenade' : info.nuke ? 'ctrl+alt+del' : info.strike ? 'from above' : info.splash ? 'party cannon' : info.popper ? 'confetti' : info.reflect ? 'reflect' : this.weapon().name;
      HUD.killfeed(Save.data.settings.name, b.name, wname, { head: info.head, wall: ctx.wall, mine: true, kTeam: 'blue', vTeam: b.team });
      const calls = ['', '', 'DOUBLE KILL', 'TRIPLE KILL', 'QUAD KILL', 'OVERKILL'];
      if (p.multi >= 2) { HUD.callout(p.multi >= 6 ? 'TOTALLY LEGIT KILL' : calls[p.multi], 'multi'); SFX.streak(p.multi); }
      else if (info.head) HUD.callout('HEADSHOT', 'small');
      Chat.onPlayerKill(b, ctx);
      AC.onKill(ctx);
      More.onKill(info);
      if (info.nade) Save.data.stats.nadeKills = (Save.data.stats.nadeKills || 0) + 1;
      if (ctx.quiet && this.weapon().id === 'xbow') Save.data.stats.xbowKills = (Save.data.stats.xbowKills || 0) + 1;
      Style.onKill(b, info, ctx);
      Extras.onPlayerKill(b, info, ctx);
      if (S.popper && !info.popper) this.pops.push({ pos: [b.pos[0], b.pos[1] + 1, b.pos[2]], t: 0.12 });
    } else if (killer && killer.name) {
      killer.kills++;
      if (killer.team === 'blue' || killer.team === 'red') this.score[killer.team]++;
      if (this.mode.assist && killer.team === 'blue') {
        // teammates' kills pay you a cut
        const cut = this.def.cr * this.mode.assist * Shop.S.cr;
        this.earn.team += cut; this.earn.total += cut; Save.data.credits += cut;
        this.st.allyKills = (this.st.allyKills || 0) + 1;
      }
      HUD.killfeed(killer.name, b.name, 'bot', { head: false, kTeam: killer.team, vTeam: b.team });
      Chat.onBotKill(killer, b);
    }
    if (this.mode.id === 'clutch' && this.phase === 'play' && !this.roundOver) {
      const left = this.foesAlive();
      if (left === 0) this.endRound(true);
      else if (left === 1) Chat.onLastBot(this.bots.find(o => o.alive && !o.gone && o.team !== 'blue'));
    }
  },
  foesAlive() { let n = 0; for (const b of this.bots) if (b.alive && !b.gone && b.team !== 'blue') n++; return n; },
  hurtPlayer(dmg, bot) {
    const p = this.p, S = Shop.S;
    if (!p.alive || p.prot > 0) return;
    if (S.reflect && bot && bot.alive) this.damageBot(bot, dmg * 2, false, { reflect: true, dir: V.norm([0, 0, 0], V.sub([0, 0, 0], bot.pos, p.pos)) });
    const taken = dmg * S.dmgTaken;
    p.hp -= taken;
    if (S.immortal) p.hp = Math.max(1, p.hp);
    p.lastHurt = this.clock;
    if (taken > 0.5) {
      SFX.hurt();
      this.fx.shake = Math.max(this.fx.shake, 0.2);
      if (bot) this.fx.hurt.push({ ang: V.yawOf(V.sub([0, 0, 0], bot.pos, p.pos)), t: 1 });
    }
    if (p.hp <= 0 && Extras.tryRewind()) return;
    if (p.hp <= 0) this.killPlayer(bot);
  },
  killPlayer(bot) {
    const p = this.p;
    const clutch = this.mode.id === 'clutch';
    const prevStreak = p.streak;
    p.alive = false; p.hp = 0; p.respawnT = clutch ? 99 : 2.6 * Shop.S.respawn; p.deaths++; this.st.deaths++; p.streak = 0; p.multi = 0;
    Extras.onPlayerDeath(prevStreak);
    Style.onPlayerDeath(bot);
    if (bot && bot.cheater && U.chance(0.7)) Chat.queue(bot, U.pick(CHAT.rivalTaunt), U.rand(0.4, 1), 0);
    p.scoped = false; p.reloadT = 0;
    this.deathCam = bot || null;
    if (!this.mode.ffa) this.score.red++;
    if (bot) { bot.kills++; HUD.killfeed(bot.name, Save.data.settings.name, 'bot', { victimMe: true, kTeam: bot.team, vTeam: 'blue' }); }
    Chat.onPlayerDeath(bot);
    SFX.die();
    HUD.setDead(bot, p.respawnT);
    if (clutch) this.endRound(false, 'dead');
  },
  rageQuit(b) {
    if (!b || b.gone || b.boss) return;
    if (b.alive) this.debris(b, null, true);
    b.alive = false; b.gone = true; b.rejoinT = U.rand(3, 6);
    if (b.bounty) { b.bounty = false; Extras.bounty = null; Extras.bountyT = 2; }
    Chat.onRageQuit(b);
    Extras.onRageQuit(b);
    if (this.mode.id === 'clutch' && this.phase === 'play' && !this.roundOver && this.foesAlive() === 0) this.endRound(true);
  },

  /* ---------------- cheats: abilities ---------------- */
  doFreeze() {
    const p = this.p, S = Shop.S;
    if (!S.freeze) return;
    if (p.freezeCD > 0) { SFX.deny(); return; }
    this.freezeT = 4; p.freezeCD = 18 * S.freezeCD;
    SFX.freeze();
    HUD.callout('FREEZE FRAME', 'multi');
    AC.onAbility('freeze');
    Chat.onAbility('freeze');
  },
  doBlink(target) {
    const p = this.p, S = Shop.S;
    if (!S.blink || !p.alive) return;
    if (p.blinkCD > 0) { SFX.deny(); return; }
    let t = target || this.aimTarget;
    if (!t) {
      let bestA = 30 * DEG;
      for (const b of this.bots) {
        if (!b.alive || b.gone || b.team === 'blue' || V.dist(b.pos, p.pos) > 70) continue;
        const d = V.norm([0, 0, 0], V.sub([0, 0, 0], this.chestPoint(b), p.eye));
        const a = Math.acos(U.clamp(V.dot(d, p.aimDir), -1, 1));
        if (a < bestA) { bestA = a; t = b; }
      }
    }
    if (!t || !t.alive) { SFX.deny(); return; }
    const from = p.pos.slice();
    let dest = null;
    for (let k = 0; k < 8 && !dest; k++) {
      const a = t.yaw + Math.PI + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 0.6;
      const x = t.pos[0] - Math.sin(a) * 1.7, z = t.pos[2] - Math.cos(a) * 1.7;
      if (World.fits(x, t.pos[1] + 0.05, z, p.r, p.h)) dest = [x, t.pos[1] + 0.05, z];
    }
    if (!dest) { SFX.deny(); return; }
    for (let i = 0; i < 14; i++) this.addPart(from[0], from[1] + U.rand(0.2, 1.8), from[2], U.rand(-1.5, 1.5), U.rand(-0.5, 1.5), U.rand(-1.5, 1.5), 0.08, [0.7, 0.4, 1], 0.5, 0, 1, 0);
    V.copy(p.pos, dest); V.set(p.vel, 0, 0, 0);
    p.yaw = V.yawOf(V.sub([0, 0, 0], t.pos, p.pos)); p.pitch = -0.05;
    for (let i = 0; i < 14; i++) this.addPart(dest[0], dest[1] + U.rand(0.2, 1.8), dest[2], U.rand(-1.5, 1.5), U.rand(-0.5, 1.5), U.rand(-1.5, 1.5), 0.08, [0.7, 0.4, 1], 0.5, 0, 1, 0);
    p.blinkCD = 3 * S.blinkCD; p.lastBlinkT = this.clock;
    this.fx.fovKick = 0.25;
    SFX.blink();
    AC.onAbility('blink');
    Chat.onAbility('blink');
  },
  toggleAfk() {
    if (!Shop.S.afk) { HUD.callout('BUY AFK FARM FIRST', 'small'); SFX.deny(); return; }
    this.afk = !this.afk;
    HUD.callout(this.afk ? 'AFK FARM ON' : 'AFK FARM OFF', 'small');
    SFX.ui();
    if (this.afk && this.paused) this.resume();
    // taking over without the mouse grabbed: pause so the player can click back in
    if (!this.afk && !Input.locked && !Input.noLock && !Input.touch) this.pause();
  },

  /* ---------------- bots ---------------- */
  updateBots(dt) {
    const S = Shop.S, frozen = this.freezeT > 0;
    for (const b of this.bots) {
      b.hitFlash = Math.max(0, b.hitFlash - dt);
      b.bubbleT = Math.max(0, b.bubbleT - dt);
      if (b.gone) {
        if (this.mode.id === 'clutch') continue; // rejoins when the next round starts
        b.rejoinT -= dt;
        if (b.rejoinT <= 0) {
          b.gone = false; b.name = this.namePool.pop() || ('bot_' + Math.floor(Math.random() * 999));
          b.kills = 0; b.deaths = 0; b.pers = U.pick(PERSONAS);
          this.spawnBot(b, false);
          Chat.onJoin(b);
        }
        continue;
      }
      if (!b.alive) {
        if (this.mode.id === 'clutch') continue; // one life per round
        b.respawnT -= dt;
        if (b.respawnT <= 0) this.spawnBot(b, false);
        continue;
      }
      if (frozen && b.team !== 'blue') { b.moveAmt = 0; continue; }
      b.aggroT = Math.max(0, b.aggroT - dt);
      b.thinkT -= dt;
      if (b.thinkT <= 0) { b.thinkT = 0.22 + Math.random() * 0.12; this.think(b); }
      this.moveBot(b, dt);
      if (b.canSee && b.target && this.targetAlive(b.target)) {
        b.seeT += dt;
        if (b.seeT >= b.react) {
          b.fireT -= dt;
          if (b.fireT <= 0) { b.fireT = this.def.bot.fire * U.rand(0.8, 1.3); this.botShoot(b); }
        }
      }
    }
    // separation
    const list = this.bots;
    for (let i = 0; i < list.length; i++) {
      const a = list[i];
      if (!a.alive || a.gone) continue;
      for (let j = i + 1; j < list.length; j++) {
        const b = list[j];
        if (!b.alive || b.gone) continue;
        const dx = b.pos[0] - a.pos[0], dz = b.pos[2] - a.pos[2], d = Math.hypot(dx, dz);
        if (d < 0.7 && d > 1e-4) {
          const push = (0.7 - d) * 0.5;
          World.move(a, -dx / d * push, 0, -dz / d * push);
          World.move(b, dx / d * push, 0, dz / d * push);
        }
      }
      const p = this.p;
      if (p.alive) {
        const dx = p.pos[0] - a.pos[0], dz = p.pos[2] - a.pos[2], d = Math.hypot(dx, dz);
        if (d < 0.68 && d > 1e-4 && Math.abs(p.pos[1] - a.pos[1]) < 1.6) World.move(a, -dx / d * (0.68 - d), 0, -dz / d * (0.68 - d));
      }
    }
  },
  targetAlive(t) { return t === this.p ? this.p.alive : (t.alive && !t.gone); },
  think(b) {
    const S = Shop.S, p = this.p;
    const eye = [b.pos[0], b.pos[1] + 1.55, b.pos[2]];
    const fx = -Math.sin(b.yaw), fz = -Math.cos(b.yaw);
    const cands = [];
    const consider = (t, isP) => {
      const dx = t.pos[0] - b.pos[0], dz = t.pos[2] - b.pos[2], d = Math.hypot(dx, dz);
      if (d > 55) return;
      if (isP && S.ghost && d > 8 && b.aggroT <= 0) return;
      const facing = (dx * fx + dz * fz) / (d || 1);
      if (facing < -0.25 && d > 6 && b.aggroT <= 0 && b.target !== t) return;
      let score = d * (isP ? (S.magnet ? 0.25 : 0.75) : 1);
      if (t === b.target) score *= 0.7;
      cands.push({ t, score, isP });
    };
    if (p.alive && this.phase === 'play' && b.team !== 'blue') consider(p, true);
    const near = [];
    for (const o of this.bots) {
      if (o === b || !o.alive || o.gone || o.team === b.team) continue;
      near.push([V.dist2D(o.pos, b.pos), o]);
    }
    near.sort((x, y) => x[0] - y[0]);
    for (let i = 0; i < Math.min(4, near.length); i++) consider(near[i][1], false);
    cands.sort((x, y) => x.score - y.score);
    let best = null;
    for (const c of cands) {
      const tp = [c.t.pos[0], c.t.pos[1] + 1.2, c.t.pos[2]];
      if (World.los(eye, tp) || (b.cheater && c.isP && V.dist(eye, tp) < 45)) { best = c; break; }
    }
    if (best) {
      if (best.t !== b.target) { b.seeT = 0; b.react = this.def.bot.react * (b.cheater ? 0.45 : U.rand(0.8, 1.3)); }
      b.target = best.t; b.canSee = true; b.lostT = 0;
      b.lastSeen = [best.t.pos[0], 0, best.t.pos[2]];
      if (best.isP) {
        b.sawPlayerT = this.clock;
        if (this.mode.id === 'squad' || this.mode.id === 'clutch') {
          // squad comms: the whole bot team learns where you are
          const fresh = this.intel && this.clock - this.intel.t < 2;
          this.intel = { pos: [p.pos[0], 0, p.pos[2]], t: this.clock };
          if (!fresh && this.clock - this.spotT > 7 && U.chance(0.5)) { this.spotT = this.clock; Chat.queue(b, U.pick(CHAT.squadSpot), U.rand(0.3, 0.9), 0); }
        }
      }
    } else {
      b.canSee = false;
      if (b.target) { b.lostT += 0.25; if (b.lostT > 4 || !this.targetAlive(b.target)) b.target = null; }
      const done = !b.path || b.pathI >= b.path.length;
      if (done || this.clock > b.repathAt) {
        let goal;
        const squad = this.mode.id === 'squad' || this.mode.id === 'clutch';
        const foe = b.team !== 'blue';
        if (b.target && b.lastSeen) goal = b.lastSeen;
        else if (squad && this.intel && this.clock - this.intel.t < 8) goal = [this.intel.pos[0] + U.rand(-3, 3), 0, this.intel.pos[2] + U.rand(-3, 3)];
        else if (S.magnet && p.alive && foe) goal = p.pos;
        else if (!foe && p.alive && U.chance(0.55)) goal = [p.pos[0] + U.rand(-4, 4), 0, p.pos[2] + U.rand(-4, 4)];
        else if (foe && p.alive && U.chance(squad ? 0.7 : 0.35)) goal = p.pos;
        else goal = World.randomReach();
        b.path = World.findPath(b.pos, goal); b.pathI = 0;
        b.repathAt = this.clock + U.rand(2, 4);
      }
    }
  },
  moveBot(b, dt) {
    const S = Shop.S;
    const spd = this.def.bot.speed * S.botSpeed * b.speedVar;
    let wx = 0, wz = 0;
    const t = b.target;
    if (b.canSee && t) {
      const dx = t.pos[0] - b.pos[0], dz = t.pos[2] - b.pos[2], d = Math.hypot(dx, dz) || 1;
      const ux = dx / d, uz = dz / d;
      b.strafeT -= dt;
      if (b.strafeT <= 0) { b.strafeT = U.rand(0.4, 1.3); b.strafeDir = U.chance(0.15) ? 0 : (U.chance(0.5) ? 1 : -1); }
      wx = -uz * b.strafeDir * 0.8; wz = ux * b.strafeDir * 0.8;
      if (d > 16) { wx += ux; wz += uz; } else if (d < 5) { wx -= ux * 0.7; wz -= uz * 0.7; }
      if (S.magnet && t === this.p && d > 3) { wx += ux * 0.9; wz += uz * 0.9; }
    } else if (b.path && b.pathI < b.path.length) {
      const wp = b.path[b.pathI];
      const dx = wp[0] - b.pos[0], dz = wp[1] - b.pos[2], d = Math.hypot(dx, dz);
      if (d < 0.6) b.pathI++; else { wx = dx / d; wz = dz / d; }
    }
    const wl = Math.hypot(wx, wz);
    if (wl > 1) { wx /= wl; wz /= wl; }
    const k = b.canSee ? 0.72 : 1;
    b.vel[0] = U.damp(b.vel[0], wx * spd * k, 10, dt);
    b.vel[2] = U.damp(b.vel[2], wz * spd * k, 10, dt);
    b.vel[1] -= GRAVITY * dt;
    const ox = b.pos[0], oz = b.pos[2];
    World.move(b, b.vel[0] * dt, b.vel[1] * dt, b.vel[2] * dt);
    const moved = Math.hypot(b.pos[0] - ox, b.pos[2] - oz) / Math.max(dt, 1e-4);
    if (wl > 0.3 && moved < 0.5) {
      b.stuckT += dt;
      if (b.stuckT > 0.8) { b.stuckT = 0; b.path = null; b.repathAt = 0; b.strafeDir = -b.strafeDir; }
    } else b.stuckT = Math.max(0, b.stuckT - dt);
    let wantYaw = null;
    if (b.canSee && t) {
      wantYaw = V.yawOf([t.pos[0] - b.pos[0], 0, t.pos[2] - b.pos[2]]);
      const ty = t === this.p ? 1.3 : 1.2;
      const dy = (t.pos[1] + ty) - (b.pos[1] + 1.33), dh = Math.hypot(t.pos[0] - b.pos[0], t.pos[2] - b.pos[2]);
      b.aimPitch = U.damp(b.aimPitch, Math.atan2(dy, dh), 8, dt);
    } else {
      if (moved > 0.4) wantYaw = Math.atan2(-b.vel[0], -b.vel[2]);
      b.aimPitch = U.damp(b.aimPitch, 0, 4, dt);
    }
    if (wantYaw !== null) b.yaw += U.clamp(U.angDiff(b.yaw, wantYaw), -9 * dt, 9 * dt);
    b.moveAmt = U.clamp(moved / 3.2, 0, 1);
    b.walkPhase += moved * dt * 2.3;
  },
  botShoot(b) {
    const S = Shop.S, p = this.p, t = b.target, isP = t === p;
    const muzzle = Models.botMuzzle(b, [0, 0, 0]);
    const tp = isP ? [p.pos[0], p.pos[1] + 1.3, p.pos[2]] : [t.pos[0], t.pos[1] + 1.2, t.pos[2]];
    const d = V.dist(muzzle, tp);
    let acc = this.def.bot.acc * b.accVar * U.clamp(1.25 - d / 35, 0.3, 1.2);
    if (isP) {
      acc *= S.botAcc * (this.mode.botAcc || 1);
      const ps = Math.hypot(p.vel[0], p.vel[2]);
      if (ps > 7) acc *= 0.75;
      if (ps > 11) acc *= 0.7;
      if (!p.onGround) acc *= 0.8;
    }
    const heads = this.mode.id === 'heads' && isP;
    const hit = Math.random() < acc * (heads ? 0.35 : 1);
    let end;
    if (hit) end = [tp[0] + U.rand(-0.15, 0.15), tp[1] + U.rand(-0.3, 0.2), tp[2] + U.rand(-0.15, 0.15)];
    else {
      const off = [tp[0] + U.rand(-1, 1) * 0.9, tp[1] + U.rand(-0.6, 0.9), tp[2] + U.rand(-1, 1) * 0.9];
      const dir = V.norm([0, 0, 0], V.sub([0, 0, 0], off, muzzle));
      const r = World.raycast(muzzle, dir, 90);
      end = V.madd([0, 0, 0], muzzle, dir, r ? r.t : 90);
      if (r) this.addDecal(end, r.n);
    }
    this.addTracer(muzzle, end, [1, 0.55, 0.35], 0.014, 0.06);
    const rel = V.sub([0, 0, 0], b.pos, p.pos);
    const pd = V.len(rel);
    const pan = U.clamp(V.dot(V.norm(rel, rel), GFX.right), -1, 1) * 0.8;
    SFX.botShot(pd, pan);
    if (!hit) return;
    const dmg = this.def.bot.dmg * U.rand(0.85, 1.15) * (b.boss ? 2.5 : 1) * (heads ? 2.5 : 1);
    if (isP) this.hurtPlayer(dmg, b);
    else {
      t.hp -= dmg; t.hitFlash = 0.06;
      if (!t.target || U.chance(0.5)) { t.target = b; t.aggroT = 3; }
      if (t.hp <= 0) this.killBot(t, b, { dir: V.norm([0, 0, 0], V.sub([0, 0, 0], t.pos, b.pos)) });
    }
  },

  /* ---------------- effects ---------------- */
  addPart(x, y, z, vx, vy, vz, s, c, life, grav, emis, bounce, sy, sz) {
    let q;
    if (this.parts.length < 900) { q = {}; this.parts.push(q); }
    else { this.partIdx = (this.partIdx + 1) % 900; q = this.parts[this.partIdx]; }
    q.x = x; q.y = y; q.z = z; q.vx = vx; q.vy = vy; q.vz = vz;
    q.sx = s; q.sy = sy || s; q.sz = sz || s; q.r = c[0]; q.g = c[1]; q.b = c[2];
    q.life = q.max = life; q.grav = grav; q.emis = emis || 0; q.bounce = bounce || 0;
    q.rx = Math.random() * 6; q.ry = Math.random() * 6; q.vrx = U.rand(-9, 9); q.vry = U.rand(-9, 9);
    q.alive = true;
    return q;
  },
  sparks(pos, col, n) {
    for (let i = 0; i < n; i++) {
      const c = Math.random() < 0.5 ? [1, 0.85, 0.4] : col;
      this.addPart(pos[0], pos[1], pos[2], U.rand(-3, 3), U.rand(0, 4), U.rand(-3, 3), 0.045, c, U.rand(0.2, 0.45), 12, 1, 0.3);
    }
  },
  dust(pos, n) {
    for (let i = 0; i < 3; i++) {
      this.addPart(pos[0] + n[0] * 0.05, pos[1] + n[1] * 0.05, pos[2] + n[2] * 0.05, n[0] * 2 + U.rand(-1, 1), n[1] * 2 + U.rand(0, 1.5), n[2] * 2 + U.rand(-1, 1), 0.06, [0.75, 0.72, 0.66], U.rand(0.25, 0.5), 9, 0, 0.2);
    }
  },
  addDecal(p, n) {
    const d = { p: [p[0] + n[0] * 0.006, p[1] + n[1] * 0.006, p[2] + n[2] * 0.006], n: n.slice(), life: 12 };
    if (this.decals.length < 90) this.decals.push(d);
    else { this.decalIdx = (this.decalIdx + 1) % 90; this.decals[this.decalIdx] = d; }
  },
  addTracer(a, b, col, w, life) { this.tracers.push({ a: a.slice(), b: b.slice(), col, w, life, max: life }); if (this.tracers.length > 120) this.tracers.shift(); },
  addFloater(pos, text, col, size, rise) { this.floaters.push({ p: pos.slice(), text, col, size: size || 1, life: rise ? 1.3 : 0.75, max: rise ? 1.3 : 0.75, vy: rise ? 1.1 : 0.7 }); if (this.floaters.length > 60) this.floaters.shift(); },
  debris(b, dir, quiet) {
    const kind = Save.data.killfx;
    const hv = Shop.S.headVisual;
    const x = b.pos[0], y = b.pos[1], z = b.pos[2];
    const dx = dir ? dir[0] * 3 : 0, dz = dir ? dir[2] * 3 : 0;
    const P = (oy, s, sy, sz, col, emis, life) => this.addPart(x + U.rand(-0.2, 0.2), y + oy, z + U.rand(-0.2, 0.2), dx + U.rand(-2.5, 2.5), U.rand(2, 5), dz + U.rand(-2.5, 2.5), s, col, life || 2.4, 14, emis || 0, 0.35, sy, sz);
    if (kind !== 'pixels' || quiet) {
      P(1.62, 0.34 * hv, 0.3 * hv, 0.32 * hv, b.col.body);
      P(1.15, 0.5, 0.5, 0.3, b.col.body);
      P(1.2, 0.36, 0.24, 0.05, b.col.acc, 0.3);
      P(0.4, 0.17, 0.78, 0.2, b.col.dark); P(0.4, 0.17, 0.78, 0.2, b.col.dark);
      P(1.3, 0.12, 0.34, 0.13, b.col.body); P(1.3, 0.08, 0.12, 0.46, COL_DARK);
    }
    if (quiet) return;
    if (kind === 'confetti') {
      for (let i = 0; i < 46; i++) this.addPart(x, y + 1.3, z, U.rand(-4, 4), U.rand(2, 7), U.rand(-4, 4), 0.07, U.hsv(Math.random(), 0.7, 1), U.rand(1.8, 3), 3, 0.5, 0.1, 0.012, 0.1);
    } else if (kind === 'pixels') {
      for (let i = 0; i < 44; i++) this.addPart(x + U.rand(-0.3, 0.3), y + U.rand(0.1, 1.9), z + U.rand(-0.3, 0.3), U.rand(-0.6, 0.6), U.rand(0.5, 2), U.rand(-0.6, 0.6), 0.1, Math.random() < 0.7 ? b.col.acc : [1, 1, 1], U.rand(0.8, 1.6), -1.5, 1, 0);
    } else if (kind === 'coins') {
      for (let i = 0; i < 24; i++) this.addPart(x, y + 1.4, z, U.rand(-3, 3), U.rand(3, 7), U.rand(-3, 3), 0.14, [1, 0.8, 0.2], U.rand(1.6, 2.6), 13, 0.35, 0.5, 0.03, 0.14);
      SFX.coin();
    } else if (kind === 'saltfx') {
      for (let i = 0; i < 70; i++) this.addPart(x + U.rand(-0.35, 0.35), y + U.rand(0.2, 2), z + U.rand(-0.35, 0.35), U.rand(-0.8, 0.8), U.rand(0, 1.5), U.rand(-0.8, 0.8), 0.05, [0.95, 0.97, 1], U.rand(2, 3.4), 9, 0.15, 0.4);
    } else if (kind === 'banned') {
      this.addFloater([x, y + 2.3, z], 'BANNED', '#ff3d4d', 1.6, true);
      for (let i = 0; i < 30; i++) this.addPart(x, y + 1.2, z, U.rand(-3, 3), U.rand(1, 5), U.rand(-3, 3), 0.1, [1, 0.2, 0.25], U.rand(0.8, 1.6), 6, 0.8, 0);
    } else if (kind === 'glitchfx') {
      for (let i = 0; i < 40; i++) this.addPart(x + U.rand(-0.3, 0.3), y + U.rand(0.1, 1.9), z + U.rand(-0.3, 0.3), U.rand(-5, 5), U.rand(-0.3, 0.3), U.rand(-5, 5) * 0.2, 0.11, i % 2 ? [0.2, 1, 1] : [1, 0.2, 0.9], U.rand(0.4, 0.9), 0, 1, 0);
    } else if (kind === 'smoke') {
      for (let i = 0; i < 26; i++) this.addPart(x + U.rand(-0.4, 0.4), y + U.rand(0.3, 1.8), z + U.rand(-0.4, 0.4), U.rand(-0.5, 0.5), U.rand(0.3, 1.2), U.rand(-0.5, 0.5), U.rand(0.25, 0.45), [0.55, 0.57, 0.6], U.rand(1.4, 2.4), -0.6, 0, 0);
    } else if (kind === 'fireworks') {
      for (let i = 0; i < 60; i++) this.addPart(x, y + 1.5, z, U.rand(-5, 5), U.rand(5, 12), U.rand(-5, 5), 0.06, U.hsv(Math.random(), 0.8, 1), U.rand(0.8, 1.5), 7, 1, 0);
    }
  },
  explode(pos) {
    SFX.pop();
    this.blasts.push({ p: pos.slice(), life: 0.35, max: 0.35 });
    for (let i = 0; i < 40; i++) this.addPart(pos[0], pos[1], pos[2], U.rand(-7, 7), U.rand(1, 9), U.rand(-7, 7), 0.09, U.hsv(Math.random(), 0.75, 1), U.rand(1.5, 3), 4, 0.6, 0.1, 0.014, 0.13);
    this.fx.shake = Math.max(this.fx.shake, 0.3);
    for (const b of this.bots) {
      if (!b.alive || b.gone || b.team === 'blue') continue;
      const d = V.dist(b.pos, [pos[0], b.pos[1], pos[2]]);
      if (d < 5) this.damageBot(b, 150, false, { popper: true, dir: V.norm([0, 0, 0], V.sub([0, 0, 0], b.pos, pos)), hitPos: this.chestPoint(b) });
    }
  },
  updateFx(dt) {
    const fx = this.fx;
    fx.flash = Math.max(0, fx.flash - dt); fx.muzzle = Math.max(0, fx.muzzle - dt);
    fx.shake = Math.max(0, fx.shake - dt * 2); fx.fovKick = U.damp(fx.fovKick, 0, 5, dt);
    fx.hitmark = Math.max(0, fx.hitmark - dt);
    for (let i = fx.hurt.length - 1; i >= 0; i--) { fx.hurt[i].t -= dt; if (fx.hurt[i].t <= 0) fx.hurt.splice(i, 1); }
    for (const q of this.parts) {
      if (!q.alive) continue;
      q.life -= dt;
      if (q.life <= 0) { q.alive = false; continue; }
      q.vy -= q.grav * dt;
      q.x += q.vx * dt; q.y += q.vy * dt; q.z += q.vz * dt;
      q.rx += q.vrx * dt; q.ry += q.vry * dt;
      const floor = q.sy * 0.5;
      if (q.y < floor && q.vy < 0) {
        q.y = floor; q.vy = -q.vy * q.bounce; q.vx *= 0.6; q.vz *= 0.6; q.vrx *= 0.5; q.vry *= 0.5;
        if (Math.abs(q.vy) < 0.4) { q.vy = 0; q.vrx = 0; q.vry *= 0.8; q.rx = 0; }
      }
    }
    for (let i = this.tracers.length - 1; i >= 0; i--) { this.tracers[i].life -= dt; if (this.tracers[i].life <= 0) this.tracers.splice(i, 1); }
    for (const d of this.decals) d.life -= dt;
    for (let i = this.floaters.length - 1; i >= 0; i--) { const f = this.floaters[i]; f.life -= dt; f.p[1] += f.vy * dt; if (f.life <= 0) this.floaters.splice(i, 1); }
    for (let i = this.blasts.length - 1; i >= 0; i--) { this.blasts[i].life -= dt; if (this.blasts[i].life <= 0) this.blasts.splice(i, 1); }
    for (let i = this.pops.length - 1; i >= 0; i--) { const q = this.pops[i]; q.t -= dt; if (q.t <= 0) { this.pops.splice(i, 1); this.explode(q.pos); } }
  },

  /* ---------------- camera & rendering ---------------- */
  camera() {
    const p = this.p, st = Save.data.settings;
    let fov = st.fov * DEG;
    if (p.scoped) fov = 22 * DEG;
    else fov *= 1 - (Shop.attOf(p.weapon).reddot ? 0.3 : 0.22) * (p.adsT || 0);
    fov += this.fx.fovKick;
    let eye = p.eye.slice(), yaw = p.yaw + p.recoilYaw * 0.6, pitch = p.pitch + p.recoil, roll = p.strafeRoll * 0.5;
    if (!p.alive) {
      eye = [p.pos[0], p.pos[1] + 2.8, p.pos[2]];
      const k = this.deathCam;
      if (k) {
        const tgt = [k.pos[0], k.pos[1] + 1.2, k.pos[2]];
        const d = V.sub([0, 0, 0], tgt, eye);
        yaw = V.yawOf(d); pitch = V.pitchOf(d);
      } else pitch = -0.6;
      roll = 0;
    }
    if (this.fx.shake > 0 && st.shake) {
      const s = this.fx.shake * 0.06;
      eye[0] += (Math.random() - 0.5) * s; eye[1] += (Math.random() - 0.5) * s; eye[2] += (Math.random() - 0.5) * s;
    }
    return { eye, yaw, pitch, roll, fovy: fov };
  },
  viewModelMatrix(out) {
    const p = this.p, w = this.weapon();
    M4.copy(out, GFX.camWorld);
    const speed = Math.hypot(p.vel[0], p.vel[2]);
    const mv = p.onGround ? U.clamp(speed / PLAYER_SPEED, 0, 1.4) : 0.15;
    const bx = Math.sin(p.walkPhase) * 0.011 * mv, by = -Math.abs(Math.cos(p.walkPhase)) * 0.009 * mv;
    let drop = 0, rp = 0, rr = 0;
    if (p.reloadT > 0) { const k = 1 - p.reloadT / p.reloadMax; const s = Math.sin(U.clamp(k, 0, 1) * Math.PI); drop = s * 0.06; rp = -s * 0.45; rr = s * 0.45; }
    if (p.switchT > 0) { const s = p.switchT / 0.35; drop += s * 0.2; rp -= s * 0.7; }
    const ax = U.clamp(GFX.aspect / 1.7, 0.45, 1); // keep the gun on screen in portrait windows
    // aiming pulls the gun to the middle so its sight lines up with the crosshair
    const a = p.adsT || 0, bob = 1 - 0.75 * a;
    const G = GUNS[w.id] || GUNS.pistol;
    if (G.sightY == null) G.sightY = Math.max(0.05, ...G.parts.filter(q => q[6] === 3).map(q => q[1]));
    const vx = U.lerp(w.vm[0] * ax, 0, a), vy = U.lerp(w.vm[1], -0.09 + (0.1 - G.sightY), a), vz = w.vm[2] + 0.07 * a;
    M4.translate(out, out, vx + bx * bob + p.vmSwayX * bob, vy + by * bob - drop + p.vmSwayY * bob, vz + p.kick * 0.045 * (1 - 0.5 * a));
    M4.rotY(out, out, p.vmSwayX * 2);
    M4.rotX(out, out, p.kick * 0.16 + rp);
    M4.rotZ(out, out, rr + p.strafeRoll);
    return out;
  },
  muzzleWorld(out) {
    const G = GUNS[this.p.weapon] || GUNS.pistol;
    const m = this.viewModelMatrix(this.tmpM);
    const wp = M4.transformPoint([0, 0, 0], m, G.muzzle);
    const cs = M4.transformPoint([0, 0, 0], GFX.view, wp);
    const k = Math.tan(GFX.fovy / 2) / Math.tan(GFX.vmFovy / 2);
    cs[0] *= k; cs[1] *= k;
    return M4.transformPoint(out, GFX.camWorld, cs);
  },
  submit() {
    const S = Shop.S, B = GFX.b, frozen = this.freezeT > 0, t = this.clock;
    for (const b of this.bots) {
      if (!b.alive || b.gone) continue;
      const ally = b.team === 'blue';
      // teammates go in a separate batch so wallhack chams only light up enemies
      Models.bot(ally ? B.dyn : B.bots, b, ally ? 1 : S.headVisual, frozen && !ally, t);
      Models.shadow(B.trans, b.pos[0], b.pos[1], b.pos[2], 0.85);
    }
    Extras.drawChips(B.dyn);
    More.draw(B.dyn);
    const m = Models.m4;
    for (const q of this.parts) {
      if (!q.alive) continue;
      const f = Math.min(1, q.life / 0.35);
      M4.ident(m); M4.translate(m, m, q.x, q.y, q.z); M4.rotY(m, m, q.ry); M4.rotX(m, m, q.rx);
      GFX.push(B.dyn, m, q.sx * f, q.sy * f, q.sz * f, q.r, q.g, q.b, 1, 0, q.emis, 0.2, 0);
    }
    for (const d of this.decals) {
      if (d.life <= 0) continue;
      const s = Math.min(1, d.life) * 0.09, n = d.n;
      GFX.pushAA(B.dyn, d.p[0], d.p[1], d.p[2], n[0] ? 0.01 : s, n[1] ? 0.01 : s, n[2] ? 0.01 : s, 0.13, 0.13, 0.15, 1, 0, 0, 0, 0);
    }
    for (const tr of this.tracers) {
      const len = V.dist(tr.a, tr.b);
      if (len < 0.05) continue;
      const dir = V.scale([0, 0, 0], V.sub([0, 0, 0], tr.b, tr.a), 1 / len);
      const mid = V.madd([0, 0, 0], tr.a, dir, len / 2);
      M4.fromDir(m, mid, dir);
      const a = tr.life / tr.max;
      GFX.push(B.trans, m, tr.w, tr.w, len, tr.col[0], tr.col[1], tr.col[2], 0.85 * a, 0, 1, 0, 0);
    }
    for (const bl of this.blasts) {
      const k = 1 - bl.life / bl.max, r = 1 + k * 9;
      M4.ident(m); M4.translate(m, m, bl.p[0], bl.p[1], bl.p[2]); M4.rotY(m, m, k * 2);
      GFX.push(B.trans, m, r, r, r, 1, 0.55, 0.85, 0.45 * (1 - k), 0, 1, 0, 0);
      M4.rotX(m, m, Math.PI / 4);
      GFX.push(B.trans, m, r * 0.8, r * 0.8, r * 0.8, 1, 0.95, 0.5, 0.35 * (1 - k), 0, 1, 0, 0);
    }
    const p = this.p;
    if (p.alive && !p.scoped && this.phase !== 'over') {
      const vm = this.viewModelMatrix(this.vmMat);
      const sight = U.hex(Save.data.xhair.color || '#7cffb2');
      Models.gun(B.view, vm, p.weapon, Save.data.skinOf[p.weapon] || 'factory', { hands: true, sight, pump: p.pump, att: Shop.attOf(p.weapon) });
      if (this.fx.muzzle > 0) {
        const G = GUNS[p.weapon] || GUNS.pistol, mz = G.muzzle;
        M4.translate(m, vm, mz[0], mz[1], mz[2] - 0.04);
        M4.rotZ(m, m, Math.random() * 3);
        const s = p.weapon === 'rail' ? 0.16 : 0.1;
        GFX.push(B.view, m, s, s * 0.35, 0.02, 1, 0.85, 0.45, 1, 0, 1, 0, 0);
        GFX.push(B.view, m, s * 0.35, s, 0.02, 1, 0.95, 0.6, 1, 0, 1, 0, 0);
      }
    }
  },
  render() {
    const S = Shop.S;
    GFX.clearDynamic();
    if (this.on) this.submit();
    GFX.chams = S.chams || Extras.uavT > 0 ? [1, 0.32, 0.86, 0.6] : null;
    GFX.flash = this.fx.flash > 0 ? 0.12 : 0;
    if (this.cam) GFX.setCamera(this.cam);
    GFX.render();
  },
  board() {
    const rows = this.bots.filter(b => !b.gone).map(b => ({ name: b.name, k: b.kills, d: b.deaths, col: b.colHex, ping: 18 + (b.id * 13) % 70, isPlayer: false, team: b.team }));
    rows.push({ name: Save.data.settings.name, k: this.p.kills, d: this.p.deaths, col: '#ffd23f', ping: Shop.S.botAcc < 1 ? 999 : 12, isPlayer: true, team: 'blue' });
    const side = r => (this.mode && !this.mode.ffa && r.team !== 'blue' ? 1 : 0);
    rows.sort((a, b) => side(a) - side(b) || b.k - a.k || a.d - b.d || (a.isPlayer ? -1 : 1));
    return rows;
  },
};

/* ---------------- ray helpers ---------------- */
function raySphere(o, d, c, r) {
  const mx = o[0] - c[0], my = o[1] - c[1], mz = o[2] - c[2];
  const b = mx * d[0] + my * d[1] + mz * d[2];
  const cc = mx * mx + my * my + mz * mz - r * r;
  if (cc > 0 && b > 0) return null;
  const disc = b * b - cc;
  if (disc < 0) return null;
  const t = -b - Math.sqrt(disc);
  return t < 0 ? 0 : t;
}
function rayCylY(o, d, cx, cz, r, y0, y1) {
  const ox = o[0] - cx, oz = o[2] - cz;
  const a = d[0] * d[0] + d[2] * d[2];
  let t0, t1;
  if (a < 1e-9) {
    if (ox * ox + oz * oz > r * r) return null;
    t0 = -1e9; t1 = 1e9;
  } else {
    const b = ox * d[0] + oz * d[2], c = ox * ox + oz * oz - r * r;
    const disc = b * b - a * c;
    if (disc < 0) return null;
    const sq = Math.sqrt(disc);
    t0 = (-b - sq) / a; t1 = (-b + sq) / a;
  }
  let s0, s1;
  if (Math.abs(d[1]) < 1e-9) {
    if (o[1] < y0 || o[1] > y1) return null;
    s0 = -1e9; s1 = 1e9;
  } else {
    s0 = (y0 - o[1]) / d[1]; s1 = (y1 - o[1]) / d[1];
    if (s0 > s1) { const tt = s0; s0 = s1; s1 = tt; }
  }
  const lo = Math.max(t0, s0), hi = Math.min(t1, s1);
  if (lo > hi || hi < 0) return null;
  return Math.max(lo, 0);
}
