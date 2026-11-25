'use strict';
/* =========================================================================
   More: grenades (C), daily jobs + login streak, and Bandit's black market.
   ========================================================================= */
const More = {
  nades: [], nadesLeft: 0, nadeCD: 0,

  /* ---------------- grenades ---------------- */
  onMatchStart() {
    this.nades = []; this.nadeCD = 0;
    this.nadesLeft = 3 + (Shop.S.grenades || 0);
  },
  update(dt) {
    const M = Match, S = Shop.S, p = M.p;
    this.nadeCD = Math.max(0, this.nadeCD - dt);
    if (!Chat.typing && !M.afk && p.alive && Input.pressed.KeyC) this.throwNade();
    if (M.afk && p.alive && this.nadesLeft > 0 && this.nadeCD <= 0 && M.visibleBotCount() >= 2 && U.chance(dt * 0.6)) this.throwNade();
    for (const n of this.nades) this.stepNade(n, dt);
    this.nades = this.nades.filter(n => !n.done);
  },
  throwNade() {
    const M = Match, p = M.p, S = Shop.S;
    if (this.nadesLeft <= 0 || this.nadeCD > 0) { SFX.deny(); return; }
    this.nadesLeft--; this.nadeCD = 0.6;
    const d = p.aimDir;
    this.nades.push({
      pos: [p.eye[0] + d[0] * 0.6, p.eye[1] - 0.15, p.eye[2] + d[2] * 0.6],
      vel: [d[0] * 17 + p.vel[0] * 0.5, d[1] * 17 + 3.2, d[2] * 17 + p.vel[2] * 0.5],
      t: 1.6 * (S.fuse || 1), stuck: null, off: null, done: false,
    });
    SFX.jump();
    AC.onAbility('nade');
  },
  stepNade(n, dt) {
    const M = Match, S = Shop.S;
    n.t -= dt;
    if (n.stuck) {
      if (n.stuck.alive) { n.pos[0] = n.stuck.pos[0] + n.off[0]; n.pos[1] = n.stuck.pos[1] + n.off[1]; n.pos[2] = n.stuck.pos[2] + n.off[2]; }
    } else {
      if (S.homing) {
        let best = null, bd = 15;
        for (const b of M.bots) { if (!b.alive || b.gone || b.team === 'blue') continue; const d = V.dist(b.pos, n.pos); if (d < bd) { bd = d; best = b; } }
        if (best) { const c = M.chestPoint(best); for (let i = 0; i < 3; i++) n.vel[i] += (c[i] - n.pos[i]) / (bd || 1) * 30 * dt; }
      }
      n.vel[1] -= 20 * (M.def.grav || 1) * dt;
      const sp = V.len(n.vel), step = sp * dt;
      if (step > 0.0001) {
        const dir = V.scale([0, 0, 0], n.vel, 1 / sp);
        const hit = World.raycast(n.pos, dir, step + 0.1);
        if (hit) {
          // bounce off walls and props
          const vn = V.dot(n.vel, hit.n);
          for (let i = 0; i < 3; i++) n.vel[i] = (n.vel[i] - 2 * vn * hit.n[i]) * 0.45;
        } else V.madd(n.pos, n.pos, n.vel, dt);
      }
      if (n.pos[1] < 0.1) { n.pos[1] = 0.1; if (n.vel[1] < 0) n.vel[1] = -n.vel[1] * 0.35; n.vel[0] *= 0.8; n.vel[2] *= 0.8; }
      if (S.sticky) {
        for (const b of M.bots) {
          if (!b.alive || b.gone || b.team === 'blue') continue;
          if (V.dist(M.chestPoint(b), n.pos) < 0.8 * (b.scale || 1)) { n.stuck = b; n.off = V.sub([0, 0, 0], n.pos, b.pos); Chat.queue(b, 'it is stuck to me', 0.2, 1); break; }
        }
      }
    }
    if (n.t <= 0) { n.done = true; this.explode(n.pos); }
  },
  explode(pos) {
    const S = Shop.S, r = 6 * (S.nadeR || 1);
    Extras.splash(pos, { r, dmg: 220 }, null, false, 'nade');
    if (S.cluster) for (let i = 0; i < 4; i++) {
      const a = i / 4 * TAU + Math.random();
      Extras.splash([pos[0] + Math.cos(a) * 3, pos[1], pos[2] + Math.sin(a) * 3], { r: r * 0.5, dmg: 90 }, null, true, 'nade');
    }
    if (U.chance(0.4)) Extras.react(CHAT.nade, 0.4);
  },
  onKill(info) {
    const S = Shop.S, p = Match.p;
    if (S.nadeRefill && p.streak > 0 && p.streak % 5 === 0) { this.nadesLeft++; HUD.callout('+1 GRENADE', 'small'); }
  },
  draw(B) {
    for (const n of this.nades) {
      const blink = Math.sin(n.t * 18) > 0 ? 1 : 0.2;
      GFX.pushAA(B, n.pos[0], n.pos[1], n.pos[2], 0.16, 0.16, 0.16, 0.22, 0.32, 0.2, 1, 0, 0, 0.4, 0);
      GFX.pushAA(B, n.pos[0], n.pos[1] + 0.1, n.pos[2], 0.05, 0.05, 0.05, 1, 0.2, 0.2, 1, 0, blink, 0, 0);
    }
  },

  /* ---------------- daily jobs + login streak ---------------- */
  today() { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); },
  yesterday() { const d = new Date(Date.now() - 864e5); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); },
  checkDay() {
    const D = Save.data, today = this.today();
    const dl = D.daily || (D.daily = { day: '', streak: 0, list: [] });
    if (dl.day === today) return null;
    dl.streak = dl.day === this.yesterday() ? (dl.streak || 0) + 1 : 1;
    dl.day = today;
    // three daily jobs that pay double
    dl.list = [];
    const ex = D.contracts.map(c => c.id);
    for (let i = 0; i < 3; i++) {
      const c = Extras.rollContract(ex.concat(dl.list.map(x => x.id)));
      c.cr *= 2; c.salt *= 2; c.daily = true;
      dl.list.push(c);
    }
    // login bonus grows for 7 days in a row
    const k = Math.min(7, dl.streak);
    const bestCr = Math.max(...MAPS.filter(m => D.maps[m.id]).map(m => m.cr), 10);
    const cr = Math.round(bestCr * 6 * k * Shop.smurfMult()), salt = 8 * k;
    D.credits += cr; D.salt += salt; D.stats.crEarned += cr;
    this.newMarket(true);
    Save.save();
    return { streak: dl.streak, cr, salt };
  },
  claimDaily(i) {
    const D = Save.data, c = D.daily && D.daily.list[i];
    if (!c || !c.done || c.claimed) return null;
    c.claimed = true;
    const cr = Math.round(c.cr * (Shop.S.insider ? 2 : 1) * Shop.S.contractMul);
    D.credits += cr; D.salt += c.salt; D.stats.crEarned += cr;
    D.stats.dailiesDone = (D.stats.dailiesDone || 0) + 1;
    D.stats.xp = (D.stats.xp || 0) + 60;
    Extras.addPassXp(60);
    Extras.checkRank(); Extras.checkAch();
    Save.save();
    return { cr, salt: c.salt };
  },

  /* ---------------- black market ---------------- */
  newMarket(force) {
    const D = Save.data, today = this.today();
    if (!force && D.market && D.market.day === today) return;
    // three cheats you can buy right now, at 30–50% off, for today only
    const pool = U.shuffle(UPGRADES.filter(u => Shop.state(u.id) === 'available'));
    const offs = [0.3, 0.4, 0.5];
    D.market = { day: today, deals: pool.slice(0, 3).map((u, i) => ({ id: u.id, off: offs[i] })) };
  },
  dealOf(id) {
    const m = Save.data.market;
    if (!m || m.day !== this.today()) return null;
    return m.deals.find(d => d.id === id) || null;
  },
};
