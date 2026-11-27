'use strict';
/* =========================================================================
   Lobby chat + suspicion. The more obvious you are, the saltier it gets.
   ========================================================================= */
const Chat = {
  log: [], pending: [],
  sus: 0, peak: 0, tier: 0, calmT: 0, reports: 0, salt: 0, msgs: 0,
  idleT: 4, serverT: 10, rageT: 0, gap: 0, typing: false, draft: '',

  reset() {
    this.log = []; this.pending = [];
    this.sus = 0; this.peak = 0; this.tier = 0; this.calmT = 0; this.reports = 0; this.salt = 0; this.msgs = 0;
    this.idleT = U.rand(5, 8); this.serverT = 14; this.rageT = 0; this.gap = 0; this.typing = false; this.draft = '';
  },
  tierOf(s) { return s < 15 ? 0 : s < 35 ? 1 : s < 60 ? 2 : s < 85 ? 3 : 4; },
  addSus(n) {
    if (n > 0 && Shop.S && Shop.S.susGain) n *= Shop.S.susGain;
    this.sus = U.clamp(this.sus + n, 0, 100);
    this.peak = Math.max(this.peak, this.sus);
    if (n > 0) this.calmT = 0;
  },
  persTier(bot) {
    const off = bot.pers === 'salty' ? 1 : bot.pers === 'chill' ? -1 : 0;
    return U.clamp(this.tier + off, 0, 4);
  },
  linesFor(t) { return t === 0 ? CHAT.idle0 : CHAT['tier' + t]; },

  update(dt) {
    const M = Match;
    this.calmT += dt;
    if (this.calmT > 3) this.sus = Math.max(0, this.sus - dt * 1.3);
    this.tier = this.tierOf(this.sus);
    // release queued lines one at a time so a kill spree can't flood the chat
    for (const p of this.pending) p.t -= dt;
    if (this.pending.length > 10) this.pending.splice(0, this.pending.length - 10);
    this.gap -= dt;
    if (this.gap <= 0) {
      const i = this.pending.findIndex(p => p.t <= 0);
      if (i >= 0) {
        const p = this.pending.splice(i, 1)[0];
        this.gap = 0.3;
        if (p.server) this.server(p.text);
        else if (p.bot && !p.bot.gone) this.say(p.bot, p.text, p.saltTier);
      }
    }
    if (M.phase !== 'play') return;
    const bots = M.bots.filter(b => !b.gone);
    if (!bots.length) return;
    this.idleT -= dt;
    if (this.idleT <= 0) {
      this.idleT = U.rand(7, 13) / Math.sqrt(Math.max(1, bots.length / 3));
      const b = U.pick(bots);
      if (b.pers !== 'quiet' || U.chance(0.25)) {
        const t = this.persTier(b);
        if (b.team === 'blue') this.say(b, U.pick(t >= 2 ? CHAT.allySus : CHAT.allyNice), 0);
        else if (Match.mode.id === 'tdm' && t >= 2 && U.chance(0.4)) this.say(b, U.pick(CHAT.foeTeam), t);
        else this.say(b, U.pick(this.linesFor(t)), t);
      }
    }
    if (this.tier >= 3) {
      this.serverT -= dt;
      if (this.serverT <= 0) {
        this.serverT = U.rand(12, 20);
        const line = U.pick(SERVER_LINES).replace('{n}', U.fmt(U.randi(1200, 99000))).replace('{d}', U.fmt(U.randi(900, 3400)));
        this.server(line);
      }
    }
    if (this.tier >= 4 && bots.length > 1) {
      this.rageT += dt;
      if (this.rageT > 11) {
        this.rageT = U.rand(0, 4);
        const alive = bots.filter(b => b.alive);
        if (U.chance(0.55)) M.rageQuit(U.pick(alive.length ? alive : bots));
      }
    }
  },

  push(entry) {
    entry.t = Match.clock;
    this.log.push(entry);
    if (this.log.length > 80) this.log.shift();
    HUD.chatLine(entry);
  },
  say(bot, text, saltTier) {
    const S = Shop.S;
    const salt = SALT_PER_TIER[U.clamp(saltTier || 0, 0, 4)] * S.salt;
    this.push({ name: bot.cheater ? bot.name + ' [CHEATER]' : bot.name, color: bot.colHex, text, kind: 'bot', salt });
    bot.bubble = text; bot.bubbleT = 3.2;
    this.msgs++;
    if (salt > 0) {
      this.salt += salt;
      Match.earn.salt += salt;
      Save.data.salt += salt;
      Extras.track('salt', salt);
      HUD.saltPop(salt);
      SFX.salt();
    } else SFX.chat();
  },
  server(text) { this.push({ name: 'SERVER', text, kind: 'server' }); SFX.chat(); },
  sys(text) { this.push({ name: '', text, kind: 'sys' }); },
  queue(bot, text, delay, saltTier) { this.pending.push({ bot, text, t: delay, saltTier }); },
  queueServer(text, delay) { this.pending.push({ server: true, text, t: delay }); },

  others(except) { return Match.bots.filter(b => b !== except && !b.gone); },

  onMatchStart() {
    const M = Match, mid = M.mode.id;
    this.server(`Welcome to BOTCAMP // ${M.def.name} // ${M.mode.name}. BotGuard anticheat: active.`);
    const foes = U.shuffle(M.bots.filter(b => b.team !== 'blue')), allies = U.shuffle(M.bots.filter(b => b.team === 'blue'));
    if (mid === 'squad' || mid === 'clutch') {
      const n = String(foes.length);
      foes.slice(0, 3).forEach((b, i) => this.queue(b, U.pick(CHAT.squadGreet).replace('{n}', n), 1.2 + i * 1.1 + Math.random(), 0));
    } else if (mid === 'tdm') {
      allies.slice(0, 2).forEach((b, i) => this.queue(b, U.pick(CHAT.teamGreet), 1.0 + i * 1.3 + Math.random(), 0));
      foes.slice(0, 2).forEach((b, i) => this.queue(b, U.pick(CHAT.greet), 1.6 + i * 1.3 + Math.random(), 0));
    } else {
      foes.slice(0, 3).forEach((b, i) => this.queue(b, U.pick(CHAT.greet), 1.2 + i * 1.1 + Math.random(), 0));
    }
  },

  onPlayerKill(victim, ctx) {
    const st = Match.p.streak;
    if (st === 10 || st === 25 || st === 50 || st === 100) this.server(`${Save.data.settings.name} is on a ${st}-kill streak.`);
    let add = 1.2;
    if (ctx.head) add += 1.4;
    if (ctx.wall) add += 7;
    if (ctx.snap) add += 4;
    if (ctx.spin) add += 6;
    if (ctx.speed) add += 1.5;
    if (ctx.multi >= 2) add += 2.5 * (ctx.multi - 1);
    if (ctx.frozen) add += 3;
    if (ctx.blink) add += 4;
    if (ctx.popper) add += 2;
    if (ctx.reflect) add += 3;
    if (ctx.silent || ctx.magic) add += 3;
    if (ctx.long) add += 2;
    add += Math.min(4, Match.p.streak * 0.25);
    if (ctx.quiet) add *= 0.5;
    this.addSus(add);
    this.tier = this.tierOf(this.sus);
    const t = this.tier;
    const talk = [0.4, 0.55, 0.65, 0.75, 0.85][t] * (victim.pers === 'quiet' ? 0.35 : 1);
    if (U.chance(talk)) {
      const pt = this.persTier(victim);
      let pool = null;
      if (t >= 1) {
        if (ctx.wall && U.chance(0.6)) pool = CHAT.wall;
        else if (ctx.spin && U.chance(0.7)) pool = CHAT.spin;
        else if (ctx.blink && U.chance(0.7)) pool = CHAT.blink;
        else if (ctx.popper && U.chance(0.6)) pool = CHAT.popper;
        else if (ctx.reflect && U.chance(0.7)) pool = CHAT.reflect;
        else if (ctx.frozen && U.chance(0.6)) pool = CHAT.freeze;
        else if (ctx.snap && U.chance(0.5)) pool = CHAT.snap;
        else if (ctx.speed && U.chance(0.4)) pool = CHAT.speed;
        else if (ctx.multi >= 3 && U.chance(0.5)) pool = CHAT.multi;
      }
      const special = !!pool;
      if (!pool) pool = pt === 0 ? (victim.pers === 'troll' ? CHAT.taunt : CHAT.victim0) : CHAT['tier' + pt];
      this.queue(victim, U.pick(pool), U.rand(0.4, 1.4), special ? Math.max(pt, 1) : pt);
    }
    const M = Match;
    if (t >= 2 && U.chance(0.2 + 0.1 * t)) {
      const o = this.others(victim);
      if (o.length) {
        const b = U.pick(o), pt = this.persTier(b);
        if (b.team === 'blue') this.queue(b, U.pick(CHAT.allySus), U.rand(1.2, 2.6), 0);
        else if (M.mode.id === 'tdm' && U.chance(0.5)) this.queue(b, U.pick(CHAT.foeTeam), U.rand(1.2, 2.6), pt);
        else this.queue(b, U.pick(this.linesFor(pt)), U.rand(1.2, 2.6), pt);
      }
    }
    // teammates hype you up (they get paid too, probably)
    if (M.mode.id === 'tdm' && (ctx.multi >= 2 || M.p.streak % 5 === 0) && U.chance(0.6)) {
      const al = M.bots.filter(b => b.team === 'blue' && !b.gone);
      if (al.length) this.queue(U.pick(al), U.pick(t >= 2 ? CHAT.allySus : CHAT.allyNice), U.rand(0.8, 2), 0);
    }
    // the squad melts down when one player is beating all of them
    if (M.mode.id === 'squad' && M.p.kills >= M.p.deaths + 6 && M.p.kills % 4 === 0) {
      const fo = this.others(null).filter(b => b.team !== 'blue');
      if (fo.length) this.queue(U.pick(fo), U.pick(CHAT.squadLosing).replace('{n}', String(fo.length)), U.rand(0.6, 1.6), Math.max(1, t));
    }
    if (t >= 3) this.reports += U.randi(1, 1 + t);
    if (Match.mode.id === 'heads' && t >= 1 && U.chance(0.12)) this.react(CHAT.headsOnly);
  },
  react(pool) {
    const foes = Match.bots.filter(b => b.team !== 'blue' && !b.gone);
    if (foes.length) this.queue(U.pick(foes), U.pick(pool), U.rand(0.8, 2), Math.max(1, this.tier));
  },
  onPlayerDeath(killer) {
    if (!killer) return;
    const t = this.tier;
    if (U.chance(t >= 2 ? 0.8 : 0.45)) this.queue(killer, U.pick(t >= 2 ? CHAT.deathCheat : CHAT.taunt), U.rand(0.3, 1.0), t >= 2 ? 2 : 0);
    this.addSus(-6);
  },
  onBotKill(killer, victim) {
    if (U.chance(0.12)) this.queue(killer, U.pick(CHAT.botKill), U.rand(0.5, 1.5), 0);
  },
  onAbility(kind) {
    this.addSus(kind === 'freeze' ? 6 : 4);
    const pool = kind === 'freeze' ? CHAT.freeze : CHAT.blink;
    const o = this.others(null);
    const n = Math.min(o.length, kind === 'freeze' ? 2 : 1);
    U.shuffle(o).slice(0, n).forEach((b, i) => this.queue(b, U.pick(pool), U.rand(0.5, 1.6) + i * 0.6, Math.max(1, this.tier)));
  },
  onRageQuit(bot) {
    this.server(`${bot.name} left the game (rage quit)`);
    Save.data.stats.ragequits++;
  },
  onJoin(bot) {
    this.server(`${bot.name} joined the game`);
    if (U.chance(0.7)) this.queue(bot, U.pick(CHAT.join), U.rand(1, 2.5), 0);
  },
  onRound(won) {
    const foes = Match.bots.filter(b => b.team !== 'blue' && !b.gone);
    if (foes.length) this.queue(U.pick(foes), U.pick(won ? CHAT.clutchLost : CHAT.clutchWon), U.rand(0.4, 1.2), won ? Math.max(1, this.tier) : 0);
  },
  onLastBot(bot) {
    if (bot && U.chance(0.6)) this.queue(bot, U.pick(CHAT.lastBot), U.rand(0.3, 0.9), 0);
  },

  playerSay(text) {
    text = text.trim().slice(0, 90);
    if (!text) return;
    this.push({ name: Save.data.settings.name || 'you', text, kind: 'player' });
    const low = text.toLowerCase();
    let pool, salty = this.tier;
    if (/\bez+\b/.test(low)) Extras.track('ez', 1);
    if (/\b(ez+|easy|ezpz)\b/.test(low)) { pool = CHAT.respEZ; this.addSus(10); salty = Math.max(2, this.tier); }
    else if (/(not|no|never|dont|don't).{0,14}(cheat|hack)|\blegit\b|\bclean\b/.test(low)) { pool = CHAT.respLegit; salty = Math.max(1, this.tier); }
    else if (/cheat|hack|aimbot|wall|esp|bought|paid|bandit/.test(low)) { pool = CHAT.respAdmit; this.addSus(15); salty = Math.max(2, this.tier); }
    else if (/\bgg\b|good game/.test(low)) pool = CHAT.respGG;
    else if (/sorry|\bsry\b|my bad/.test(low)) pool = CHAT.respSorry;
    else if (/\b(hi|hello|hey|yo|sup)\b/.test(low)) pool = this.tier >= 2 ? CHAT.respHiSus : CHAT.respHi;
    else pool = CHAT.respOther;
    const bots = U.shuffle(this.others(null));
    const n = Math.min(bots.length, 1 + (this.tier >= 2 ? U.randi(0, 2) : 0));
    for (let i = 0; i < n; i++) {
      if (bots[i].team === 'blue') this.queue(bots[i], U.pick(pool === CHAT.respAdmit ? CHAT.allySus : CHAT.allyNice), U.rand(0.8, 1.8) + i * 0.7, 0);
      else this.queue(bots[i], U.pick(pool), U.rand(0.8, 1.8) + i * 0.7, salty);
    }
  },
};
