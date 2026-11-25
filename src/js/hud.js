'use strict';
/* =========================================================================
   In-match HUD: DOM widgets + 2D overlay canvas (crosshair, ESP, radar...)
   ========================================================================= */
function drawCrosshair(c, x, y, xh, k) {
  k = k || 1;
  const col = xh.color || '#7cffb2';
  const size = xh.size * k, gap = xh.gap * k, th = Math.max(1, xh.thick * k);
  const shape = (stroke, lw) => {
    c.strokeStyle = stroke; c.fillStyle = stroke; c.lineWidth = lw; c.lineCap = 'butt';
    c.beginPath();
    switch (xh.style) {
      case 'dot': c.arc(x, y, th + 1 + (lw - th) / 2, 0, TAU); c.fill(); return;
      case 'circle': c.arc(x, y, gap + size * 0.5, 0, TAU); c.stroke(); return;
      case 'tee':
        c.moveTo(x - gap, y); c.lineTo(x - gap - size, y); c.moveTo(x + gap, y); c.lineTo(x + gap + size, y);
        c.moveTo(x, y + gap); c.lineTo(x, y + gap + size); c.stroke(); return;
      case 'x': {
        const g = gap * 0.75, s = size * 0.75;
        c.moveTo(x - g, y - g); c.lineTo(x - g - s, y - g - s); c.moveTo(x + g, y - g); c.lineTo(x + g + s, y - g - s);
        c.moveTo(x - g, y + g); c.lineTo(x - g - s, y + g + s); c.moveTo(x + g, y + g); c.lineTo(x + g + s, y + g + s); c.stroke(); return;
      }
      case 'chevron':
        c.moveTo(x - size, y + gap + size * 0.8); c.lineTo(x, y + gap); c.lineTo(x + size, y + gap + size * 0.8); c.stroke(); return;
      case 'square': { const h = gap + size * 0.5; c.strokeRect(x - h, y - h, h * 2, h * 2); return; }
      case 'smile': {
        const r = gap + size * 0.7;
        c.arc(x, y, r, 0, TAU); c.stroke();
        c.beginPath(); c.arc(x, y + r * 0.05, r * 0.55, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke();
        c.beginPath(); c.arc(x - r * 0.35, y - r * 0.3, th * 0.9, 0, TAU); c.arc(x + r * 0.35, y - r * 0.3, th * 0.9, 0, TAU); c.fill(); return;
      }
      case 'reticle': {
        const r = gap + size * 0.6;
        c.arc(x, y, r, 0, TAU);
        c.moveTo(x - r - size * 0.6, y); c.lineTo(x - r + 2, y); c.moveTo(x + r - 2, y); c.lineTo(x + r + size * 0.6, y);
        c.moveTo(x, y - r - size * 0.6); c.lineTo(x, y - r + 2); c.moveTo(x, y + r - 2); c.lineTo(x, y + r + size * 0.6);
        c.stroke(); c.beginPath(); c.arc(x, y, th * 0.8, 0, TAU); c.fill(); return;
      }
      case 'paw': {
        const s = (gap + size) * 0.45;
        c.ellipse(x, y + s * 0.45, s * 0.75, s * 0.58, 0, 0, TAU); c.fill();
        for (const [ox, oy] of [[-1.05, -0.35], [-0.38, -0.95], [0.38, -0.95], [1.05, -0.35]]) { c.beginPath(); c.arc(x + ox * s, y + oy * s, s * 0.3, 0, TAU); c.fill(); }
        return;
      }
      case 'diamond': {
        const r = gap + size * 0.6;
        c.moveTo(x, y - r); c.lineTo(x + r, y); c.lineTo(x, y + r); c.lineTo(x - r, y); c.closePath(); c.stroke(); return;
      }
      case 'brackets': {
        const r = gap + size * 0.5, l = size * 0.6;
        c.moveTo(x - r + l, y - r); c.lineTo(x - r, y - r); c.lineTo(x - r, y + r); c.lineTo(x - r + l, y + r);
        c.moveTo(x + r - l, y - r); c.lineTo(x + r, y - r); c.lineTo(x + r, y + r); c.lineTo(x + r - l, y + r); c.stroke(); return;
      }
      case 'triangle': {
        const r = gap + size * 0.7;
        c.moveTo(x, y - r); c.lineTo(x + r * 0.87, y + r * 0.5); c.lineTo(x - r * 0.87, y + r * 0.5); c.closePath(); c.stroke(); return;
      }
      default:
        c.moveTo(x - gap, y); c.lineTo(x - gap - size, y); c.moveTo(x + gap, y); c.lineTo(x + gap + size, y);
        c.moveTo(x, y - gap); c.lineTo(x, y - gap - size); c.moveTo(x, y + gap); c.lineTo(x, y + gap + size); c.stroke();
    }
  };
  if (xh.outline) shape('rgba(0,0,0,0.75)', th + 2);
  shape(col, th);
  if (xh.dot && xh.style !== 'dot' && xh.style !== 'paw') {
    c.fillStyle = 'rgba(0,0,0,0.75)'; c.beginPath(); c.arc(x, y, th * 0.75 + 1, 0, TAU); c.fill();
    c.fillStyle = col; c.beginPath(); c.arc(x, y, th * 0.75, 0, TAU); c.fill();
  }
}

const HUD = {
  el: {}, fx: null, ctx: null, last: {}, boardT: 0, radarImg: null, radarMap: null, feedN: 0,

  init() {
    const $ = id => document.getElementById(id);
    for (const id of ['hud', 'h-timer', 'h-me', 'h-top', 'h-sus', 'h-sus-fill', 'h-sus-label', 'h-hp', 'h-hp-fill', 'h-ammo', 'h-mag', 'h-wname',
      'h-earn', 'h-salt', 'h-me-lbl', 'h-top-lbl', 'h-style', 'h-style-rank', 'h-style-name', 'h-style-mult', 'h-style-fill', 'h-streak', 'h-style-feed', 'h-det', 'h-det-val', 'h-det-tier', 'h-admin', 'h-panic', 'h-feed', 'h-chatlog', 'h-chatin', 'h-call', 'h-board', 'h-overlay', 'h-dead', 'h-abil', 'h-afk', 'h-wm',
      'summary', 'vignette', 'freeze-tint', 'h-fps', 'touch', 'h-saltpop', 'h-reload'])
      this.el[id.replace(/^h-/, '')] = $(id);
    this.fx = $('fx');
    this.ctx = this.fx.getContext('2d');
  },
  enterMatch() {
    const e = this.el;
    e.hud.hidden = false;
    e.feed.innerHTML = ''; e.chatlog.innerHTML = ''; e.board.hidden = true; e.dead.hidden = true; e.summary.hidden = true;
    this.last = {};
    this.radarMap = null;
    e.hud.classList.toggle('has-radar', !!Shop.S.radar);
    const lbls = { ffa: ['You', 'Top bot'], squad: ['Your kills', 'Squad kills'], clutch: ['Rounds', 'Squad'], tdm: ['Blue', 'Red'],
      gungame: ['Gun', 'Top bot'], heads: ['You', 'Top bot'], boss: ['Your kills', 'Boss HP'] }[Match.mode ? Match.mode.id : 'ffa'];
    e['me-lbl'].textContent = lbls[0]; e['top-lbl'].textContent = lbls[1];
    e.hud.dataset.mode = Match.mode ? Match.mode.id : 'ffa';
    const mods = Shop.activeModuleNames();
    e.wm.textContent = mods.length ? `BANDIT LOADER // ${mods.length} module${mods.length > 1 ? 's' : ''} injected // BotGuard: active` : 'no cheats loaded. good luck.';
    this.setOverlay(Match.phase === 'prompt' ? 'prompt' : null);
    e.touch.hidden = !Input.touch;
  },
  exitMatch() {
    this.el.hud.hidden = true;
    this.el.summary.hidden = true;
    this.el.touch.hidden = true;
    this.setOverlay(null);
  },
  setOverlay(kind) {
    const o = this.el.overlay;
    this.overlayKind = kind;
    if (!kind) { o.hidden = true; o.innerHTML = ''; return; }
    o.hidden = false;
    const d = Match.def;
    if (kind === 'prompt') {
      const mods = Shop.activeModuleNames();
      o.innerHTML = `
        <div class="ov-card">
          <div class="ov-eyebrow">BOTCAMP // ${U.esc(Match.mode.name)} // ${matchupLabel(d, Match.mode.id, Shop.S.extraBots)}</div>
          <h2 class="ov-title">${U.esc(d.name)}</h2>
          <p class="ov-sub">${U.esc(d.blurb)} ${U.esc(Match.mode.blurb)} ${U.fmt(d.cr * (Match.mode.pay || 1) * Shop.S.cr)} CR per kill. ${Match.mode.id === 'clutch' ? 'First to ' + Match.mode.rounds + ' rounds.' : U.fmtTime(Match.total) + ' on the clock.'}</p>
          <button class="btn primary big" id="ov-go">${Input.touch ? 'Tap to drop in' : 'Click to drop in'}</button>
          <div class="keys">
            <span><kbd>WASD</kbd> move</span><span><kbd>Mouse</kbd> aim</span><span><kbd>Click</kbd> shoot</span><span><kbd>Space</kbd> jump</span>
            <span><kbd>Right-click</kbd> aim</span><span><kbd>R</kbd> reload</span><span><kbd>1-6</kbd> weapons</span><span><kbd>Tab</kbd> scores</span><span><kbd>T</kbd> chat</span>
            ${Shop.S.slowmo ? '<span><kbd>V</kbd> bullet time</span>' : ''}${Shop.S.panicKey ? '<span><kbd>P</kbd> panic key</span>' : ''}
            ${Shop.S.orbital ? '<span><kbd>X</kbd> orbital laser</span>' : ''}${Shop.S.admin ? '<span><kbd>G</kbd> kick a bot</span>' : ''}
            ${Shop.S.freeze ? '<span><kbd>Q</kbd> freeze</span>' : ''}${Shop.S.blink ? '<span><kbd>E</kbd> blink</span>' : ''}${Shop.S.afk ? '<span><kbd>F</kbd> AFK farm</span>' : ''}
          </div>
          <div class="ov-mods">${mods.length ? 'Injected: ' + mods.map(U.esc).join(' · ') : 'Nothing injected yet. Your aim is all you have.'}</div>
          <div class="ov-det" style="--dc:${AC.tier().color}">BotGuard: <b>${Math.round(AC.det)}% ${AC.tier().name}</b> · scans add about <b>${AC.scanGain().toFixed(1)}%</b> every ${AC.interval()} s</div>
        </div>`;
      o.querySelector('#ov-go').addEventListener('click', e => { e.stopPropagation(); Game.dropIn(); });
    } else if (kind === 'pause') {
      o.innerHTML = `
        <div class="ov-card">
          <div class="ov-eyebrow">PAUSED</div>
          <h2 class="ov-title">${U.esc(d.name)}</h2>
          <p class="ov-sub">${U.fmt(Match.earn.total)} CR earned so far. Leaving keeps everything you earned.</p>
          <div class="ov-row">
            <button class="btn primary" id="ov-resume">Resume</button>
            <button class="btn" id="ov-settings">Settings</button>
            <button class="btn ghost" id="ov-leave">Leave match</button>
          </div>
        </div>`;
      o.querySelector('#ov-resume').addEventListener('click', e => { e.stopPropagation(); Game.dropIn(); });
      o.querySelector('#ov-settings').addEventListener('click', e => { e.stopPropagation(); Hub.openSettings(); });
      o.querySelector('#ov-leave').addEventListener('click', e => { e.stopPropagation(); Match.finish(true); });
    }
  },
  setDead(killer, t) {
    const el = this.el.dead;
    if (!killer && t == null) { el.hidden = true; return; }
    el.hidden = false;
    const txt = `${killer ? 'Eliminated by ' + killer.name : 'Eliminated'} · back in ${Math.max(0, t).toFixed(1)}s`;
    if (el.textContent !== txt) el.textContent = txt;
  },
  callout(text, kind) {
    const now = performance.now();
    if (kind === 'small' && this.callKind && this.callKind !== 'small' && now - (this.callAt || 0) < 500) return;
    this.callAt = now; this.callKind = kind;
    const c = this.el.call;
    c.textContent = text;
    c.className = 'call ' + (kind || '');
    if (this.callAnim) this.callAnim.cancel();
    const still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.callAnim = c.animate(still
      ? [{ opacity: 1 }, { opacity: 1, offset: 0.7 }, { opacity: 0 }]
      : [{ opacity: 0, transform: 'translate(-50%, 8px) scale(.9)' }, { opacity: 1, transform: 'translate(-50%, 0) scale(1.06)', offset: 0.15 },
        { opacity: 1, transform: 'translate(-50%, 0) scale(1)', offset: 0.7 }, { opacity: 0, transform: 'translate(-50%, -10px)' }],
      { duration: 1100, easing: 'ease-out', fill: 'forwards' });
  },
  killfeed(killer, victim, weapon, f) {
    const now = performance.now();
    if (f.mine && this.kfLast && this.kfLast.isConnected && now - this.kfAt < 260) {
      this.kfN++; this.kfAt = now;
      this.kfLast.querySelector('.v').textContent = victim;
      let x = this.kfLast.querySelector('.x');
      if (!x) { x = document.createElement('b'); x.className = 'x'; this.kfLast.appendChild(x); }
      x.textContent = '×' + this.kfN;
      return;
    }
    const d = document.createElement('div');
    d.className = 'kf' + (f.mine ? ' mine' : '') + (f.victimMe ? ' dead' : '');
    const tc = t => (t === 'blue' || t === 'red') && Match.mode && !Match.mode.ffa ? ' t-' + t : '';
    d.innerHTML = `<span class="k${tc(f.kTeam)}">${U.esc(killer)}</span><span class="w">${U.esc(weapon)}${f.head ? ' <b>HS</b>' : ''}${f.wall ? ' <b class="wb">WALL</b>' : ''}</span><span class="v${tc(f.vTeam)}">${U.esc(victim)}</span>`;
    const feed = this.el.feed;
    if (f.mine) { this.kfLast = d; this.kfAt = now; this.kfN = 1; }
    feed.appendChild(d);
    while (feed.children.length > 6) feed.removeChild(feed.firstChild);
    setTimeout(() => { d.classList.add('out'); setTimeout(() => d.remove(), 400); }, 4800);
  },
  chatLine(e) {
    const log = this.el.chatlog;
    const d = document.createElement('div');
    d.className = 'cl ' + e.kind;
    if (e.kind === 'server') d.innerHTML = `<b>[SERVER]</b> ${U.esc(e.text)}`;
    else if (e.kind === 'sys') d.textContent = e.text;
    else d.innerHTML = `<b style="color:${e.kind === 'player' ? '#ffd23f' : e.color}">${U.esc(e.name)}</b> ${U.esc(e.text)}${e.salt ? ` <i class="salt-tag">+${e.salt}</i>` : ''}`;
    log.appendChild(d);
    while (log.children.length > 9) log.removeChild(log.firstChild);
  },
  saltPop(n) {
    const now = performance.now();
    this.saltAcc = now - (this.saltAt || 0) < 1100 ? (this.saltAcc || 0) + n : n;
    this.saltAt = now;
    const s = this.el.saltpop;
    s.textContent = '+' + U.fmt(this.saltAcc) + ' SALT';
    if (this.saltAnim) this.saltAnim.cancel();
    this.saltAnim = s.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none', offset: 0.2 }, { opacity: 0, transform: 'translateY(-8px)' }],
      { duration: 1200, easing: 'ease-out', fill: 'forwards' });
  },
  autoQueue(t) {
    const el = document.getElementById('sum-auto');
    if (el) el.textContent = `Next match in ${Math.max(0, Math.ceil(t))}s`;
  },
  showSummary(r) {
    const M = Match, e = M.earn, st = M.st, S = Shop.S;
    const acc = st.shots ? Math.min(100, Math.round(st.hits / st.shots * 100)) : 0;
    const hsr = st.kills ? Math.round(st.hs / st.kills * 100) : 0;
    const mid = M.mode.id, ffa = !!M.mode.ffa;
    const title = r.banned ? 'Banned' : r.kicked ? 'Kicked by admin' : r.early ? 'Left the match' : r.win ? 'Victory' : ffa ? `${ordinal(r.rank)} of ${r.of}` : 'Defeat';
    const score = mid === 'clutch' ? `Rounds <b>${M.roundsWon}</b> – <b>${M.roundsLost}</b> against ${M.bots.filter(b => b.team !== 'blue').length} bots`
      : mid === 'tdm' ? `<span class="t-blue">Blue <b>${M.score.blue}</b></span> – <span class="t-red"><b>${M.score.red}</b> Red</span> · you got ${st.kills} of your team's kills`
      : mid === 'squad' ? `<b>${st.kills}</b> kills, <b>${st.deaths}</b> deaths against a ${M.bots.length}-bot squad. More kills than deaths wins.`
      : mid === 'gungame' ? `Reached gun <b>${Math.min(M.ggIdx + 1, GUNGAME_ORDER.length)}</b> of ${GUNGAME_ORDER.length}${M.ggIdx >= GUNGAME_ORDER.length ? ', and finished it' : ''}`
      : mid === 'boss' ? (M.bossDown ? 'The raid boss is scrap metal.' : `The boss survived with <b>${Extras.boss ? Math.max(0, Math.round(Extras.boss.hp / Extras.boss.maxHp * 100)) : 0}%</b> health.`)
      : `${ordinal(r.rank)} of ${r.of} on the scoreboard`;
    const winWhy = { ffa: '1st place', squad: 'beat the squad', clutch: 'won the series', tdm: 'team won', gungame: 'finished every gun', heads: '1st place', boss: 'boss defeated' }[mid];
    const quip = r.early ? 'Leaving early? Credits are credits.' : Chat.peak > 85 ? 'The lobby is in shambles. Beautiful work.' : Chat.peak > 35 ? 'They are starting to notice. Keep going.' : st.kills ? 'Nobody suspects a thing. Yet.' : 'Rough one. You know where to find me.';
    const rows = [
      ['Kills', `${st.kills} × ${U.fmt(M.def.cr * (M.mode.pay || 1))} CR${M.mode.pay > 1 ? ' (×' + M.mode.pay + ' ' + M.mode.tag + ' pay)' : ''}`, e.base],
      e.rounds > 0 ? ['Rounds won', `${M.roundsWon} × round bonus`, e.rounds] : null,
      e.team > 0 ? ['Teammate cut', `${st.allyKills || 0} teammate kills × ${Math.round(M.mode.assist * 100)}%`, e.team] : null,
      e.bonus > 0 ? ['Bonuses', 'headshots, streaks, ambushes', e.bonus] : null,
      e.mult > 0 ? ['Money Glitch', `×${S.cr.toFixed(2).replace(/\.?0+$/, '')} multiplier`, e.mult] : null,
      e.gun > 0 ? ['Gun bonus', 'each gun has its own credit multiplier', e.gun] : null,
      e.streakx > 0 ? ['Streak & style', 'kill-streak and style-rank multipliers', e.streakx] : null,
      e.style > 0 ? ['Style points', `${U.fmt(Style.points)} pts · best rank ${STYLE_RANKS[Style.bestRank].name}${Style.best ? ' · top trick ' + Style.best.label : ''}`, e.style] : null,
      e.special > 0 ? ['Big targets', 'bounties, bosses, deletions', e.special] : null,
      e.streak > 0 ? ['Care packages', 'killstreak crates', e.streak] : null,
      e.kick > 0 ? ['Admin kicks', 'Fake Admin', e.kick] : null,
      e.clip > 0 ? ['Clip farming', `${U.fmt(e.salt)} salt × 1 kill`, e.clip] : null,
      e.chips > 0 ? ['Credit chips', 'Loot Drops', e.chips] : null,
      e.interest > 0 ? ['Interest', '2% of your wallet', e.interest] : null,
      e.win > 0 ? ['Win bonus', winWhy, e.win] : null,
    ].filter(Boolean);
    const neg = [
      e.bribe > 0 ? ['Admin bribe', 'Admin Bribe', e.bribe] : null,
      e.forfeit > 0 ? [r.banned ? 'Confiscated' : 'Kick penalty', r.banned ? 'BotGuard took this match\'s credits' : 'half the match\'s credits', e.forfeit] : null,
      e.fine > 0 ? ['Ban fine', '10% of your wallet', e.fine] : null,
    ].filter(Boolean);
    const el = this.el.summary;
    el.hidden = false;
    el.innerHTML = `
      <div class="sum-card">
        <div class="sum-head">
          <div>
            <div class="ov-eyebrow">${U.esc(M.def.name)} // ${U.esc(M.mode.name)} // match over</div>
            <h2 class="sum-title ${r.win ? 'win' : ''} ${r.banned || r.kicked ? 'bad' : ''}">${title}</h2>
            <div class="sum-score">${score}</div>
          </div>
          <div class="sum-total"><span>+${U.fmt(e.total)}</span><small>CR</small></div>
        </div>
        <div class="sum-stats">
          <div><b>${st.kills}</b><span>kills</span></div><div><b>${st.deaths}</b><span>deaths</span></div>
          <div><b>${hsr}%</b><span>headshots</span></div><div><b>${acc}%</b><span>accuracy</span></div>
          <div><b>${st.best}</b><span>best streak</span></div>
        </div>
        <div class="sum-rows">${rows.map(x => `<div class="sum-row"><span>${x[0]}</span><em>${U.esc(x[1])}</em><b>+${U.fmt(x[2])}</b></div>`).join('')}${neg.map(x => `<div class="sum-row neg"><span>${x[0]}</span><em>${U.esc(x[1])}</em><b>−${U.fmt(x[2])}</b></div>`).join('')}</div>
        ${this.detHtml(r)}
        <div class="sum-salt">
          <div><b>+${U.fmt(e.salt)}</b> salt from chat</div>
          <div>${U.fmt(Chat.reports)} reports filed against you · ${AC.visits ? AC.visits + ' admin visit' + (AC.visits > 1 ? 's' : '') : 'no admin showed up'}</div>
          <div>Peak lobby mood: <b style="color:${SUS_TIERS[Chat.tierOf(Chat.peak)].color}">${SUS_TIERS[Chat.tierOf(Chat.peak)].name}</b></div>
        </div>
        ${this.progressHtml()}
        <p class="sum-quip">“${U.esc(quip)}” <span>— Bandit</span></p>
        <div class="ov-row">
          <button class="btn primary" id="sum-again">Play again</button>
          <button class="btn" id="sum-shop">Spend it at Bandit's</button>
          <button class="btn ghost" id="sum-hub">Back to hub</button>
        </div>
        <div class="sum-auto" id="sum-auto"></div>
      </div>`;
    el.querySelector('#sum-again').addEventListener('click', () => { SFX.ui(); M.playAgain(false); });
    el.querySelector('#sum-shop').addEventListener('click', () => { SFX.ui(); M.autoT = 0; M.leave(); Hub.setTab('bandit'); });
    el.querySelector('#sum-hub').addEventListener('click', () => { SFX.ui(); M.autoT = 0; M.leave(); });
    if (M.autoT > 0) this.autoQueue(M.autoT);
  },
  detHtml(r) {
    const t0 = DET_TIERS[AC.tierOf(AC.detStart)], t1 = AC.tier();
    const why = r.banned ? (Shop.S.alt ? 'Alt Account: detection reset to 0%.' : 'Detection resets to 40% after a ban.')
      : AC.maxRisk === 0 ? `You laid low with nothing loaded: −${Math.round(AC.cooled)}% cooldown.` : `Cooled off ${Math.round(AC.cooled)}% after the match. Run nothing for a match to cool faster.`;
    return `<div class="sum-det" style="--d0:${t0.color};--d1:${t1.color}"><span>BotGuard</span><b class="d0">${Math.round(AC.detStart)}%</b><i>→</i><b class="d1">${Math.round(AC.det)}% ${t1.name}</b><em>${U.esc(why)}</em></div>`;
  },
  progressHtml() {
    const X = Extras, ri = X.rankInfo(), e = Match.earn;
    const items = [];
    for (const c of X.doneContracts) items.push(`<li class="ok">Contract done: ${U.esc(c)}</li>`);
    for (const a of X.newAch) items.push(`<li class="achv">Achievement: <b>${U.esc(a.name)}</b> · +${a.salt} salt</li>`);
    for (const n of X.takeNotes()) items.push(`<li class="rk">${U.esc(n)}</li>`);
    return `<div class="sum-prog">
      <div class="sum-rank"><span>+${e.xp} XP</span><b>${U.esc(ri.name)}</b><div class="track"><i style="width:${Math.round(ri.frac * 100)}%"></i></div><em>${ri.next ? U.fmt(ri.xp - ri.cur) + ' / ' + U.fmt(ri.next - ri.cur) : 'max rank'}</em></div>
      ${items.length ? `<ul>${items.join('')}</ul>` : ''}
    </div>`;
  },
  hideSummary() { this.el.summary.hidden = true; },

  /* ---------------- per-frame ---------------- */
  draw(dt) {
    const cv = this.fx, c = this.ctx;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = cv.clientWidth || window.innerWidth, h = cv.clientHeight || window.innerHeight;
    const pw = Math.round(w * dpr), ph = Math.round(h * dpr);
    if (cv.width !== pw || cv.height !== ph) { cv.width = pw; cv.height = ph; }
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, w, h);
    if (Game.mode !== 'match' || !Match.on) return;
    const M = Match, p = M.p, S = Shop.S;
    this.updateDom(dt);
    if (M.phase === 'over') return;
    this.drawESP(c, w, h);
    this.drawAllies(c, w, h);
    if (S.radar || Extras.uavT > 0) this.drawRadar(c);
    if (p.scoped) this.drawScope(c, w, h);
    // floaters
    c.textAlign = 'center'; c.textBaseline = 'middle';
    const tmp = [0, 0, 0];
    for (const f of M.floaters) {
      const s = GFX.project(f.p, tmp);
      if (!s) continue;
      const a = U.clamp(f.life / f.max * 1.6, 0, 1);
      c.globalAlpha = a;
      c.font = `700 ${Math.round(15 * f.size)}px Oxanium, "Segoe UI", sans-serif`;
      c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,0.7)'; c.strokeText(f.text, s[0], s[1]);
      c.fillStyle = f.col; c.fillText(f.text, s[0], s[1]);
    }
    c.globalAlpha = 1;
    if (!p.alive) return;
    // crosshair at the true aim point (it wobbles until you buy STEADY)
    const aim = GFX.project([p.eye[0] + p.aimDir[0] * 60, p.eye[1] + p.aimDir[1] * 60, p.eye[2] + p.aimDir[2] * 60], tmp);
    const cx = aim ? aim[0] : w / 2, cy = aim ? aim[1] : h / 2;
    if (S.aim && !p.scoped) {
      const r = Math.tan(Math.min(S.aimFov, 80 * DEG)) / Math.tan(GFX.fovy / 2) * h / 2;
      if (r < Math.max(w, h)) {
        c.strokeStyle = M.aimTarget ? 'rgba(255,107,107,0.55)' : 'rgba(255,255,255,0.16)'; c.lineWidth = 1;
        c.beginPath(); c.arc(w / 2, h / 2, r, 0, TAU); c.stroke();
      }
    }
    // the crosshair opens up with movement and air spread so you can see when shots will stray
    const sprPx = (1 - 0.5 * (p.adsT || 0)) * Math.min(36, Math.tan(p.moveSpread + p.bloom * (S.spread > 0 ? 1 : 0)) / Math.tan(GFX.fovy / 2) * h / 2);
    if (!p.scoped) drawCrosshair(c, cx, cy, sprPx > 1 ? Object.assign({}, Save.data.xhair, { gap: Save.data.xhair.gap + sprPx }) : Save.data.xhair, 1);
    if (M.fx.hitmark > 0) {
      const a = M.fx.hitmark / 0.3, s1 = 7, s2 = 14;
      c.strokeStyle = M.fx.hitKill ? `rgba(255,70,70,${a})` : M.fx.hitHead ? `rgba(255,210,63,${a})` : `rgba(255,255,255,${a})`;
      c.lineWidth = M.fx.hitKill ? 3 : 2;
      c.beginPath();
      for (const [sx, sy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { c.moveTo(cx + sx * s1, cy + sy * s1); c.lineTo(cx + sx * s2, cy + sy * s2); }
      c.stroke();
    }
    for (const hu of M.fx.hurt) {
      const rel = U.angDiff(p.yaw, hu.ang);
      const th = -rel - Math.PI / 2;
      c.strokeStyle = `rgba(255,60,60,${Math.min(1, hu.t) * 0.85})`; c.lineWidth = 6;
      c.beginPath(); c.arc(w / 2, h / 2, 90, th - 0.28, th + 0.28); c.stroke();
    }
  },
  drawESP(c, w, h) {
    const S = Shop.S, M = Match;
    if (!(S.boxes || S.names || S.hpbars || S.lines)) return;
    const tmp = [0, 0, 0], pt = [0, 0, 0];
    c.font = '600 12px "Barlow Semi Condensed", "Segoe UI", sans-serif';
    c.textBaseline = 'alphabetic';
    for (const b of M.bots) {
      if (!b.alive || b.gone || b.team === 'blue') continue;
      const k = b.scale || 1, rx = 0.42 * k * Math.max(1, Math.min(S.hbBody, 2.4) * 0.75), top = (1.95 + 0.33 * (S.headVisual - 1)) * k;
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, ok = true;
      for (let i = 0; i < 8; i++) {
        pt[0] = b.pos[0] + (i & 1 ? rx : -rx); pt[1] = b.pos[1] + (i & 2 ? top : 0); pt[2] = b.pos[2] + (i & 4 ? rx : -rx);
        const s = GFX.project(pt, tmp);
        if (!s) { ok = false; break; }
        if (s[0] < x0) x0 = s[0]; if (s[0] > x1) x1 = s[0]; if (s[1] < y0) y0 = s[1]; if (s[1] > y1) y1 = s[1];
      }
      if (S.lines) {
        const f = GFX.project(b.pos, tmp);
        if (f) { c.strokeStyle = 'rgba(67,217,255,0.45)'; c.lineWidth = 1; c.beginPath(); c.moveTo(w / 2, h); c.lineTo(f[0], f[1]); c.stroke(); }
      }
      if (!ok || x1 < 0 || x0 > w || y1 < 0 || y0 > h) continue;
      const bw = x1 - x0, bh = y1 - y0;
      if (S.boxes) {
        const l = Math.min(bw, bh) * 0.28;
        c.strokeStyle = 'rgba(0,0,0,0.6)'; c.lineWidth = 3; this.corners(c, x0, y0, x1, y1, l);
        c.strokeStyle = b.colHex; c.lineWidth = 1.5; this.corners(c, x0, y0, x1, y1, l);
      }
      if (S.hpbars) {
        const fr = U.clamp(b.hp / 100, 0, 1);
        c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillRect(x0 - 7, y0 - 1, 4, bh + 2);
        c.fillStyle = fr > 0.5 ? '#7cff9a' : fr > 0.25 ? '#ffd23f' : '#ff5470';
        c.fillRect(x0 - 6, y0 + bh * (1 - fr), 2, bh * fr);
      }
      if (S.names) {
        const dist = Math.round(V.dist(M.p.pos, b.pos));
        const label = `${b.name}  ${dist}m`;
        c.textAlign = 'center';
        c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,0.75)'; c.strokeText(label, (x0 + x1) / 2, y0 - 6);
        c.fillStyle = '#e9f6ff'; c.fillText(label, (x0 + x1) / 2, y0 - 6);
        if (b.bubbleT > 0 && b.bubble) {
          const t = b.bubble.length > 34 ? b.bubble.slice(0, 33) + '…' : b.bubble;
          const tw = c.measureText(t).width + 14, bx = (x0 + x1) / 2 - tw / 2, by = y0 - 40;
          c.globalAlpha = Math.min(1, b.bubbleT);
          c.fillStyle = 'rgba(12,16,32,0.85)'; c.fillRect(bx, by, tw, 20);
          c.fillStyle = b.colHex; c.fillRect(bx, by + 20, 6, 4);
          c.fillStyle = '#fff'; c.fillText(t, (x0 + x1) / 2, by + 14);
          c.globalAlpha = 1;
        }
      }
    }
  },
  // teammates always get a marker and name over their head, so you know who not to shoot
  drawAllies(c, w, h) {
    const M = Match;
    if (!M.mode) return;
    const tmp = [0, 0, 0], pt = [0, 0, 0];
    c.font = '600 12px "Barlow Semi Condensed", "Segoe UI", sans-serif';
    c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    // bounty and boss markers
    for (const b of M.bots) {
      if (!b.alive || b.gone || !(b.bounty || b.boss)) continue;
      pt[0] = b.pos[0]; pt[1] = b.pos[1] + 2.5 * (b.scale || 1); pt[2] = b.pos[2];
      const s = GFX.project(pt, tmp);
      if (!s || s[0] < -60 || s[0] > w + 60 || s[1] < -60 || s[1] > h + 60) continue;
      const x = s[0], y = s[1];
      if (b.boss) {
        const bw = 120, fr = U.clamp(b.hp / b.maxHp, 0, 1);
        c.fillStyle = 'rgba(0,0,0,0.65)'; c.fillRect(x - bw / 2 - 2, y - 12, bw + 4, 10);
        c.fillStyle = '#ff3d3d'; c.fillRect(x - bw / 2, y - 10, bw * fr, 6);
        c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,0.8)'; c.strokeText('RAID BOSS', x, y - 17);
        c.fillStyle = '#ffd0d0'; c.fillText('RAID BOSS', x, y - 17);
      } else {
        c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(x, y - 6, 8, 0, TAU); c.fill();
        c.fillStyle = '#1b1503'; c.font = '800 12px Oxanium, "Segoe UI", sans-serif'; c.fillText('$', x, y - 2);
        c.font = '600 12px "Barlow Semi Condensed", "Segoe UI", sans-serif';
        c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,0.8)'; c.strokeText('BOUNTY', x, y - 18);
        c.fillStyle = '#ffd23f'; c.fillText('BOUNTY', x, y - 18);
      }
    }
    if (M.mode.id !== 'tdm') return;
    for (const b of M.bots) {
      if (!b.alive || b.gone || b.team !== 'blue') continue;
      pt[0] = b.pos[0]; pt[1] = b.pos[1] + 2.45; pt[2] = b.pos[2];
      const s = GFX.project(pt, tmp);
      if (!s || s[0] < -40 || s[0] > w + 40 || s[1] < -40 || s[1] > h + 40) continue;
      const d = V.dist(M.p.pos, b.pos), a = U.clamp(1.25 - d / 70, 0.45, 1);
      const x = s[0], y = s[1];
      c.globalAlpha = a;
      c.fillStyle = 'rgba(0,0,0,0.55)';
      c.beginPath(); c.moveTo(x - 7, y - 9); c.lineTo(x + 7, y - 9); c.lineTo(x, y + 1); c.closePath(); c.fill();
      c.fillStyle = '#4dd4ff';
      c.beginPath(); c.moveTo(x - 5, y - 8); c.lineTo(x + 5, y - 8); c.lineTo(x, y - 1); c.closePath(); c.fill();
      if (d < 45) {
        c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,0.75)'; c.strokeText(b.name, x, y - 13);
        c.fillStyle = '#bfefff'; c.fillText(b.name, x, y - 13);
      }
      c.globalAlpha = 1;
    }
  },
  teamRow(rows, i, M) {
    if (!M.mode || M.mode.ffa) return '';
    const foe = r => r.team !== 'blue';
    if (i > 0 && foe(rows[i]) === foe(rows[i - 1])) return '';
    const mine = !foe(rows[i]);
    const name = M.mode.id === 'tdm' ? (mine ? 'Blue team' : 'Red team') : (mine ? 'You' : 'The squad');
    const sc = M.mode.id === 'clutch' ? (mine ? M.roundsWon : M.roundsLost) + ' rounds' : (mine ? M.score.blue : M.score.red) + ' kills';
    return `<tr class="team-row ${mine ? 't-blue' : 't-red'}"><td colspan="5">${name} · ${sc}</td></tr>`;
  },
  corners(c, x0, y0, x1, y1, l) {
    c.beginPath();
    c.moveTo(x0, y0 + l); c.lineTo(x0, y0); c.lineTo(x0 + l, y0);
    c.moveTo(x1 - l, y0); c.lineTo(x1, y0); c.lineTo(x1, y0 + l);
    c.moveTo(x1, y1 - l); c.lineTo(x1, y1); c.lineTo(x1 - l, y1);
    c.moveTo(x0 + l, y1); c.lineTo(x0, y1); c.lineTo(x0, y1 - l);
    c.stroke();
  },
  drawRadar(c) {
    const M = Match, p = M.p;
    if (!this.radarMap) {
      const k = 6, cv = document.createElement('canvas');
      cv.width = World.W * k; cv.height = World.H * k;
      const x = cv.getContext('2d');
      x.fillStyle = 'rgba(120,150,200,0.5)';
      for (let r = 0; r < World.H; r++) for (let q = 0; q < World.W; q++) if (!World.reach[r * World.W + q]) x.fillRect(q * k, r * k, k, k);
      this.radarMap = cv;
    }
    const R = 84, cx = 16 + R + (window.visualViewport ? 0 : 0), cy = 16 + R, scale = 2.7;
    c.save();
    c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.fillStyle = 'rgba(8,12,26,0.72)'; c.fill();
    c.clip();
    c.translate(cx, cy); c.rotate(p.yaw); c.scale(scale, scale); c.translate(-p.pos[0], -p.pos[2]);
    c.drawImage(this.radarMap, 0, 0, World.W * CS, World.H * CS);
    for (const b of M.bots) {
      if (!b.alive || b.gone) continue;
      const ally = b.team === 'blue';
      c.fillStyle = b.bounty ? '#ffd23f' : ally ? '#4dd4ff' : M.mode && !M.mode.ffa ? '#ff5d5d' : b.colHex;
      c.beginPath(); c.arc(b.pos[0], b.pos[2], 2.2 / scale * 2, 0, TAU); c.fill();
      if (ally) { c.strokeStyle = '#ffffff'; c.lineWidth = 0.5; c.stroke(); }
    }
    c.restore();
    c.strokeStyle = 'rgba(67,217,255,0.6)'; c.lineWidth = 1.5;
    c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.stroke();
    c.fillStyle = '#ffd23f';
    c.beginPath(); c.moveTo(cx, cy - 7); c.lineTo(cx + 5, cy + 5); c.lineTo(cx - 5, cy + 5); c.closePath(); c.fill();
  },
  drawScope(c, w, h) {
    const r = Math.min(w, h) * 0.44;
    c.fillStyle = '#05070c';
    c.beginPath(); c.rect(0, 0, w, h); c.arc(w / 2, h / 2, r, 0, TAU, true); c.fill('evenodd');
    c.strokeStyle = 'rgba(0,0,0,0.85)'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(w / 2 - r, h / 2); c.lineTo(w / 2 + r, h / 2); c.moveTo(w / 2, h / 2 - r); c.lineTo(w / 2, h / 2 + r); c.stroke();
    c.fillStyle = '#ff4d4d'; c.beginPath(); c.arc(w / 2, h / 2, 2, 0, TAU); c.fill();
  },
  updateDom(dt) {
    const M = Match, p = M.p, S = Shop.S, e = this.el, L = this.last;
    const set = (key, el, txt) => { if (L[key] !== txt) { L[key] = txt; el.textContent = txt; } };
    const mid = M.mode ? M.mode.id : 'ffa';
    set('timer', e.timer, U.fmtTime(mid === 'clutch' ? M.roundTime : (M.phase === 'countdown' ? M.total : M.time)));
    let top = 0;
    for (const b of M.bots) if (!b.gone && b.kills > top) top = b.kills;
    // team modes: left = your side (kills, or rounds won), right = the bot team
    const boss = Extras.boss;
    set('me', e.me, mid === 'gungame' ? Math.min(M.ggIdx + 1, GUNGAME_ORDER.length) + '/' + GUNGAME_ORDER.length : String(mid === 'clutch' ? M.roundsWon : mid === 'tdm' ? M.score.blue : p.kills));
    set('top', e.top, mid === 'boss' ? (boss ? Math.max(0, Math.ceil(boss.hp / boss.maxHp * 100)) : 0) + '%' : String(mid === 'clutch' ? M.roundsLost : M.mode.ffa ? top : M.score.red));
    // style meter + streak multiplier
    const sr = Style.rankOf(Style.meter), rk = STYLE_RANKS[sr], nx = STYLE_RANKS[sr + 1];
    const showStyle = Style.meter > 1 || p.streak >= 3 || Style.feed.length > 0;
    if (L.showStyle !== showStyle) { L.showStyle = showStyle; e.style.hidden = !showStyle; }
    if (showStyle) {
      if (L.sr !== sr) { L.sr = sr; e['style-rank'].textContent = rk.short; e['style-name'].textContent = rk.name; e.style.style.setProperty('--sc', rk.color); }
      const fr = nx ? Math.round((Style.meter - rk.at) / (nx.at - rk.at) * 100) : 100;
      if (L.sfr !== fr) { L.sfr = fr; e['style-fill'].style.width = fr + '%'; }
      const sm = Style.streakMult(p.streak), tot = sm * rk.mult;
      set('smult', e['style-mult'], '×' + tot.toFixed(2).replace(/0$/, '') + ' credits');
      set('streak', e.streak, p.streak >= 3 ? `STREAK ${p.streak} · ×${sm}` : p.streak > 0 ? `streak ${p.streak} · ×1.1 at 3` : '');
      const fh = Style.feed.map(f => `<div class="${f.big ? 'big' : ''}" style="opacity:${Math.min(1, f.t * 1.5).toFixed(2)}">${U.esc(f.text)}</div>`).join('');
      if (L.fh !== fh) { L.fh = fh; e['style-feed'].innerHTML = fh; }
    }
    // BotGuard meter
    const dv = Math.floor(AC.det), dt2 = AC.tier();
    if (L.dv !== dv) { L.dv = dv; e['det-val'].textContent = dv + '%'; }
    if (L.dtn !== dt2.name) { L.dtn = dt2.name; e['det-tier'].textContent = dt2.name; e.det.style.setProperty('--dc', dt2.color); }
    const fl = AC.flashT > 0;
    if (L.fl !== fl) { L.fl = fl; e.det.classList.toggle('scan', fl); }
    const adm = AC.admin ? `ADMIN ${AC.admin.name} WATCHING · ${Math.ceil(AC.admin.t)}s` : '';
    if (L.adm !== adm) { L.adm = adm; e.admin.textContent = adm; e.admin.hidden = !adm; }
    if (L.pan !== Shop.panic) { L.pan = Shop.panic; e.panic.hidden = !Shop.panic; }
    const rad = !!(S.radar || Extras.uavT > 0);
    if (L.rad !== rad) { L.rad = rad; e.hud.classList.toggle('has-radar', rad); }
    const tier = Chat.tierOf(Chat.sus);
    const susW = Math.round(Chat.sus);
    if (L.sus !== susW) { L.sus = susW; e['sus-fill'].style.width = susW + '%'; }
    if (L.tier !== tier) { L.tier = tier; e['sus-label'].textContent = SUS_TIERS[tier].name; e.sus.style.setProperty('--sus', SUS_TIERS[tier].color); }
    const hp = Math.max(0, Math.ceil(p.hp));
    set('hp', e.hp, String(hp));
    if (L.hpw !== hp) { L.hpw = hp; e['hp-fill'].style.width = hp + '%'; e.hud.classList.toggle('low', hp < 35 && p.alive); }
    const w = M.weapon();
    set('ammo', e.ammo, S.infAmmo ? '∞' : String(p.ammo[w.id] ?? 0));
    set('mag', e.mag, S.infAmmo ? 'bottomless' : '/ ' + M.magSize(w));
    set('wname', e.wname, w.name);
    if (L.reloading !== (p.reloadT > 0)) { L.reloading = p.reloadT > 0; e.reload.hidden = !L.reloading; }
    set('earn', e.earn, '+' + U.fmt(M.earn.total) + ' CR');
    set('salt', e.salt, '+' + U.fmt(M.earn.salt) + ' salt');
    // abilities
    const ab = [];
    if (S.freeze) ab.push(`<span class="ab ${p.freezeCD > 0 ? 'cd' : ''}"><kbd>Q</kbd>Freeze${p.freezeCD > 0 ? ' ' + Math.ceil(p.freezeCD) : ''}</span>`);
    if (S.blink) ab.push(`<span class="ab ${p.blinkCD > 0 ? 'cd' : ''}"><kbd>E</kbd>Blink${p.blinkCD > 0 ? ' ' + Math.ceil(p.blinkCD) : ''}</span>`);
    if (S.orbital) ab.push(`<span class="ab ${Extras.orbitalCD > 0 ? 'cd' : ''}"><kbd>X</kbd>Orbital${Extras.orbitalCD > 0 ? ' ' + Math.ceil(Extras.orbitalCD) : ''}</span>`);
    if (S.admin) ab.push(`<span class="ab ${Extras.adminCD > 0 ? 'cd' : ''}"><kbd>G</kbd>Kick${Extras.adminCD > 0 ? ' ' + Math.ceil(Extras.adminCD) : ''}</span>`);
    if (Extras.uavT > 0) ab.push(`<span class="ab on">Drone ${Math.ceil(Extras.uavT)}</span>`);
    if (S.slowmo) ab.push(`<span class="ab ${Extras.slowT > 0 ? 'on' : Extras.slowCD > 0 ? 'cd' : ''}"><kbd>V</kbd>Slow${Extras.slowT <= 0 && Extras.slowCD > 0 ? ' ' + Math.ceil(Extras.slowCD) : ''}</span>`);
    if (S.panicKey || Shop.panic) ab.push(`<span class="ab ${Shop.panic ? 'on' : ''}"><kbd>P</kbd>${Shop.panic ? 'Reload' : 'Panic'}</span>`);
    if (S.afk) ab.push(`<span class="ab ${M.afk ? 'on' : ''}"><kbd>F</kbd>AFK ${M.afk ? 'on' : 'off'}</span>`);
    const abHtml = ab.join('');
    if (L.abHtml !== abHtml) { L.abHtml = abHtml; e.abil.innerHTML = abHtml; }
    if (L.afk !== M.afk) { L.afk = M.afk; e.afk.hidden = !M.afk; }
    const ft = M.freezeT > 0 ? 1 : 0;
    if (L.ft !== ft) { L.ft = ft; e['freeze-tint'].classList.toggle('on', !!ft); }
    // chat input
    const ci = Chat.typing ? 'Say: ' + Chat.draft + '▌' : '';
    if (L.ci !== ci) { L.ci = ci; e.chatin.textContent = ci; e.chatin.hidden = !Chat.typing; e.hud.classList.toggle('chatting', Chat.typing); }
    // scoreboard
    const showBoard = (Input.keys.Tab || M.phase === 'over') && M.phase !== 'over';
    if (showBoard) {
      this.boardT -= dt;
      if (this.boardT <= 0 || e.board.hidden) {
        this.boardT = 0.3;
        const rows = M.board();
        e.board.innerHTML = `<div class="bd-head"><span>${U.esc(M.def.name)}</span><span>${U.fmtTime(M.time)} left</span></div>
          <table><thead><tr><th>#</th><th>Player</th><th>K</th><th>D</th><th>Ping</th></tr></thead><tbody>
          ${rows.map((r, i) => `${this.teamRow(rows, i, M)}<tr class="${r.isPlayer ? 'me' : ''}"><td>${i + 1}</td><td style="color:${r.col}">${U.esc(r.name)}</td><td>${r.k}</td><td>${r.d}</td><td>${r.ping}</td></tr>`).join('')}
          </tbody></table><div class="bd-foot">${U.fmt(Chat.reports)} reports filed · ${AC.admin ? 'admin ' + U.esc(AC.admin.name) + ' is watching' : 'admin is AFK (for now)'} · BotGuard ${Math.round(AC.det)}%</div>`;
        e.board.hidden = false;
      }
    } else if (!e.board.hidden) e.board.hidden = true;
    if (Save.data.settings.fps) set('fps', e.fps, Game.fps + ' fps'); else set('fps', e.fps, '');
  },
};

function ordinal(n) { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }
