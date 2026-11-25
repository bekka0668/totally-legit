'use strict';
/* =========================================================================
   Extras: killstreak rewards, social hacks (fake admin, bounties), the raid
   boss, gun game, splash damage, plus contracts, achievements and ranks.
   Match calls in through a handful of hooks; everything else lives here.
   ========================================================================= */
const Extras = {
  uavT: 0, orbitalCD: 0, adminCD: 0, bounty: null, nuked: false, boss: null, ev: null,
  strikes: [], inStrike: false, notes: [], newAch: [], doneContracts: [], rankBefore: 0,

  /* ---------------- match hooks ---------------- */
  onMatchStart() {
    const M = Match, S = Shop.S;
    this.uavT = 0; this.orbitalCD = 0; this.adminCD = 0; this.bounty = null; this.nuked = false; this.boss = null;
    this.strikes = []; this.inStrike = false; this.newAch = []; this.doneContracts = []; this.bountyT = 0;
    this.rankBefore = this.rankOf(Save.data.stats.xp || 0);
    this.slowT = 0; this.slowCD = 0; this.rewindUsed = false; this.hist = []; this.histT = 0; this.chips = []; this.timeAdded = 0;
    M.ggIdx = 0;
    if (M.mode.id === 'gungame') this.setGun(0, true);
    if (M.mode.id === 'boss') this.makeBoss(M.bots[0]);
    this.spawnRivals();
    if (S.ragebait) { Chat.sus = Math.max(Chat.sus, 40); Chat.peak = Math.max(Chat.peak, 40); }
    if (S.bounty) this.bountyT = 2.5;
    if (M.def.grav) Chat.queue(U.pick(M.bots), U.pick(CHAT.moon), U.rand(6, 10), 0);
    if (M.def.chat) Chat.queue(U.pick(M.bots), U.pick(M.def.chat), U.rand(5, 9), 0);
  },
  update(dt) {
    const M = Match, S = Shop.S;
    this.uavT = Math.max(0, this.uavT - dt);
    this.orbitalCD = Math.max(0, this.orbitalCD - dt);
    this.adminCD = Math.max(0, this.adminCD - dt);
    this.slowT = Math.max(0, this.slowT - dt);
    this.slowCD = Math.max(0, this.slowCD - dt);
    // position history for Rewind
    this.histT -= dt;
    if (this.histT <= 0 && M.p.alive) { this.histT = 0.25; this.hist.push({ pos: M.p.pos.slice(), t: M.clock }); if (this.hist.length > 16) this.hist.shift(); }
    // credit chips
    for (const c of this.chips) {
      c.t -= dt;
      if (c.t > 0 && M.p.alive && V.dist2D(c.pos, M.p.pos) < S.chipRange) {
        c.t = 0;
        M.earn.chips += c.v; M.earn.total += c.v; Save.data.credits += c.v;
        M.addFloater([M.p.pos[0], M.p.pos[1] + 2, M.p.pos[2]], '+' + U.fmt(c.v), '#ffd23f', 0.8, true);
        SFX.coin();
      }
    }
    this.chips = this.chips.filter(c => c.t > 0);
    for (const s of this.strikes) {
      s.t -= dt;
      // a falling marker shows where the hit lands
      if (s.t > 0 && Math.random() < dt * 30) M.addPart(s.pos[0] + U.rand(-s.r, s.r) * 0.6, 0.2, s.pos[2] + U.rand(-s.r, s.r) * 0.6, 0, U.rand(1, 3), 0, 0.12, s.kind === 'laser' ? [0.4, 0.9, 1] : [1, 0.35, 0.2], 0.4, 0, 1, 0);
      if (s.t <= 0 && !s.done) { s.done = true; this.detonate(s); }
    }
    this.strikes = this.strikes.filter(s => !s.done);
    if (S.bounty && M.mode.id !== 'boss') {
      if (!this.bounty || this.bounty.gone || !this.bounty.alive) {
        this.bountyT -= dt;
        if (this.bountyT <= 0) this.pickBounty();
      }
    }
    if (!Chat.typing && !M.afk && M.p.alive) {
      if (Input.pressed.KeyX) this.fireOrbital();
      if (Input.pressed.KeyG) this.fakeAdmin();
      if (Input.pressed.KeyV) this.bulletTime();
    }
    // AFK farm uses the toys too
    if (M.afk && M.p.alive) {
      if (S.orbital && this.orbitalCD <= 0 && M.aimTarget && U.chance(dt)) this.fireOrbital();
      if (S.admin && this.adminCD <= 0 && U.chance(dt * 0.3)) this.fakeAdmin();
      if (S.slowmo && this.slowCD <= 0 && M.visibleBotCount() >= 3) this.bulletTime();
    }
  },
  // extra credit multiplier for special kills (bounty, boss, nuke)
  killMult(b, info) {
    let k = 1;
    if (b.bounty) k *= 5 + Shop.S.bountyAdd;
    if (b.cheater) k *= 6;
    if (b.boss) k *= 15;
    if (info.nuke) k *= 2;
    return k;
  },
  onPlayerKill(b, info, ctx) {
    const M = Match, p = M.p, S = Shop.S, s = Save.data.stats;
    this.track('kill', 1);
    if (info.head) this.track('hs', 1);
    if (ctx.wall) this.track('wall', 1);
    if (p.multi === 2) this.track('multi', 1);
    this.track('streak', p.streak);
    if (!info.strike && !info.splash && !info.popper && !info.reflect) this.track('weapon', 1, M.weapon().id);
    else if (info.splash) this.track('weapon', 1, 'launcher');
    if (b.bounty) {
      b.bounty = false; this.bounty = null; this.bountyT = 2;
      s.bounties = (s.bounties || 0) + 1; this.track('bounty', 1);
      HUD.callout('BOUNTY CLAIMED', 'multi'); SFX.coin();
    }
    if (b.boss) this.bossDown(b);
    if (b.cheater) this.rivalDown(b);
    if (S.chips && !b.boss) this.chips.push({ pos: [b.pos[0] + U.rand(-0.5, 0.5), 0, b.pos[2] + U.rand(-0.5, 0.5)], v: M.def.cr * 0.5 * S.cr * S.chipMul, t: 12 });
    if (S.timeThief && M.mode.id !== 'clutch' && this.timeAdded < S.thiefCap) { M.time += 1; M.total += 1; this.timeAdded++; }
    if (S.chain && !info.chain) this.chainLightning(b);
    if (M.mode.id === 'gungame' && M.phase === 'play') this.gunUp();
    if (!this.inStrike) this.onStreak(p.streak);
  },
  onPlayerDeath(prevStreak) {
    const p = Match.p;
    if (Shop.S.hardline && prevStreak >= 2) { p.streak = Math.floor(prevStreak / 2); HUD.callout(`HARDLINE: STREAK ${p.streak}`, 'small'); }
  },
  onRageQuit() {
    this.track('ragequit', 1);
    if (Shop.S.ragebait) {
      const salt = 6 * Shop.S.salt;
      Chat.salt += salt; Match.earn.salt += salt; Save.data.salt += salt; HUD.saltPop(salt);
      this.track('salt', salt);
    }
  },

  /* ---------------- KILLSTREAK.EXE ---------------- */
  onStreak(n) {
    const M = Match, S = Shop.S, p = M.p;
    if (S.recon && n % 6 === 3) {
      this.uavT = 12 * S.uavTime; this.call('RECON DRONE ONLINE');
    }
    if (S.carePkg && n % 5 === 0) {
      p.hp = 100;
      const cash = M.def.cr * 4 * S.cr * S.careMul;
      M.earn.streak += cash; M.earn.total += cash; Save.data.credits += cash;
      M.addFloater([p.pos[0], p.pos[1] + 2.4, p.pos[2]], '+' + U.fmt(cash) + ' CR', '#ffd23f', 1.3, true);
      this.call('CARE PACKAGE'); SFX.coin();
    }
    if (S.airstrike && n % 8 === 0) {
      this.strikes.push({ pos: this.aimGround(80), r: 9 * S.strikeR, t: 1.1, kind: 'air' });
      AC.onAbility('airstrike');
      this.call('AIRSTRIKE INBOUND');
      this.react(CHAT.strike, 1.4);
    }
    if (S.nuke && n >= 25 && !this.nuked) {
      this.nuked = true;
      this.call('CTRL+ALT+DELETE');
      this.strikes.push({ pos: [M.p.pos[0], 0, M.p.pos[2]], r: 9999, t: 1.6, kind: 'nuke' });
      AC.onAbility('nuke');
      this.react(CHAT.nuke, 2.2);
    }
  },
  call(text) {
    HUD.callout(text, 'multi'); SFX.streak(5);
    Save.data.stats.streakCalls = (Save.data.stats.streakCalls || 0) + 1;
    this.track('streakcall', 1);
  },
  aimGround(maxD) {
    const p = Match.p;
    const hit = World.raycast(p.eye, p.aimDir, maxD);
    const t = hit ? hit.t : Math.min(maxD, p.aimDir[1] < -0.02 ? p.eye[1] / -p.aimDir[1] : 40);
    const pt = V.madd([0, 0, 0], p.eye, p.aimDir, Math.max(2, t - 0.3));
    pt[1] = 0;
    return pt;
  },
  fireOrbital() {
    const S = Shop.S;
    if (!S.orbital) return;
    if (this.orbitalCD > 0) { SFX.deny(); return; }
    this.orbitalCD = 20 * S.orbitalCD;
    this.strikes.push({ pos: this.aimGround(160), r: 6, t: 0.45, kind: 'laser' });
    HUD.callout('ORBITAL LASER', 'multi'); SFX.freeze();
    AC.onAbility('orbital');
    Chat.addSus(8);
    this.react(CHAT.laser, 1);
  },
  detonate(s) {
    const M = Match;
    this.inStrike = true;
    const c = s.pos;
    if (s.kind === 'laser') {
      M.addTracer([c[0], 70, c[2]], [c[0], 0, c[2]], [0.45, 0.95, 1], 1.4, 0.7);
      M.addTracer([c[0], 70, c[2]], [c[0], 0, c[2]], [1, 1, 1], 0.5, 0.7);
      M.blasts.push({ p: [c[0], 0.5, c[2]], life: 0.5, max: 0.5 });
    } else if (s.kind === 'air') {
      for (let i = 0; i < 5; i++) {
        const q = [c[0] + U.rand(-5, 5), 0.6, c[2] + U.rand(-5, 5)];
        M.addTracer([q[0] - 30, 50, q[2] - 10], q, [1, 0.7, 0.3], 0.18, 0.35);
        M.blasts.push({ p: q, life: 0.45, max: 0.45 });
        for (let k = 0; k < 14; k++) M.addPart(q[0], q[1], q[2], U.rand(-6, 6), U.rand(2, 9), U.rand(-6, 6), 0.14, [1, U.rand(0.3, 0.7), 0.15], U.rand(0.8, 1.6), 12, 1, 0.3);
      }
    } else {
      M.fx.flash = 0.4;
      for (const b of M.bots) if (b.alive && !b.gone && b.team !== 'blue') M.blasts.push({ p: [b.pos[0], 1, b.pos[2]], life: 0.6, max: 0.6 });
      Save.data.stats.nukes = (Save.data.stats.nukes || 0) + 1;
    }
    SFX.pop(); M.fx.shake = Math.max(M.fx.shake, s.kind === 'nuke' ? 1 : 0.6);
    for (const b of M.bots) {
      if (!b.alive || b.gone || b.team === 'blue') continue;
      if (V.dist2D(b.pos, c) > s.r) continue;
      const dmg = b.boss ? (s.kind === 'nuke' ? b.maxHp * 0.5 : s.kind === 'laser' ? 900 : 500) : 9999;
      M.damageBot(b, dmg, false, { strike: true, nuke: s.kind === 'nuke', dir: V.norm([0, 0, 0], V.sub([0, 0, 0], b.pos, c)), hitPos: M.chestPoint(b) });
    }
    this.inStrike = false;
  },

  /* ---------------- splash damage (Party Cannon) ---------------- */
  splash(pt, sp, direct, small) {
    const M = Match;
    if (small) {
      M.blasts.push({ p: pt.slice(), life: 0.18, max: 0.18 });
      for (let i = 0; i < 6; i++) M.addPart(pt[0], pt[1], pt[2], U.rand(-3, 3), U.rand(1, 4), U.rand(-3, 3), 0.07, [1, 0.6, 0.2], 0.5, 6, 1, 0);
    } else {
    M.blasts.push({ p: pt.slice(), life: 0.4, max: 0.4 });
    for (let i = 0; i < 36; i++) M.addPart(pt[0], pt[1], pt[2], U.rand(-6, 6), U.rand(1, 8), U.rand(-6, 6), 0.08, U.hsv(Math.random(), 0.75, 1), U.rand(1.2, 2.4), 5, 0.7, 0.1, 0.014, 0.12);
    SFX.pop();
    M.fx.shake = Math.max(M.fx.shake, 0.35);
    }
    for (const b of M.bots) {
      if (!b.alive || b.gone || b.team === 'blue' || b === direct) continue;
      const d = V.dist(pt, M.chestPoint(b));
      if (d > sp.r * (b.scale || 1)) continue;
      M.damageBot(b, sp.dmg * (1 - 0.5 * d / sp.r), false, { splash: true, dir: V.norm([0, 0, 0], V.sub([0, 0, 0], b.pos, pt)), hitPos: M.chestPoint(b) });
    }
  },

  /* ---------------- GUNSMITH / CHRONO ---------------- */
  chainLightning(src) {
    const M = Match;
    const near = M.bots.filter(b => b.alive && !b.gone && b.team !== 'blue' && b !== src && V.dist(b.pos, src.pos) < 14)
      .sort((a, b) => V.dist(a.pos, src.pos) - V.dist(b.pos, src.pos)).slice(0, Shop.S.chainN);
    for (const b of near) {
      const a = M.chestPoint(src), c = M.chestPoint(b);
      M.addTracer(a, c, [0.6, 0.85, 1], 0.05, 0.25);
      M.addTracer([a[0], a[1] + 0.3, a[2]], [c[0], c[1] - 0.2, c[2]], [1, 1, 1], 0.02, 0.2);
      M.damageBot(b, 120, false, { chain: true, dir: V.norm([0, 0, 0], V.sub([0, 0, 0], b.pos, src.pos)), hitPos: c });
    }
  },
  ricochet(from, w) {
    const M = Match;
    let best = null, bd = 15;
    for (const b of M.bots) {
      if (!b.alive || b.gone || b.team === 'blue') continue;
      const c = M.chestPoint(b), d = V.dist(from, c);
      if (d < bd && World.los(from, c)) { bd = d; best = b; }
    }
    if (!best) return;
    const c = M.chestPoint(best);
    M.addTracer(from, c, [1, 0.9, 0.5], 0.015, 0.12);
    M.damageBot(best, w.dmg * Shop.S.dmgMul, false, { bounce: true, dir: V.norm([0, 0, 0], V.sub([0, 0, 0], c, from)), hitPos: c });
  },
  bulletTime() {
    const S = Shop.S;
    if (!S.slowmo) return;
    if (this.slowCD > 0) { SFX.deny(); return; }
    this.slowT = (S.matrix ? 8 : 5) + S.slowAdd; this.slowCD = (S.matrix ? 15 : 25) * S.slowCDMul + this.slowT;
    HUD.callout('BULLET TIME', 'multi'); SFX.freeze();
    AC.onAbility('slowmo');
    this.react(CHAT.freeze, 1);
  },
  botTime() { return this.slowT > 0 ? 0.3 : 1; },
  tryRewind() {
    const M = Match, p = M.p;
    if (!Shop.S.rewind || (this.rewindUsed || 0) >= Shop.S.rewinds || !this.hist.length) return false;
    this.rewindUsed = (this.rewindUsed || 0) + 1;
    const h = this.hist.find(x => M.clock - x.t <= 3.2) || this.hist[0];
    for (let i = 0; i < 14; i++) M.addPart(p.pos[0], p.pos[1] + U.rand(0.2, 1.8), p.pos[2], U.rand(-1.5, 1.5), U.rand(-0.5, 1.5), U.rand(-1.5, 1.5), 0.08, [0.65, 0.55, 1], 0.6, 0, 1, 0);
    V.copy(p.pos, h.pos); V.set(p.vel, 0, 0, 0);
    p.hp = 100; p.prot = 1;
    HUD.callout('REWIND', 'multi'); SFX.blink();
    AC.addActive(2);
    return true;
  },
  drawChips(B) {
    const M = Match;
    for (const c of this.chips) {
      const bob = 0.35 + Math.sin(M.clock * 4 + c.pos[0]) * 0.08;
      const a = Math.min(1, c.t / 1.5);
      GFX.pushAA(B, c.pos[0], bob, c.pos[2], 0.22 * a, 0.22 * a, 0.06, 1, 0.82, 0.25, 1, 0, 0.9, 0.6, 0);
    }
  },

  /* ---------------- SOCIAL HACK ---------------- */
  fakeAdmin() {
    const M = Match, S = Shop.S;
    if (!S.admin) return;
    if (this.adminCD > 0) { SFX.deny(); return; }
    const hit = M.traceBots(M.p.eye, M.p.aimDir, true);
    let b = hit && !hit.bot.boss ? hit.bot : null;
    if (!b) {
      const pool = M.bots.filter(o => o.alive && !o.gone && o.team !== 'blue' && !o.boss);
      // the saltiest one goes first
      b = pool.find(o => o.pers === 'salty') || U.pick(pool);
    }
    if (!b) { SFX.deny(); return; }
    this.adminCD = 15 * S.kickCD;
    if (b.alive) M.debris(b, null, true);
    b.alive = false; b.gone = true; b.rejoinT = U.rand(4, 7);
    if (b.bounty) { b.bounty = false; this.bounty = null; this.bountyT = 2; }
    const pay = M.def.cr * (M.mode.pay || 1) * 2 * S.cr;
    M.earn.kick += pay; M.earn.total += pay; Save.data.credits += pay;
    Chat.server(`${b.name} was kicked by admin (${Save.data.settings.name}).`);
    HUD.callout(`KICKED ${b.name} +${U.fmt(pay)} CR`, 'small'); SFX.deny();
    Save.data.stats.kicks = (Save.data.stats.kicks || 0) + 1;
    AC.onAbility('kick');
    this.track('kick', 1);
    Chat.addSus(5);
    this.react(CHAT.kicked, 0.8);
    if (M.mode.id === 'clutch' && M.phase === 'play' && !M.roundOver && M.foesAlive() === 0) M.endRound(true);
  },
  pickBounty() {
    const M = Match;
    const pool = M.bots.filter(b => b.alive && !b.gone && b.team !== 'blue' && !b.boss);
    if (!pool.length) { this.bountyT = 1; return; }
    const b = U.pick(pool);
    b.bounty = true; this.bounty = b;
    Chat.server(`Bounty posted on ${b.name}: 5× credits.`);
    if (U.chance(0.5)) Chat.queue(b, U.pick(CHAT.bounty), U.rand(0.8, 2), 0);
  },
  react(pool, delay) {
    const foes = Match.bots.filter(b => b.team !== 'blue' && !b.gone);
    if (foes.length) Chat.queue(U.pick(foes), U.pick(pool), delay + U.rand(0, 0.8), Math.max(2, Chat.tier));
  },

  /* ---------------- rival cheaters ---------------- */
  spawnRivals() {
    const M = Match;
    const foes = M.bots.filter(b => b.team !== 'blue' && !b.boss);
    if (foes.length < 5) return;
    if (!U.chance(AC.det >= 50 ? 0.4 : 0.2)) return;
    const n = foes.length >= 12 && U.chance(0.5) ? 2 : 1;
    U.shuffle(foes.slice()).slice(0, n).forEach((b, i) => this.makeRival(b, 6 + i * 5));
  },
  makeRival(b, delay) {
    b.cheater = true; b.accVar *= 1.6; b.prevAcc = b.col.acc; b.prevHex = b.colHex;
    b.col.acc = U.hex('#b14dff'); b.colHex = '#b14dff';
    const other = Match.bots.find(o => o !== b && o.team !== 'blue');
    if (other) Chat.queue(other, U.pick(CHAT.rivalCall).replace('{n}', b.name), delay || 6, 1);
  },
  rivalDown(b) {
    const M = Match, D = Save.data, s = D.stats;
    const n = 1 + (U.chance(0.5) ? 1 : 0) + Shop.S.partsAdd;
    D.parts = (D.parts || 0) + n; M.earn.parts = (M.earn.parts || 0) + n;
    s.rivals = (s.rivals || 0) + 1;
    this.track('rival', 1);
    HUD.callout(`RIVAL CHEATER DOWN · +${n} LOADER PART${n > 1 ? 'S' : ''}`, 'multi'); SFX.coin();
    Chat.queue(b, U.pick(CHAT.rivalDown), 0.4, 0);
    // they log off and come back clean
    b.cheater = false; b.accVar /= 1.6; b.col.acc = b.prevAcc || b.col.acc; b.colHex = b.prevHex || b.colHex;
  },

  /* ---------------- Bandit Pass ---------------- */
  passInfo() {
    const xp = Save.data.stats.passXp || 0, tier = Math.min(PASS_TIERS, Math.floor(xp / PASS_XP));
    return { xp, tier, frac: tier >= PASS_TIERS ? 1 : (xp % PASS_XP) / PASS_XP, into: xp % PASS_XP };
  },
  addPassXp(n) {
    const s = Save.data.stats;
    s.passXp = (s.passXp || 0) + n;
    this.checkPass();
  },
  checkPass() {
    const D = Save.data, tier = this.passInfo().tier, msgs = [];
    while ((D.passClaimed || 0) < tier) {
      D.passClaimed = (D.passClaimed || 0) + 1;
      msgs.push(`Bandit Pass tier ${D.passClaimed}: ${this.grantPass(D.passClaimed)}`);
    }
    if (!msgs.length) return;
    // several tiers at once collapse into one line so they don't flood the screen
    const shown = msgs.length > 2 ? [`Bandit Pass: +${msgs.length} tiers, now tier ${D.passClaimed}. See the Pass tab.`] : msgs;
    this.notes.push(...shown);
    if (Game.mode !== 'match') for (const m of shown) Hub.toast(m, 'good');
  },
  passLabel(r) {
    if (r.kind === 'skin') return (SKIN_BY_ID[r.id] || {}).name + ' finish';
    if (r.kind === 'xhair') return (XHAIRS.find(x => x.id === r.id) || {}).name + ' crosshair';
    if (r.kind === 'killfx') return (KILLFX.find(x => x.id === r.id) || {}).name + ' kill effect';
    if (r.kind === 'parts') return r.n + ' loader part' + (r.n > 1 ? 's' : '');
    if (r.kind === 'salt') return r.n + ' salt';
    return U.fmt(this.passCr(r.n)) + ' CR';
  },
  passCr(n) { return Math.round(Math.max(...MAPS.filter(m => Save.data.maps[m.id]).map(m => m.cr), 10) * n * Shop.smurfMult()); },
  grantPass(i) {
    const D = Save.data, r = passReward(i);
    if (r.kind === 'skin') D.skins[r.id] = true;
    else if (r.kind === 'xhair') D.xhairs[r.id] = true;
    else if (r.kind === 'killfx') D.killfxs[r.id] = true;
    else if (r.kind === 'parts') D.parts = (D.parts || 0) + r.n;
    else if (r.kind === 'salt') D.salt += r.n;
    else { const c = this.passCr(r.n); D.credits += c; D.stats.crEarned += c; }
    return this.passLabel(r);
  },

  /* ---------------- Raid Boss ---------------- */
  makeBoss(b) {
    if (!b) return;
    const M = Match, tier = Math.max(0, MAPS.indexOf(M.def));
    b.boss = true; b.scale = 2.6; b.speedVar = 0.72; b.accVar = 1.1;
    b.name = 'BIG_' + b.name.toUpperCase();
    b.maxHp = b.hp = Math.round(2200 * (1 + tier * 0.7));
    b.col.body = U.hex('#3a3d48'); b.col.acc = U.hex('#ff3d3d'); b.colHex = '#ff3d3d';
    b.pers = 'tryhard';
    this.boss = b;
    Chat.queue(b, U.pick(CHAT.bossGreet), 1.5, 0);
  },
  onBossHit(b) {
    if (U.chance(0.04)) Chat.queue(b, U.pick(CHAT.bossHurt), 0.2, 0);
  },
  bossDown(b) {
    const M = Match;
    Chat.queue(b, U.pick(CHAT.bossDown), 0.1, 0);
    Save.data.stats.bosses = (Save.data.stats.bosses || 0) + 1;
    HUD.callout('RAID BOSS DOWN', 'multi'); SFX.streak(6);
    for (let i = 0; i < 6; i++) M.blasts.push({ p: [b.pos[0] + U.rand(-2, 2), U.rand(0.5, 4), b.pos[2] + U.rand(-2, 2)], life: 0.6, max: 0.6 });
    M.bossDown = true;
    if (M.mode.id === 'boss') setTimeout(() => { if (Match.on && Match.phase === 'play') Match.finish(false); }, 1400);
  },

  /* ---------------- Hand-Me-Downs (gun game) ---------------- */
  setGun(i, quiet) {
    const M = Match, p = M.p, id = GUNGAME_ORDER[Math.min(i, GUNGAME_ORDER.length - 1)], w = WEAPON_BY_ID[id];
    p.weapon = id; p.ammo[id] = M.magSize(w); p.reloadT = 0; p.switchT = quiet ? 0 : 0.3; p.scoped = false;
    if (!quiet) { HUD.callout(`${i + 1}/${GUNGAME_ORDER.length} · ${w.name.toUpperCase()}`, 'small'); SFX.ui(); }
  },
  gunUp() {
    const M = Match;
    M.ggIdx++;
    if (M.ggIdx >= GUNGAME_ORDER.length) {
      HUD.callout('FINAL GUN. GAME OVER.', 'multi');
      M.finish(false);
      return;
    }
    this.setGun(M.ggIdx);
    if (M.ggIdx === GUNGAME_ORDER.length - 1) this.react(CHAT.gungame, 0.6);
  },

  /* ---------------- end of match: contracts, xp, achievements ---------------- */
  onMatchEnd(win, early) {
    const M = Match, S = Shop.S, s = Save.data.stats;
    if (S.clip && M.earn.salt > 0 && !early && !AC.banned) {
      const c = M.earn.salt * M.def.cr * S.clipMul;
      M.earn.clip = c; M.earn.total += c; Save.data.credits += c;
    }
    if (S.interest && !AC.banned) {
      const c = Math.min(Math.max(0, Save.data.credits) * S.interestRate, M.def.cr * 20 * S.cr * S.interestCap);
      M.earn.interest = c; M.earn.total += c; Save.data.credits += c;
    }
    if (!early) {
      this.track('map', 1, M.def.id);
      if (win) { this.track('win', 1); if (M.mode.id !== 'ffa') this.track('modewin', 1, M.mode.id); }
    }
    const xp = Math.round(M.st.kills + M.st.hs * 0.5 + (win ? 30 : 0) + (early ? 0 : 10));
    M.earn.xp = xp;
    s.xp = (s.xp || 0) + xp;
    this.addPassXp(xp);
  },
  // runs after finish() has folded this match into the career stats
  afterStats() { this.checkRank(); this.checkAch(); },

  /* contracts */
  ensureContracts() {
    const D = Save.data;
    if (!Array.isArray(D.contracts)) D.contracts = [];
    D.contracts = D.contracts.filter(c => c && CONTRACT_BY_ID[c.id]);
    while (D.contracts.length < 3) D.contracts.push(this.rollContract(D.contracts.map(c => c.id)));
  },
  rollContract(exclude) {
    const D = Save.data;
    const pool = CONTRACTS.filter(t => !exclude.includes(t.id) && (!t.req || t.req()));
    const t = U.pick(pool.length ? pool : CONTRACTS);
    const tier = MAPS.filter(m => D.maps[m.id]).length;
    const n = t.fixed ? t.base : Math.max(1, Math.round(t.base * (0.7 + tier * 0.3) / 5) * 5 || t.base);
    const bestCr = Math.max(...MAPS.filter(m => D.maps[m.id]).map(m => m.cr), 10);
    const cr = Math.round(bestCr * t.pay * (14 + Math.sqrt(n) * 4) * Shop.smurfMult());
    return { id: t.id, n, prog: 0, arg: t.arg ? t.arg() : null, cr, salt: Math.round(4 + t.pay * 5), done: false };
  },
  contractText(c) {
    const t = CONTRACT_BY_ID[c.id];
    return t.text.replace('{n}', U.fmt(c.n)).replace('{a}', t.label ? (t.label(c.arg) || c.arg) : '');
  },
  track(stat, n, arg) {
    const D = Save.data;
    if (!Array.isArray(D.contracts)) return;
    for (const c of D.contracts) {
      if (c.done) continue;
      const t = CONTRACT_BY_ID[c.id];
      if (!t || t.stat !== stat || (c.arg && c.arg !== arg)) continue;
      c.prog = t.max ? Math.max(c.prog, n) : c.prog + n;
      if (c.prog >= c.n) {
        c.prog = c.n; c.done = true;
        this.doneContracts.push(this.contractText(c));
        if (Game.mode === 'match' && Match.on) { Chat.sys(`Contract done: ${this.contractText(c)}. Claim it at the Play tab.`); SFX.coin(); }
        else Hub.toast('Contract done: ' + this.contractText(c), 'good');
      }
    }
  },
  claim(i) {
    const D = Save.data, c = D.contracts[i];
    if (!c || !c.done) return false;
    const cr = Math.round(c.cr * (Shop.S.insider ? 2 : 1) * Shop.S.contractMul);
    D.credits += cr; D.salt += c.salt;
    D.stats.crEarned += cr;
    D.stats.contracts = (D.stats.contracts || 0) + 1;
    D.stats.xp = (D.stats.xp || 0) + 40;
    this.addPassXp(40);
    D.contracts[i] = this.rollContract(D.contracts.map(x => x.id));
    this.checkRank(); this.checkAch();
    Save.save();
    return Object.assign({}, c, { cr });
  },
  reroll(i) {
    const D = Save.data, c = D.contracts[i];
    if (!c || c.done || D.salt < 10) return false;
    D.salt -= 10;
    D.contracts[i] = this.rollContract(D.contracts.map(x => x.id));
    Save.save();
    return true;
  },

  /* ranks */
  rankOf(xp) { let r = 0; for (let i = 0; i < RANK_XP.length; i++) if (xp >= RANK_XP[i]) r = i; return r; },
  rankInfo() {
    const xp = Save.data.stats.xp || 0, r = this.rankOf(xp);
    const next = RANK_XP[r + 1];
    return { r, name: RANKS[r], xp, cur: RANK_XP[r], next, frac: next ? (xp - RANK_XP[r]) / (next - RANK_XP[r]) : 1 };
  },
  checkRank() {
    const D = Save.data, r = this.rankOf(D.stats.xp || 0);
    const seen = D.rankSeen || 0;
    if (r > seen) {
      let salt = 0;
      for (let k = seen + 1; k <= r; k++) salt += 10 * k;
      D.salt += salt; D.rankSeen = r;
      const msg = `Rank up: ${RANKS[r]} (+${salt} salt)`;
      this.notes.push(msg);
      if (Game.mode !== 'match') Hub.toast(msg, 'good');
    }
  },

  /* achievements */
  checkAch() {
    const D = Save.data;
    if (!D.ach) D.ach = {};
    for (const a of ACHIEVEMENTS) {
      if (D.ach[a.id]) continue;
      let ok = false;
      try { ok = a.test(D.stats); } catch (e) { ok = false; }
      if (!ok) continue;
      D.ach[a.id] = true; D.salt += a.salt;
      this.newAch.push(a);
      if (Game.mode !== 'match') Hub.toast(`Achievement: ${a.name} (+${a.salt} salt)`, 'good');
    }
  },
  takeNotes() { const n = this.notes; this.notes = []; return n; },
};
