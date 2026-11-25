'use strict';
/* =========================================================================
   BotGuard: the anticheat that finally showed up.
   - Detection (0-100%) lives on the account and carries between matches.
   - Every injected cheat has a risk value; BotGuard scans add risk × 0.3.
   - Obvious plays (wall kills, snaps, spins, abilities) add more.
   - Chat reports summon an admin who spectates; look dirty and you're kicked.
   - 100% means a ban: the match's credits are confiscated, plus a fine.
   ========================================================================= */
const AC = {
  admin: null, scanT: 20, reportsAt: 20, banned: false, kicked: false, appealed: false,
  detStart: 0, detEnd: 0, maxRisk: 0, lastScan: 0, flashT: 0, cooled: 0,

  get det() { return Save.data.det || 0; },
  set det(v) { Save.data.det = U.clamp(v, 0, 100); },
  tierOf(d) { let t = 0; for (let i = 0; i < DET_TIERS.length; i++) if (d >= DET_TIERS[i].at) t = i; return t; },
  tier() { return Shop.S && Shop.S.owner ? { name: 'SERVER OWNER', color: '#c084fc' } : DET_TIERS[this.tierOf(this.det)]; },
  interval() { return Shop.S.kernel ? 40 : 20; },
  scanGain() { return Shop.S.risk * 0.15 * Shop.S.scanMul; },
  threshold() {
    const tier = Math.max(0, MAPS.indexOf(Match.def));
    return Math.round((18 + tier * 6) * (Shop.S.shredder ? 2 : 1) * Shop.S.reportMul);
  },

  /* ---------------- match hooks ---------------- */
  onMatchStart() {
    this.admin = null; this.banned = false; this.kicked = false; this.appealed = false;
    this.visits = 0;
    if (this.det >= 100) this.det = 99;
    this.detStart = this.det; this.maxRisk = Shop.S.risk; this.lastScan = 0; this.flashT = 0; this.cooled = 0;
    this.scanT = this.interval() * U.rand(0.5, 1);
    this.reportsAt = this.threshold();
  },
  update(dt) {
    const M = Match, S = Shop.S;
    if (M.phase !== 'play' || this.banned || this.kicked) return;
    this.flashT = Math.max(0, this.flashT - dt);
    this.maxRisk = Math.max(this.maxRisk, S.risk);
    if (Input.pressed.KeyP && !Chat.typing) this.togglePanic();
    // periodic scan of everything injected
    this.scanT -= dt;
    if (this.scanT <= 0) {
      this.scanT = this.interval();
      const gain = this.scanGain();
      this.lastScan = gain;
      if (gain > 0.05) { this.add(gain); this.flashT = 1.6; HUD.callout(`BOTGUARD SCAN +${gain.toFixed(1)}%`, 'small'); SFX.deny(); }
      else { this.flashT = 1.2; HUD.callout('BOTGUARD SCAN: CLEAN', 'small'); }
      if (this.banned) return;
    }
    // reports pile up until an admin logs in
    if (!this.admin && Chat.reports >= this.reportsAt) this.summonAdmin();
    if (this.admin) {
      const a = this.admin;
      a.t -= dt; a.talkT -= dt;
      if (a.talkT <= 0) { a.talkT = U.rand(6, 10); this.adminSay(U.pick(ADMIN_LINES.watching)); }
      // AFK farm knows to hide when someone is watching
      if (M.afk && S.panicKey && !Shop.panic) this.togglePanic();
      if (a.t <= 0) this.verdict();
    } else if (M.afk && Shop.panic) this.togglePanic();
  },
  add(n) {
    if (n <= 0 || this.banned) return;
    const watched = this.admin && !Shop.S.streamProof ? 2 : 1;
    n *= watched;
    if (this.admin) this.admin.gain += n;
    // Server Owner: detection still shows, but it can't reach a ban
    if (Shop.S.owner) { this.det = Math.min(99, this.det + n); return; }
    this.det = this.det + n;
    if (this.det >= 100) this.ban();
  },
  // obvious plays: Humanizer softens them
  addActive(n) { this.add(n * (Shop.S.humanizer ? 0.5 : 1) * (Shop.S.ring ? 0.5 : 1) * Shop.S.activeMul); },
  onKill(ctx) {
    const S = Shop.S;
    const w = (ctx.wall ? 3 * S.wallDet : 0) + (ctx.snap ? 2 * S.snapDet : 0) + (ctx.spin ? 4 : 0) + (ctx.silent ? 2 : 0) + (ctx.magic ? 2 : 0)
      + (ctx.blink ? 2 : 0) + (ctx.speed ? 1 : 0) + (ctx.frozen ? 1 : 0) + (ctx.multi >= 3 ? 1 : 0);
    if (w) this.addActive(w * 0.03 * (ctx.suppressed ? 0.7 : 1));
  },
  onAbility(kind) {
    const amt = { freeze: 4, blink: 1.5, orbital: 5, kick: 3, airstrike: 3, nuke: 15, slowmo: 3, nade: 1.5 }[kind] || 1;
    this.addActive(amt);
  },

  /* ---------------- panic key ---------------- */
  togglePanic() {
    if (!Shop.S.panicKey && !Shop.panic) return;
    Shop.panic = !Shop.panic;
    Shop.compute();
    HUD.callout(Shop.panic ? 'CHEATS UNLOADED' : 'CHEATS RELOADED', 'small');
    SFX.ui();
    if (Shop.panic && this.admin && U.chance(0.6)) Extras.react(CHAT.panic, 1);
  },

  /* ---------------- admins ---------------- */
  adminSay(text) {
    if (!this.admin) return;
    Chat.push({ name: '[ADMIN] ' + this.admin.name, color: '#ff4f9a', text, kind: 'bot', salt: 0 });
    SFX.chat();
  },
  summonAdmin() {
    const M = Match, S = Shop.S, s = Save.data.stats;
    const name = U.pick(ADMIN_NAMES);
    this.visits++;
    if (S.payroll) {
      const pay = M.def.cr * 10 * S.cr;
      M.earn.payroll = (M.earn.payroll || 0) + pay; M.earn.total += pay; Save.data.credits += pay;
      HUD.callout(`ADMIN PAYROLL +${U.fmt(pay)} CR`, 'small');
    }
    if (S.owner) {
      this.reportsAt = Chat.reports + this.threshold() * 3;
      Chat.server(`${name} joined to review ${U.fmt(Chat.reports)} reports.`);
      this.admin = { name, t: 0, gain: 0, talkT: 99 };
      this.adminSay(U.pick(['oh. it is the owner. carry on', 'sorry boss, wrong server', 'nothing to see here everyone', 'closing all tickets. have a good one boss']));
      this.admin = null;
      Extras.react(CHAT.adminClean, 0.6);
      return;
    }
    // each visit makes the next one take more reports: admins get tired of this lobby
    this.reportsAt = Chat.reports + this.threshold() * (1 + this.visits);
    if (S.bribe && M.earn.total > 0) {
      const fee = M.earn.total * 0.1;
      M.earn.total -= fee; M.earn.bribe += fee; Save.data.credits -= fee;
      s.bribes = (s.bribes || 0) + 1;
      Chat.server(`${name} joined to review ${U.fmt(Chat.reports)} reports.`);
      this.admin = { name, t: 0, gain: 0, talkT: 99 };
      this.adminSay(U.pick(ADMIN_LINES.bribe));
      this.admin = null;
      Chat.server(`${name} is now AFK.`);
      HUD.callout(`ADMIN BRIBED -${U.fmt(fee)} CR`, 'small');
      return;
    }
    this.admin = { name, t: 22 * S.adminTime, gain: 0, talkT: U.rand(5, 8) };
    Chat.server(`${name} is now spectating ${Save.data.settings.name}.`);
    this.adminSay(U.pick(ADMIN_LINES.join));
    Extras.react(CHAT.adminCheer, 0.8);
    HUD.callout('ADMIN IS WATCHING', 'multi');
    SFX.deny();
  },
  verdict() {
    const a = this.admin, s = Save.data.stats;
    // what the admin saw while watching decides it
    if (a.gain > 6) { this.adminSay(U.pick(ADMIN_LINES.kick)); this.kick(); return; }
    this.adminSay(U.pick(ADMIN_LINES.clean));
    Chat.server(`${a.name} is now AFK.`);
    s.adminsSurvived = (s.adminsSurvived || 0) + 1;
    Extras.react(CHAT.adminClean, 0.6);
    Chat.sus = Math.max(0, Chat.sus - 30);
    this.reportsAt = Chat.reports + Math.round(this.threshold() * (1.5 + this.visits));
    this.admin = null;
    HUD.callout('ADMIN LEFT. YOU LOOK LEGIT', 'small');
  },
  kick() {
    const M = Match, s = Save.data.stats;
    this.kicked = true;
    const lost = Math.max(0, M.earn.total * Shop.S.kickPenalty);
    M.earn.forfeit += lost; M.earn.total -= lost; Save.data.credits -= lost;
    s.adminKicks = (s.adminKicks || 0) + 1;
    Chat.server(`${Save.data.settings.name} was kicked by ${this.admin ? this.admin.name : 'an admin'}.`);
    Extras.react(CHAT.adminKick, 0.2);
    HUD.callout('KICKED BY ADMIN', 'multi');
    this.admin = null;
    M.finish(false);
  },
  ban() {
    const M = Match, S = Shop.S, s = Save.data.stats;
    if (this.banned) return;
    if (!M.on || M.phase !== 'play') { this.det = Math.min(this.det, 99); return; }
    if (S.appeal && !this.appealed) {
      this.appealed = true; this.det = 60;
      Chat.server('BotGuard ban appealed automatically. Detection lowered.');
      HUD.callout('BAN APPEALED', 'multi');
      return;
    }
    this.banned = true;
    const lost = Math.max(0, M.earn.total);
    M.earn.forfeit += lost; M.earn.total = 0; Save.data.credits -= lost;
    const fine = S.hwid ? 0 : Math.max(0, Save.data.credits * 0.1 * S.fineMul);
    M.earn.fine = fine; Save.data.credits -= fine;
    this.det = S.alt ? 0 : 40;
    s.bans = (s.bans || 0) + 1;
    Chat.server(`BotGuard: ${Save.data.settings.name} has been banned for cheating.`);
    Extras.react(CHAT.banned, 0.2);
    HUD.callout('BANNED BY BOTGUARD', 'multi');
    SFX.die();
    this.admin = null;
    M.finish(false);
  },

  /* ---------------- ban waves ---------------- */
  waveChance() { return !Shop.S.owner && this.tierOf(this.det) >= 2 ? Math.min(0.5, (Save.data.wave || 0) / 400) : 0; },
  // rolled between matches: BotGuard bans in batches, sometimes long after the fact
  rollWave() {
    const S = Shop.compute(), D = Save.data, s = D.stats;
    const n = U.randi(800, 9999);
    if (S.owner) return null;
    if (!U.chance(this.waveChance())) {
      if (this.tierOf(this.det) >= 2 && U.chance(0.3)) return { near: true, n, banned: U.randi(300, 4000) };
      return null;
    }
    D.wave = 0;
    if (S.appeal) { this.det = 60; Save.save(); return { appealed: true, n }; }
    const fine = S.hwid ? 0 : Math.max(0, D.credits * 0.05 * S.fineMul);
    D.credits -= fine;
    this.det = S.alt ? 0 : 40;
    s.bans = (s.bans || 0) + 1; s.waves = (s.waves || 0) + 1;
    Save.save();
    return { hit: true, n, fine };
  },

  // a wave rolled while auto-queueing shows up in the next match's chat instead of a popup
  announceWave(w) {
    if (w.hit) { Chat.server(`BotGuard ban wave #${w.n}: you were in it. −${U.fmt(w.fine)} CR, detection reset.`); HUD.callout('BAN WAVE', 'multi'); }
    else if (w.appealed) Chat.server(`BotGuard ban wave #${w.n}: Appeal Bot got you out of it.`);
    else if (w.near) Chat.server(`BotGuard ban wave #${w.n} banned ${U.fmt(w.banned)} accounts. You were not one of them. Yet.`);
  },

  /* ---------------- after the match ---------------- */
  onMatchEnd(win) {
    const S = Shop.S, s = Save.data.stats;
    s.scans = (s.scans || 0) + 1;
    // ban waves: detection you picked up and kept builds "taint" (Save.data.wave) that can get you banned later
    if (!this.banned) {
      // laying low (a match with nothing loaded) cools detection a lot faster
      const cool = ((this.maxRisk === 0 ? 25 : 15) + S.coolAdd) * (S.coolMul || 1);
      this.cooled = Math.min(this.det, cool);
      this.det = this.det - cool;
      if (win && this.maxRisk >= 30 && this.detStart < 25 && this.det < 25) s.ghostWins = (s.ghostWins || 0) + 1;
    }
    this.detEnd = this.det;
    Save.data.wave = (Save.data.wave || 0) * 0.85 + (this.banned ? 0 : (Math.max(0, this.det - this.detStart) * (1 + 0.5 * this.tierOf(this.det)) + (this.det >= 50 ? 5 : 0)) * S.waveMul);
    Shop.panic = false; Shop.compute();
  },
};
