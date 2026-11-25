'use strict';
/* =========================================================================
   Style: kill streak money multiplier + style points.
   - Streak multiplier: your current streak multiplies kill credits.
   - Style points: flashy kills (jump shots, no-scopes, last bullet...) score
     points and fill a meter. The meter's rank multiplies kill credits and
     drains when you stop killing. All points pay out at the end of a match.
   ========================================================================= */
const STYLE_RANKS = [
  { at: 0, name: 'MID', short: 'D', mult: 1, color: '#8e9ab5' },
  { at: 60, name: 'DECENT', short: 'C', mult: 1.1, color: '#7cffb2' },
  { at: 150, name: 'CLEAN', short: 'B', mult: 1.2, color: '#4dd4ff' },
  { at: 300, name: 'CRACKED', short: 'A', mult: 1.35, color: '#ffd23f' },
  { at: 500, name: 'INSANE', short: 'S', mult: 1.5, color: '#ff9a3c' },
  { at: 800, name: 'UNREAL', short: 'SS', mult: 1.75, color: '#ff4f9a' },
  { at: 1200, name: 'TOTALLY LEGIT', short: 'SSS', mult: 2, color: '#c084fc' },
];
const STREAK_MULTS = [[20, 2], [10, 1.5], [5, 1.25], [3, 1.1]];
// points and labels for each trick
const TRICKS = {
  kill: [10, 'KILL'], head: [15, 'HEADSHOT'], jump: [40, 'JUMP SHOT'], airhead: [30, 'AIR HEADSHOT'],
  noscope: [35, 'NO SCOPE'], long: [25, 'LONG SHOT'], close: [10, 'FACE TO FACE'], wall: [15, 'WALLBANG'],
  last: [25, 'LAST BULLET'], revenge: [30, 'REVENGE'], clutch: [30, 'CLUTCH'], swap: [20, 'QUICK SWAP'],
  run: [15, 'ON THE RUN'], multi: [20, 'MULTI'], streak: [50, 'STREAK'], bounce: [20, 'RICOCHET'],
};

const Style = {
  meter: 0, idleT: 0, points: 0, bestRank: 0, lastKiller: null, feed: [], jumpKills: 0, noScopes: 0, best: null,

  onMatchStart() {
    this.meter = 0; this.idleT = 0; this.points = 0; this.bestRank = 0; this.lastKiller = null; this.feed = [];
    this.jumpKills = 0; this.noScopes = 0; this.best = null;
  },
  rankOf(m) { let r = 0; for (let i = 0; i < STYLE_RANKS.length; i++) if (m >= STYLE_RANKS[i].at) r = i; return r; },
  rank() { return STYLE_RANKS[this.rankOf(this.meter)]; },
  streakMult(streak) { for (const [n, k] of STREAK_MULTS) if (streak >= n) return k; return 1; },
  // multiplier applied to each kill's credits, from the streak *before* this kill and the current style rank
  killMult(streak) { return this.streakMult(streak) * this.rank().mult; },

  update(dt) {
    this.idleT += dt;
    // after a few quiet seconds the meter drains, faster the higher you are
    if (this.idleT > 3) this.meter = Math.max(0, this.meter - dt * (25 + this.meter * 0.12));
    for (const f of this.feed) f.t -= dt;
    this.feed = this.feed.filter(f => f.t > 0);
  },
  onPlayerDeath(bot) {
    this.lastKiller = bot || null;
    this.meter *= 0.4;
  },
  onKill(b, info, ctx) {
    const M = Match, p = M.p, w = M.weapon(), S = Shop.S;
    const gun = !info.strike && !info.splash && !info.popper && !info.reflect && !info.chain;
    const got = ['kill'];
    if (info.head) got.push('head');
    const air = !p.onGround && (p.airT || 0) > 0.08;
    if (air && gun) { got.push('jump'); this.jumpKills++; if (info.head) got.push('airhead'); Extras.track('jump', 1); }
    if (gun && w.scope && !p.scoped) { got.push('noscope'); this.noScopes++; }
    const d = V.dist(p.pos, b.pos);
    if (gun && d > 45) got.push('long');
    if (gun && d < 2.5) got.push('close');
    if (ctx.wall) got.push('wall');
    if (gun && !S.infAmmo && (p.ammo[w.id] || 0) === 0) got.push('last');
    if (this.lastKiller && b === this.lastKiller) { got.push('revenge'); this.lastKiller = null; }
    if (p.hp < 25) got.push('clutch');
    if (gun && M.clock - (p.lastSwitchT || -99) < 0.8) got.push('swap');
    if (ctx.speed) got.push('run');
    if (info.bounce) got.push('bounce');
    let pts = 0;
    for (const k of got) pts += TRICKS[k][0];
    if (ctx.multi >= 2) pts += TRICKS.multi[0] * (ctx.multi - 1);
    if (p.streak > 0 && p.streak % 5 === 0) pts += TRICKS.streak[0];
    this.points += pts; this.meter += pts; this.idleT = 0;
    const r = this.rankOf(this.meter);
    if (r > this.bestRank) { this.bestRank = r; if (r >= 3) { HUD.callout(STYLE_RANKS[r].name, 'small'); SFX.streak(Math.min(6, r)); } }
    // show the fanciest part of the kill
    let fancy = got.filter(k => k !== 'kill');
    if (fancy.length > 1) fancy = fancy.filter(k => k !== 'head');
    if (fancy.includes('airhead')) fancy = fancy.filter(k => k !== 'jump');
    const label = fancy.slice(-2).reverse().map(k => TRICKS[k][1]).join(' + ') || (ctx.multi >= 2 ? 'MULTI' : 'KILL');
    if (!this.best || pts > this.best.pts) this.best = { pts, label };
    this.feed.push({ text: `+${pts} ${label}`, t: 2.2, big: pts >= 60 });
    if (this.feed.length > 4) this.feed.shift();
    Extras.track('style', this.points);
    if (got.includes('jump') && U.chance(0.35)) Extras.react(CHAT.jumpshot, 0.8);
  },
  // end-of-match payout for every style point earned
  onMatchEnd(banned) {
    const M = Match, s = Save.data.stats;
    s.jumpKills = (s.jumpKills || 0) + this.jumpKills;
    s.noScopes = (s.noScopes || 0) + this.noScopes;
    s.bestStyle = Math.max(s.bestStyle || 0, Math.round(this.points));
    s.topStyleRank = Math.max(s.topStyleRank || 0, this.bestRank);
    if (banned || this.points <= 0) return;
    const c = this.points * M.def.cr * 0.01 * Shop.S.cr * Shop.S.stylePay;
    M.earn.style += c; M.earn.total += c; Save.data.credits += c;
  },
};
