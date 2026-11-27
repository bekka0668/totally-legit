'use strict';
/* =========================================================================
   Hub: server browser, Bandit's cheat shop, arsenal, locker, stats, settings
   ========================================================================= */
const GLYPHS = {
  wrench: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L3 17.8 6.2 21l6.3-6.3a4 4 0 0 0 5.2-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  chart: '<path d="M3 20h18M6 16v-4M11 16V8M16 16v-6M20 6l-5 4-4-3-5 4"/>',
  ghost: '<path d="M5 21V10a7 7 0 0 1 14 0v11l-2.3-2-2.4 2-2.3-2-2.3 2-2.4-2z"/><circle cx="9.5" cy="10.5" r="1"/><circle cx="14.5" cy="10.5" r="1"/>',
  mask: '<path d="M3 7c3-1 6-1 9 1 3-2 6-2 9-1 0 6-2 10-5 10-2 0-3-2-4-2s-2 2-4 2c-3 0-5-4-5-10z"/><path d="M7 11h3M14 11h3"/>',
  bomb: '<circle cx="11" cy="14" r="7"/><path d="M15 9l3-3M17 4l1 2 2 1"/>',
  star: '<path d="M12 2l3 6.5 7 .9-5.2 4.8 1.4 7L12 17.8 5.8 21.2l1.4-7L2 9.4l7-.9z"/>',
  chat: '<path d="M4 4h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
  aim: '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  head: '<circle cx="12" cy="9" r="7"/><path d="M8 22v-4h8v4"/>',
  level: '<rect x="2" y="8" width="20" height="8" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M8 8v8M16 8v8"/>',
  speed: '<path d="m4 6 6 6-6 6M12 6l6 6-6 6"/>',
  inf: '<path d="M7 9c-3 0-4 2-4 3s1 3 4 3c4 0 6-6 10-6 3 0 4 2 4 3s-1 3-4 3c-4 0-6-6-10-6z"/>',
  shield: '<path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/>',
  coin: '<circle cx="12" cy="12" r="9"/><path d="M15 9c-1-1-2-1.5-3-1.5-2 0-3 1-3 2.2 0 3 6 1.8 6 4.8 0 1.3-1.2 2.3-3 2.3-1.2 0-2.4-.5-3.2-1.5M12 5.5v2M12 16.8v2"/>',
  wifi: '<path d="M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19.5" r="1.2" fill="currentColor"/><path d="M4 4l16 16"/>',
};
const glyph = (k, cls) => `<svg class="${cls || 'glyph'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${GLYPHS[k] || ''}</svg>`;
const RACCOON_SVG = `<svg class="raccoon-svg" viewBox="0 0 64 64" aria-hidden="true">
  <path d="M12 23 8 5l16 9z" fill="#8a8c97"/><path d="M52 23l4-18-16 9z" fill="#8a8c97"/>
  <path d="M13 19l-2-9 8 4z" fill="#17151b"/><path d="M51 19l2-9-8 4z" fill="#17151b"/>
  <ellipse cx="32" cy="34" rx="24" ry="20" fill="#8a8c97"/>
  <path d="M9 32q23-11 46 0-4 11-15 8-8-4-16 0-11 3-15-8z" fill="#17151b"/>
  <ellipse cx="32" cy="45.5" rx="11" ry="8" fill="#e8e3d9"/>
  <circle cx="23" cy="33.5" r="4.2" fill="#fff"/><circle cx="41" cy="33.5" r="4.2" fill="#fff"/>
  <circle cx="24.2" cy="34" r="2.1" fill="#17151b"/><circle cx="42.2" cy="34" r="2.1" fill="#17151b"/>
  <ellipse cx="32" cy="42" rx="3.6" ry="2.5" fill="#17151b"/>
  <path d="M17 26q6-4 11 0M36 26q5-4 11 0" stroke="#e8e3d9" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <path d="M27 49q5 3.5 10-.5" stroke="#17151b" stroke-width="1.6" fill="none" stroke-linecap="round"/>
</svg>`;

const Hub = {
  tab: 'play', selMap: null, selMod: 'hb', selNode: null, selWeapon: null, lockerTab: 'skins',
  quip: '', quipT: 0, t: 0, lastWallet: '', resetArmed: false, el: {},

  init() {
    const $ = id => document.getElementById(id);
    this.el = { hub: $('hub'), main: $('hub-main'), cr: $('w-cr'), salt: $('w-salt'), rank: $('w-rank'), nav: $('hub-nav'), badge: $('badge-bandit'), modal: $('modal'), toast: $('toast') };
    this.el.nav.addEventListener('click', e => {
      const b = e.target.closest('[data-tab]');
      if (b) { SFX.init(); SFX.ui(); this.setTab(b.dataset.tab); }
    });
    document.getElementById('w-rank-btn').addEventListener('click', () => { SFX.init(); SFX.ui(); this.setTab('stats'); });
    document.getElementById('btn-settings').addEventListener('click', () => { SFX.init(); SFX.ui(); this.openSettings(); });
    this.el.main.addEventListener('click', e => this.onClick(e));
    this.el.main.addEventListener('input', e => this.onInput(e));
    this.el.main.addEventListener('change', e => this.onInput(e));
    this.el.main.addEventListener('dblclick', e => {
      const n = e.target.closest('[data-act="node"]');
      if (n) this.buyNode(n.dataset.up);
    });
    this.selMap = Save.data.lastMap || 'closet';
    this.selWeapon = Save.data.equipped;
    this.quip = U.pick(BANDIT_QUIPS.idle);
    this.selMod = this.firstInterestingModule();
  },
  firstInterestingModule() {
    const m = MODULES.find(m => UPGRADES.some(u => u.mod === m.id && Shop.state(u.id) === 'available' && Save.data.credits >= u.cost));
    return m ? m.id : 'hb';
  },
  show() {
    this.el.hub.hidden = false;
    Showroom.setup();
    this.render();
    if (!Save.data.flags.intro) this.openIntro();
    else {
      const day = More.checkDay();
      if (day) { this.toast(`Day ${day.streak} login bonus: +${U.fmt(day.cr)} CR, +${day.salt} salt`, 'good'); this.render(); }
    }
  },
  hide() { this.el.hub.hidden = true; this.closeModal(); },
  setTab(t) {
    this.tab = t; this.resetArmed = false; this.smurfArmed = false;
    if (t === 'bandit' && !this.selNode) this.selMod = this.firstInterestingModule();
    this.render();
    this.el.main.scrollTop = 0;
  },
  update(dt) {
    this.t += dt;
    const w = U.fmt(Save.data.credits) + '|' + U.fmt(Save.data.salt);
    if (w !== this.lastWallet) {
      this.lastWallet = w;
      this.el.cr.textContent = U.fmt(Save.data.credits);
      this.el.salt.textContent = U.fmt(Save.data.salt);
      this.el.rank.textContent = Extras.rankInfo().name;
      const n = Shop.affordableCount();
      this.el.badge.textContent = n ? String(n) : '';
      this.el.badge.hidden = !n;
    }
    if (this.tab === 'bandit') {
      this.quipT += dt;
      if (this.quipT > 9) { this.quipT = 0; this.setQuip(U.pick(BANDIT_QUIPS.idle)); }
    }
    if (this.tab === 'locker' && this.lockerTab === 'xhair') this.drawXhairPreview();
  },
  render3D() {
    GFX.clearDynamic();
    const kind = this.tab === 'bandit' ? 'raccoon' : (this.tab === 'arsenal' || this.tab === 'locker') ? 'gun' : 'bot';
    const wid = this.selWeapon || Save.data.equipped;
    Showroom.submit(kind, this.t, { weapon: wid, skin: Save.data.skinOf[wid] || 'factory', sight: U.hex(Save.data.xhair.color) });
    GFX.chams = null; GFX.flash = 0;
    GFX.time = this.t;
    const cssW = GFX.cssW || window.innerWidth;
    const right = Math.min(cssW, this.tab === 'bandit' ? 1350 : 800);
    const ndc = cssW - right < 240 ? 0.62 : ((right + cssW) / 2) / cssW * 2 - 1;
    GFX.setCamera(Showroom.camera(kind, ndc));
    GFX.render({ noView: true });
  },
  setQuip(q) {
    this.quip = q;
    const b = document.getElementById('bandit-bubble');
    if (b) { b.textContent = q; b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }
  },
  toast(msg, kind) {
    const t = document.createElement('div');
    t.className = 'toast-item ' + (kind || '');
    t.textContent = msg;
    this.el.toast.appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, 2400);
  },

  /* ---------------- rendering ---------------- */
  render() {
    More.newMarket();
    Extras.ensureContracts();
    Extras.checkAch();
    Extras.checkRank();
    this.lastWallet = '';
    this.update(0);
    for (const b of this.el.nav.querySelectorAll('[data-tab]')) {
      const on = b.dataset.tab === this.tab;
      b.classList.toggle('on', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    }
    this.el.hub.dataset.tab = this.tab;
    const html = this['tab_' + this.tab] ? this['tab_' + this.tab]() : '';
    this.el.main.innerHTML = html;
    if (this.tab === 'locker' && this.lockerTab === 'xhair') this.drawXhairPreview(true);
  },

  tab_play() {
    const S = Shop.S, D = Save.data;
    let mode = MODE_BY_ID[D.mode] || MODES[0];
    if (!Shop.modeOwned(mode.id)) mode = MODES[0];
    const nextMode = Shop.nextMode();
    const modes = MODES.map(md => {
      const own = Shop.modeOwned(md.id), next = nextMode && nextMode.id === md.id, afford = D.credits >= (md.cost || 0);
      if (!own) return `<button class="mode locked ${next ? (afford ? 'buyable' : 'poor') : ''}" data-act="${next ? 'buymode' : 'modelocked'}" data-mode="${md.id}" aria-label="${U.esc(md.name)}: locked">
        <span class="mode-tag">${md.tag} · locked</span><b>${U.esc(md.name)}</b><small>${U.esc(md.blurb)}</small>
        <em class="mode-price">${next ? 'Unlock · ' + U.fmt(md.cost) + ' CR' : 'Unlock the one before first'}</em></button>`;
      return `<button class="mode ${md.id === mode.id ? 'on' : ''}" role="radio" aria-checked="${md.id === mode.id}" data-act="mode" data-mode="${md.id}">
        <span class="mode-tag">${md.tag}</span><b>${U.esc(md.name)}</b><small>${U.esc(md.blurb)}</small><em>${md.pay !== 1 ? '×' + md.pay + ' pay per kill' : 'standard pay'}</em></button>`;
    }).join('');
    const firstLocked = MAPS.find(m => !D.maps[m.id]);
    const last = MAP_BY_ID[D.lastMap] && D.maps[D.lastMap] ? MAP_BY_ID[D.lastMap] : MAPS[0];
    const rows = MAPS.map((m, i) => {
      const owned = !!D.maps[m.id];
      const next = firstLocked && firstLocked.id === m.id;
      const bots = m.bots + S.extraBots;
      const afford = D.credits >= m.unlock;
      let act;
      const teamsOk = mode.id !== 'tdm' || lineup(m, 'tdm').allies >= 1;
      if (owned) act = teamsOk ? `<button class="btn primary" data-act="play" data-map="${m.id}">Join</button>` : `<span class="locked-tag">Too small for teams</span>`;
      else if (next) act = `<button class="btn ${afford ? 'buy' : 'poor'}" data-act="unlock" data-map="${m.id}">Unlock · ${U.fmt(m.unlock)} CR</button>`;
      else act = `<span class="locked-tag">Unlock the one above first</span>`;
      return `<article class="srv ${owned ? '' : 'locked'}" role="listitem">
        <div class="srv-thumb" style="--z:${m.env.zenith};--h:${m.env.horizon};--f:${m.col.floor};--w:${m.col.wall};--a:${m.col.accent}"><span>${matchupLabel(m, mode.id, S.extraBots)}</span></div>
        <div class="srv-info">
          <h3>${U.esc(m.name)}</h3>
          <p>${U.esc(m.blurb)}</p>
          <div class="srv-meta"><span>${bots} bot${bots > 1 ? 's' : ''}</span><span class="pay">${U.fmt(m.cr * mode.pay * S.cr)} CR / kill</span><span>${mode.id === 'clutch' ? 'first to 5 rounds' : U.fmtTime(m.time + S.overtime)}</span>${m.grav ? '<span>low gravity</span>' : ''}<span>${12 + i * 9} ms</span></div>
        </div>
        <div class="srv-act">${act}</div>
      </article>`;
    }).join('');
    return `<section class="pane play">
      <header class="pane-head">
        <div>
          <div class="eyebrow">BOTCAMP // community servers</div>
          <h1>Pick a lobby</h1>
          <p class="lede">Every kill pays credits. Credits buy cheats. Nobody on these servers is checking.</p>
        </div>
        <button class="btn primary big" data-act="play" data-map="${last.id}">Quick play · ${U.esc(last.name)}</button>
      </header>
      ${Shop.canSmurf() ? `<button class="smurf-banner" data-act="tab" data-tab="stats"><b>Ready for a fresh account.</b> Start over in Stats for ×${Shop.smurfMult((Save.data.smurf || 0) + 1).toFixed(2)} credits forever.</button>` : ''}
      ${this.detCard()}
      ${this.dailyHtml()}
      ${this.contractsHtml()}
      <div class="modes" role="radiogroup" aria-label="Game mode">${modes}</div>
      <div class="srv-list" role="list">${rows}</div>
      <div class="tips">
        <div class="tip"><b>Can't aim?</b> Expected. Play a match, bank the credits, then visit Bandit.</div>
        <div class="tip"><b>Chat getting salty?</b> Angry messages drop salt. Spend it in the Locker.</div>
        <div class="tip"><b>BotGuard is real now.</b> Every cheat adds detection. Too many reports and an admin shows up to watch.</div>
      </div>
    </section>`;
  },

  tab_bandit() {
    const mod = MODULE_BY_ID[this.selMod] || MODULES[0];
    const nodes = UPGRADES.filter(u => u.mod === mod.id);
    const maxX = Math.max(...nodes.map(n => n.x)), maxY = Math.max(...nodes.map(n => n.y));
    // four-column trees use slimmer nodes so they still fit beside the module list
    const wide = maxX >= 3, PX = wide ? 136 : 172, PY = 96, NW = wide ? 126 : 150, NH = 66, PAD = 12;
    const TW = (maxX + 1) * PX - (PX - NW) + PAD * 2, TH = (maxY + 1) * PY - (PY - NH) + PAD * 2;
    const pos = n => [PAD + n.x * PX, PAD + n.y * PY];
    let links = '';
    for (const n of nodes) for (const r of (n.req || [])) {
      const pr = UPGRADE_BY_ID[r];
      if (pr.mod !== n.mod) continue; // cross-module requirements are listed in the detail panel, not drawn
      const [ax, ay] = pos(pr), [bx, by] = pos(n);
      const x1 = ax + NW / 2, y1 = ay + NH, x2 = bx + NW / 2, y2 = by;
      const lit = Shop.owned(r);
      links += `<path d="M${x1} ${y1} C${x1} ${y1 + 22} ${x2} ${y2 - 22} ${x2} ${y2}" class="${lit ? 'lit' : ''}"/>`;
    }
    if (!this.selNode || UPGRADE_BY_ID[this.selNode].mod !== mod.id) {
      const pick = nodes.find(n => Shop.state(n.id) === 'available') || nodes.find(n => Shop.state(n.id) === 'locked') || nodes[0];
      this.selNode = pick.id;
    }
    const nodeHtml = nodes.map(n => {
      const st = Shop.state(n.id);
      const price = Shop.priceOf(n.id), deal = More.dealOf(n.id);
      const poor = st === 'available' && Save.data.credits < price;
      const [x, y] = pos(n);
      const cost = st === 'owned' ? 'INJECTED' : U.fmt(price) + ' CR' + (deal ? ` · −${Math.round(deal.off * 100)}%` : '');
      return `<button class="node ${st} ${poor ? 'poor' : ''} ${this.selNode === n.id ? 'sel' : ''}" data-act="node" data-up="${n.id}" style="left:${x}px;top:${y}px;width:${NW}px" aria-label="${U.esc(n.name)}: ${st}">
        <span class="n-name">${U.esc(n.name)}</span><span class="n-cost">${cost}</span></button>`;
    }).join('');
    const mods = MODULES.map(m => {
      const pr = Shop.modProgress(m.id);
      const ready = UPGRADES.some(u => u.mod === m.id && Shop.state(u.id) === 'available' && Save.data.credits >= u.cost);
      return `<button class="mod ${m.id === mod.id ? 'sel' : ''} ${Shop.modOn(m.id) ? '' : 'off'}" data-act="mod" data-mod="${m.id}" style="--mc:${m.color}">
        <span class="mod-glyph">${glyph(m.glyph)}</span>
        <span class="mod-txt"><b>${m.name}</b><small>${m.kind}</small></span>
        <span class="mod-prog">${ready ? '<i class="dot"></i>' : ''}${pr.owned}/${pr.total}</span>
      </button>`;
    }).join('');
    const pr = Shop.modProgress(mod.id);
    const sel = UPGRADE_BY_ID[this.selNode];
    const sst = Shop.state(sel.id);
    const selPrice = Shop.priceOf(sel.id), selDeal = More.dealOf(sel.id);
    const afford = Save.data.credits >= selPrice;
    let btn;
    if (sst === 'owned') btn = `<div class="inj-done">Injected${Shop.modOn(mod.id) ? '' : ' (module switched off)'}</div>`;
    else if (sst === 'locked') btn = `<button class="btn" disabled>Needs ${sel.req.map(r => UPGRADE_BY_ID[r].name).join(' + ')}</button>`;
    else btn = `<button class="btn inject ${afford ? '' : 'poor'}" data-act="buy" data-up="${sel.id}">${afford ? 'Inject' : 'Need'} · ${U.fmt(selPrice)} CR</button>`;
    const affordN = Shop.affordableCount();
    return `<section class="pane bandit">
      <header class="bandit-head">
        <div class="bandit-id">
          ${RACCOON_SVG}
          <div>
            <div class="bandit-name">BANDIT <span>cheat loader v6.6</span></div>
            <div class="bandit-pills"><span class="pill det" style="--dc:${AC.tier().color}">● BotGuard ${Math.round(AC.det)}% ${AC.tier().name.toLowerCase()}</span><span class="pill">risk ${Shop.S.risk.toFixed(1)} / scan +${AC.scanGain().toFixed(1)}%</span><span class="pill hot">${affordN} ready to inject</span></div>
          </div>
        </div>
        <p class="bubble" id="bandit-bubble">${U.esc(this.quip)}</p>
      </header>
      ${this.marketHtml()}
      <div class="bandit-body">
        <nav class="mods" aria-label="Cheat modules">${mods}</nav>
        <div class="tree-pane" style="--mc:${mod.color}">
          <div class="tree-head">
            <div class="tree-title">${glyph(mod.glyph, 'glyph big')}<div><h2>${mod.name}</h2><p>${mod.kind} · ${U.esc(mod.blurb)}${mod.stealth ? ' · <b class="ok">undetectable</b>' : ` · <b>risk ${Shop.riskOf(mod.id).toFixed(1)}</b> while on`}</p></div></div>
            ${pr.owned ? `<label class="switch"><input type="checkbox" id="mod-toggle" data-act="toggle" data-mod="${mod.id}" ${Shop.modOn(mod.id) ? 'checked' : ''}><span class="sw-track"></span><span class="sw-label">${Shop.modOn(mod.id) ? 'On' : 'Off'}</span></label>` : ''}
          </div>
          <div class="tree-scroll"><div class="tree" style="width:${TW}px;height:${TH}px">
            <svg class="links" width="${TW}" height="${TH}" viewBox="0 0 ${TW} ${TH}" aria-hidden="true">${links}</svg>
            ${nodeHtml}
          </div></div>
        </div>
        <aside class="node-detail" style="--mc:${mod.color}">
          <div class="nd-kind">${mod.name} // ${sst === 'owned' ? 'injected' : sst === 'locked' ? 'locked' : 'in stock'}</div>
          <h3>${U.esc(sel.name)}</h3>
          <p>${U.esc(sel.desc)}</p>
          <div class="nd-risk">${sel.risk ? `Detection risk <span class="dots">${'●'.repeat(Math.ceil(sel.risk))}${'○'.repeat(Math.max(0, 5 - Math.ceil(sel.risk)))}</span> +${(sel.risk * 0.15).toFixed(2)}% per scan` : '<span class="ok">No detection risk</span>'}</div>
          ${sel.req ? `<div class="nd-req">Requires: ${sel.req.map(r => `<span class="${Shop.owned(r) ? 'ok' : ''}">${U.esc(UPGRADE_BY_ID[r].name)}</span>`).join(' ')}</div>` : ''}
          <div class="nd-price"><span class="sticker">${sst === 'owned' ? 'SOLD' : U.fmt(selPrice) + ' CR'}</span>${selDeal && sst !== 'owned' ? ` <s class="was">${U.fmt(sel.cost)}</s> <b class="deal">black market −${Math.round(selDeal.off * 100)}%</b>` : ''}</div>
          ${btn}
          <p class="nd-fine">No refunds. No questions. Some anti-cheat, unfortunately.</p>
        </aside>
      </div>
    </section>`;
  },

  detCard() {
    const t = AC.tier(), d = Math.round(AC.det), S = Shop.S;
    const scan = AC.scanGain();
    const tip = S.owner ? 'You own the servers. BotGuard still keeps a number, but it works for you now: no bans, no kicks, no ban waves.' : d >= 75 ? 'One more bad match and you are banned. Switch modules off at Bandit\'s and lay low.'
      : d >= 50 ? 'BotGuard is watching closely. Run fewer cheats or buy GHOSTWARE.'
      : d >= 25 ? 'You have been flagged. A match with everything switched off cools you down fast.'
      : 'Nobody suspects a thing. Yet.';
    return `<div class="det-card" style="--dc:${t.color}">
      <div class="det-head"><span class="eyebrow">BotGuard anticheat</span><b>${d}% · ${t.name}</b></div>
      <div class="det-bar"><i style="width:${d}%"></i><span style="left:25%"></span><span style="left:50%"></span><span style="left:75%"></span></div>
      <p>${tip} Each scan adds <b>${scan.toFixed(1)}%</b> (risk ${S.risk.toFixed(1)}), every ${AC.interval()} s. Bans so far: ${Save.data.stats.bans || 0}.</p>
      <p>Ban wave risk after each match: <b>${Math.round(AC.waveChance() * 100)}%</b>${AC.waveChance() ? '. Waves can ban you for matches you already finished.' : ' (only Monitored accounts or worse get caught in waves)'}.</p>
    </div>`;
  },
  marketHtml() {
    const m = Save.data.market;
    if (!m || !m.deals.length) return '';
    const cards = m.deals.map(d => {
      const u = UPGRADE_BY_ID[d.id], mod = MODULE_BY_ID[u.mod], own = Shop.owned(u.id);
      return `<button class="deal-card ${own ? 'sold' : ''}" data-act="node" data-up="${u.id}" style="--mc:${mod.color}" onclick="Hub.selMod='${u.mod}'">
        <span class="dc-mod">${mod.name}</span><b>${U.esc(u.name)}</b>
        <span class="dc-price">${own ? 'SOLD' : `<s>${U.fmt(u.cost)}</s> ${U.fmt(Shop.priceOf(u.id))} CR`}</span><em>−${Math.round(d.off * 100)}%</em></button>`;
    }).join('');
    return `<div class="market"><div class="ct-head"><span class="eyebrow">Black market · today only</span><span class="msg">New deals every day. Fell off a truck, apparently.</span></div><div class="deal-row">${cards}</div></div>`;
  },
  dailyHtml() {
    const dl = Save.data.daily;
    if (!dl || !dl.list || !dl.list.length) return '';
    const cards = dl.list.map((c, i) => {
      const fr = Math.min(1, c.prog / c.n);
      return `<div class="contract daily ${c.done ? 'done' : ''} ${c.claimed ? 'claimed' : ''}">
        <div class="ct-text">${U.esc(Extras.contractText(c))}</div>
        <div class="track"><i style="width:${Math.round(fr * 100)}%"></i></div>
        <div class="ct-foot"><span>${U.fmt(c.prog)} / ${U.fmt(c.n)}</span><em>+${U.fmt(c.cr)} CR · +${c.salt} salt</em></div>
        ${c.claimed ? '<span class="inj-done">Claimed</span>' : c.done ? `<button class="btn small primary" data-act="claimdaily" data-i="${i}">Claim</button>` : '<span class="msg">double pay · today only</span>'}
      </div>`;
    }).join('');
    return `<div class="contracts"><div class="ct-head"><span class="eyebrow">Daily jobs · login streak ${dl.streak} day${dl.streak > 1 ? 's' : ''}</span><span class="msg">New jobs and a bigger login bonus every day you come back (up to 7).</span></div><div class="ct-grid">${cards}</div></div>`;
  },
  contractsHtml() {
    const D = Save.data;
    const cards = D.contracts.map((c, i) => {
      const fr = Math.min(1, c.prog / c.n);
      return `<div class="contract ${c.done ? 'done' : ''}">
        <div class="ct-text">${U.esc(Extras.contractText(c))}</div>
        <div class="track"><i style="width:${Math.round(fr * 100)}%"></i></div>
        <div class="ct-foot"><span>${U.fmt(c.prog)} / ${U.fmt(c.n)}</span><em>+${U.fmt(c.cr)} CR · +${c.salt} salt</em></div>
        ${c.done ? `<button class="btn small primary" data-act="claim" data-i="${i}">Claim</button>`
          : `<button class="btn small ghost" data-act="reroll" data-i="${i}" title="Swap this contract for another one">Swap · 10 salt</button>`}
      </div>`;
    }).join('');
    return `<div class="contracts"><div class="ct-head"><span class="eyebrow">Bandit's odd jobs</span><span class="msg">Finish a contract, then claim it here.</span></div><div class="ct-grid">${cards}</div></div>`;
  },

  tab_arsenal() {
    const D = Save.data;
    const sel = WEAPON_BY_ID[this.selWeapon] || WEAPONS[0];
    const maxDps = 260;
    const guns = WEAPONS.map((w, i) => {
      const owned = !!D.weapons[w.id], eq = D.equipped === w.id;
      return `<button class="gun ${sel.id === w.id ? 'sel' : ''} ${owned ? 'owned' : ''}" data-act="gun" data-gun="${w.id}">
        <span class="g-key">${i + 1}</span><span class="g-kind">${w.kind} · ×${w.pay}</span><b>${U.esc(w.name)}</b>
        <span class="g-state">${eq ? 'Equipped' : owned ? 'Owned' : U.fmt(w.cost) + ' CR'}</span></button>`;
    }).join('');
    const dps = sel.dmg * sel.pellets / sel.rate;
    const bars = [
      ['Damage', Math.min(1, sel.dmg * sel.pellets / 220), `${sel.pellets > 1 ? sel.pellets + '×' : ''}${sel.dmg}`],
      ['Fire rate', Math.min(1, (1 / sel.rate) / 14), `${Math.round(60 / sel.rate)} rpm`],
      ['Per second', Math.min(1, dps / maxDps), `${Math.round(dps)} dps`],
      ['Magazine', Math.min(1, sel.mag / 32), `${Math.round(sel.mag * (Shop.attOf(sel.id).extmag ? 1.4 : 1))}`],
      ['Accuracy', 1 - Math.min(1, sel.spread / 0.09), `${(sel.spread / DEG).toFixed(1)}° spread`],
      ['Pay', (sel.pay - 1) / 0.5, `×${sel.pay} credits`],
    ].map(b => `<div class="bar"><span>${b[0]}</span><div class="track"><i style="width:${Math.round(b[1] * 100)}%"></i></div><em>${b[2]}</em></div>`).join('');
    const owned = !!D.weapons[sel.id];
    let act;
    if (!owned) act = `<button class="btn ${D.credits >= sel.cost ? 'buy' : 'poor'}" data-act="buygun" data-gun="${sel.id}">Buy · ${U.fmt(sel.cost)} CR</button>`;
    else if (D.equipped !== sel.id) act = `<button class="btn primary" data-act="equip" data-gun="${sel.id}">Equip</button>`;
    else act = `<span class="inj-done">Equipped</span>`;
    const skins = SKINS.filter(s => D.skins[s.id]).map(s => `<button class="sw ${(D.skinOf[sel.id] || 'factory') === s.id ? 'on' : ''}" data-act="applyskin" data-skin="${s.id}" style="--c0:${s.c0};--c1:${s.c1}" title="${U.esc(s.name)}" aria-label="Apply ${U.esc(s.name)}"></button>`).join('');
    return `<section class="pane arsenal">
      <header class="pane-head">
        <div><div class="eyebrow">Arsenal</div><h1>Weapons</h1><p class="lede">Equipped guns start every match in your hands. Switch mid-match with the number keys or the scroll wheel.</p></div>
      </header>
      <div class="gun-grid">${guns}</div>
      <div class="gun-detail">
        <div class="gd-head"><div><div class="eyebrow">${sel.kind}</div><h2>${U.esc(sel.name)}</h2></div>${act}</div>
        <p>${U.esc(sel.desc)}</p>
        <div class="bars">${bars}</div>
        ${owned ? this.attHtml(sel) : ''}
        ${owned ? `<div class="skin-row"><h4>Finish</h4><div class="sw-row">${skins}</div><button class="link" data-act="tab" data-tab="locker">More finishes in the Locker</button></div>` : ''}
      </div>
    </section>`;
  },

  tab_locker() {
    const D = Save.data;
    const subs = [['skins', 'Finishes'], ['xhair', 'Crosshair'], ['killfx', 'Kill effects']]
      .map(([k, n]) => `<button class="sub ${this.lockerTab === k ? 'on' : ''}" data-act="locker" data-sub="${k}">${n}</button>`).join('');
    let body = '';
    if (this.lockerTab === 'skins') {
      const ownedGuns = WEAPONS.filter(w => D.weapons[w.id]);
      if (!D.weapons[this.selWeapon]) this.selWeapon = D.equipped;
      const gunSel = ownedGuns.map(w => `<button class="chipbtn ${this.selWeapon === w.id ? 'on' : ''}" data-act="lockgun" data-gun="${w.id}">${U.esc(w.name)}</button>`).join('');
      body = `<div class="lk-guns"><span>Apply to</span>${gunSel}</div><div class="skin-grid">${SKINS.map(s => {
        const own = !!D.skins[s.id], on = (D.skinOf[this.selWeapon] || 'factory') === s.id;
        const act = own ? (on ? '<span class="inj-done">Applied</span>' : `<button class="btn small" data-act="applyskin" data-skin="${s.id}">Apply</button>`)
          : s.pass ? `<span class="locked-tag">Bandit Pass tier ${this.passTierOf('skin', s.id)}</span>`
          : `<button class="btn small ${D.salt >= s.cost ? 'buy' : 'poor'}" data-act="buycos" data-kind="skin" data-id="${s.id}">${U.fmt(s.cost)} salt</button>`;
        return `<div class="skin-card ${on ? 'on' : ''}"><div class="skin-sw pat${s.pat}" style="--c0:${s.c0};--c1:${s.c1}"></div><b>${U.esc(s.name)}</b>${act}</div>`;
      }).join('')}</div>`;
    } else if (this.lockerTab === 'xhair') {
      const x = D.xhair;
      body = `<div class="xh-editor">
        <div class="xh-preview"><canvas id="xh-prev" width="260" height="170" aria-label="Crosshair preview"></canvas></div>
        <div class="xh-controls">
          <div class="xh-styles">${XHAIRS.map(s => {
            const own = !!D.xhairs[s.id];
            return `<button class="chipbtn ${x.style === s.id ? 'on' : ''} ${own ? '' : 'lock'}" data-act="${own ? 'xstyle' : 'buycos'}" data-kind="xhair" data-id="${s.id}">${U.esc(s.name)}${own ? '' : s.pass ? ` · pass tier ${this.passTierOf('xhair', s.id)}` : ` · ${s.cost} salt`}</button>`;
          }).join('')}</div>
          <div class="xh-colors">${XHAIR_COLORS.map(c => `<button class="cdot ${x.color === c ? 'on' : ''}" data-act="xcolor" data-color="${c}" style="--c:${c}" aria-label="Color ${c}"></button>`).join('')}</div>
          <label class="rng"><span>Size</span><input type="range" id="xh-size" min="2" max="16" step="1" value="${x.size}" data-act="xnum" data-key="size"><em>${x.size}</em></label>
          <label class="rng"><span>Gap</span><input type="range" id="xh-gap" min="0" max="12" step="1" value="${x.gap}" data-act="xnum" data-key="gap"><em>${x.gap}</em></label>
          <label class="rng"><span>Thickness</span><input type="range" id="xh-thick" min="1" max="5" step="0.5" value="${x.thick}" data-act="xnum" data-key="thick"><em>${x.thick}</em></label>
          <label class="tog"><input type="checkbox" id="xh-outline" data-act="xbool" data-key="outline" ${x.outline ? 'checked' : ''}> Outline</label>
          <label class="tog"><input type="checkbox" id="xh-dot" data-act="xbool" data-key="dot" ${x.dot ? 'checked' : ''}> Center dot</label>
        </div>
      </div>`;
    } else {
      body = `<div class="fx-grid">${KILLFX.map(k => {
        const own = !!D.killfxs[k.id], on = D.killfx === k.id;
        const act = own ? (on ? '<span class="inj-done">Active</span>' : `<button class="btn small" data-act="usefx" data-id="${k.id}">Use</button>`)
          : k.pass ? `<span class="locked-tag">Bandit Pass tier ${this.passTierOf('killfx', k.id)}</span>`
          : `<button class="btn small ${D.salt >= k.cost ? 'buy' : 'poor'}" data-act="buycos" data-kind="killfx" data-id="${k.id}">${U.fmt(k.cost)} salt</button>`;
        return `<div class="fx-card ${on ? 'on' : ''}"><div class="fx-ico fx-${k.id}"></div><div><b>${U.esc(k.name)}</b><p>${U.esc(k.desc)}</p></div>${act}</div>`;
      }).join('')}</div>`;
    }
    return `<section class="pane locker">
      <header class="pane-head">
        <div><div class="eyebrow">Locker</div><h1>Cosmetics</h1><p class="lede">Paid for in salt: the angrier the lobby chat, the more you collect. You have <b class="salt-num">${U.fmt(D.salt)} salt</b>.</p></div>
      </header>
      <div class="subtabs" role="tablist">${subs}</div>
      ${body}
    </section>`;
  },

  tab_stats() {
    const s = Save.data.stats;
    const kd = s.deaths ? (s.kills / s.deaths).toFixed(2) : s.kills ? s.kills.toFixed(2) : '0.00';
    const tiles = [
      ['Kills', U.fmt(s.kills)], ['Deaths', U.fmt(s.deaths)], ['K/D', kd], ['Headshots', s.kills ? Math.round(s.hs / s.kills * 100) + '%' : '0%'],
      ['Matches', U.fmt(s.matches)], ['Wins', U.fmt(s.wins)], ['Best streak', U.fmt(s.bestStreak)], ['Best match', U.fmt(s.bestMatch) + ' CR'],
      ['Credits earned', U.fmt(s.crEarned)], ['Credits spent', U.fmt(s.crSpent)], ['Salt collected', U.fmt(s.saltEarned)], ['Chat messages', U.fmt(s.chatMsgs)],
      ['Reports against you', U.fmt(s.reports)], ['Rage quits caused', U.fmt(s.ragequits)], ['Peak suspicion', s.peakSus + '%'], ['Time played', fmtDur(s.playTime)],
      ['Solo vs Squad wins', U.fmt((s.modeWins || {}).squad || 0)], ['Clutch series won', U.fmt((s.modeWins || {}).clutch || 0)],
      ['Rounds won', U.fmt(s.roundsWon || 0)], ['Team wins · teammate kills', U.fmt((s.modeWins || {}).tdm || 0) + ' · ' + U.fmt(s.allyKills || 0)],
      ['Favorite gun', (() => { const gk = s.gunKills || {}, id = Object.keys(gk).sort((a, b) => gk[b] - gk[a])[0]; return id ? WEAPON_BY_ID[id].name + ' · ' + U.fmt(gk[id]) : 'none yet'; })()],
      ['Jump-shot kills', U.fmt(s.jumpKills || 0)], ['No-scope kills', U.fmt(s.noScopes || 0)], ['Best style score', U.fmt(s.bestStyle || 0)], ['Top style rank', STYLE_RANKS[s.topStyleRank || 0].name],
      ['Rival cheaters killed', U.fmt(s.rivals || 0)], ['Ban waves', U.fmt(s.waves || 0)], ['Loader parts', U.fmt(Save.data.parts || 0)], ['Pass tier', Extras.passInfo().tier + ' / ' + PASS_TIERS],
      ['Bans', U.fmt(s.bans || 0)], ['Kicked by admins', U.fmt(s.adminKicks || 0)], ['Admins fooled', U.fmt(s.adminsSurvived || 0)], ['Admins bribed', U.fmt(s.bribes || 0)],
      ['Raid bosses down', U.fmt(s.bosses || 0)], ['Bounties claimed', U.fmt(s.bounties || 0)], ['Bots kicked', U.fmt(s.kicks || 0)], ['Contracts done', U.fmt(s.contracts || 0)],
    ].map(t => `<div class="tile"><span>${t[0]}</span><b>${t[1]}</b></div>`).join('');
    const owned = Object.keys(Save.data.owned).filter(k => Save.data.owned[k]).length;
    const lvl = Save.data.smurf || 0, sn = Shop.smurfNeeds(), can = Shop.canSmurf();
    const smurf = `<div class="smurf">
        <div class="smurf-txt">
          <div class="eyebrow">Prestige</div>
          <h3>Make a new account</h3>
          <p>Start over on a fresh account. The lobbies think you are new, so the chat starts chill again. You keep salt, cosmetics and stats, and every kill pays more for good: ×${Shop.smurfMult(lvl + 1).toFixed(2)} credits instead of ×${Shop.smurfMult(lvl).toFixed(2)}.</p>
          <ul class="needs"><li class="${sn.maps ? 'ok' : ''}">Own every lobby</li><li class="${sn.cheats >= sn.need ? 'ok' : ''}">${Math.min(sn.cheats, sn.need)} of ${sn.need} cheats injected</li></ul>
        </div>
        ${this.smurfArmed ? `<div class="row"><span>This wipes credits, cheats, guns and lobbies.</span><button class="btn small danger-btn" data-act="smurf-yes">Start account #${lvl + 2}</button><button class="btn small ghost" data-act="smurf-no">Not yet</button></div>`
          : `<button class="btn ${can ? 'primary' : ''}" data-act="smurf" ${can ? '' : 'disabled'}>New account</button>`}
      </div>`;
    return `<section class="pane stats">
      <header class="pane-head"><div><div class="eyebrow">Career // account #${lvl + 1}</div><h1>Totally legit stats</h1><p class="lede">${owned} of ${UPGRADES.length} cheats injected. Bans received: 0.</p></div></header>
      ${this.rankHtml()}
      <div class="stat-grid">${tiles}</div>
      ${this.achHtml()}
      ${smurf}
      <div class="save-box">
        <h3>Save code</h3>
        <p>Progress saves in this browser automatically. Copy this code to carry it to another browser or device.</p>
        <textarea id="save-out" readonly rows="3">${Save.exportCode()}</textarea>
        <div class="row"><button class="btn small" data-act="copy">Copy code</button></div>
        <label for="save-in" class="lbl">Load a code</label>
        <textarea id="save-in" rows="2" placeholder="Paste a save code here"></textarea>
        <div class="row"><button class="btn small" data-act="import">Load code</button><span class="msg" id="save-msg"></span></div>
        <div class="danger">
          ${this.resetArmed ? `<span>This wipes credits, cheats, guns and cosmetics.</span><button class="btn small danger-btn" data-act="reset-yes">Yes, wipe it</button><button class="btn small ghost" data-act="reset-no">Keep my stuff</button>`
            : `<button class="btn small ghost" data-act="reset">Reset progress</button>`}
        </div>
      </div>
    </section>`;
  },

  passTierOf(kind, id) { for (let i = 1; i <= PASS_TIERS; i++) { const r = passReward(i); if (r.kind === kind && r.id === id) return i; } return '?'; },
  attHtml(w) {
    const D = Save.data, eq = D.att[w.id] || {};
    const slots = ATT_SLOTS.filter(([slot]) => !(slot === 'optic' && w.scope)).map(([slot, label]) => {
      const opts = ATTACHMENTS.filter(a => a.slot === slot).map(a => {
        const own = Shop.attOwned(w.id, a.id), on = eq[slot] === a.id, cr = a.parts * ATT_CR_PER_PART;
        const act = own ? `<button class="btn small ${on ? 'primary' : ''}" data-act="atteq" data-gun="${w.id}" data-att="${a.id}">${on ? 'Equipped' : 'Equip'}</button>`
          : `<button class="btn small ${(D.parts || 0) >= a.parts ? 'buy' : 'poor'}" data-act="attbuy" data-pay="parts" data-gun="${w.id}" data-att="${a.id}">${a.parts} parts</button><button class="btn small ghost ${D.credits >= cr ? '' : 'poor'}" data-act="attbuy" data-pay="cr" data-gun="${w.id}" data-att="${a.id}">${U.fmt(cr)} CR</button>`;
        return `<div class="att ${on ? 'on' : ''}"><b>${U.esc(a.name)}</b><span>${U.esc(a.desc)}</span><div class="att-act">${act}</div></div>`;
      }).join('');
      return `<div class="att-slot"><h5>${label}</h5><div class="att-opts">${opts}</div></div>`;
    }).join('');
    return `<div class="att-box"><div class="ct-head"><h4>Attachments</h4><span class="msg">${U.fmt(D.parts || 0)} loader parts · drop from rival cheaters</span></div>${slots}</div>`;
  },
  tab_pass() {
    const D = Save.data, pi = Extras.passInfo();
    const cells = [];
    for (let i = 1; i <= PASS_TIERS; i++) {
      const r = passReward(i), got = i <= (D.passClaimed || 0), cur = i === pi.tier + 1;
      const big = r.kind === 'skin' || r.kind === 'xhair' || r.kind === 'killfx';
      cells.push(`<div class="tier ${got ? 'got' : ''} ${cur ? 'cur' : ''} ${big ? 'big' : ''}"><span>${i}</span><b>${U.esc(Extras.passLabel(r))}</b></div>`);
    }
    return `<section class="pane pass">
      <header class="pane-head"><div><div class="eyebrow">Season 1 // free for everyone, because Bandit forgot to add a paywall</div><h1>Bandit Pass</h1>
        <p class="lede">50 tiers. Every ${PASS_XP} XP from matches and contracts unlocks the next one, and rewards land in your account automatically. Every 5th tier is a cosmetic you can't buy in the Locker.</p></div></header>
      <div class="rank-card"><div><div class="eyebrow">Tier ${pi.tier} of ${PASS_TIERS}</div><h3>${pi.tier >= PASS_TIERS ? 'Pass complete' : 'Next: ' + U.esc(Extras.passLabel(passReward(pi.tier + 1)))}</h3></div>
        <div class="rank-bar"><div class="track"><i style="width:${Math.round(pi.frac * 100)}%"></i></div><span>${pi.tier >= PASS_TIERS ? 'All rewards claimed' : pi.into + ' / ' + PASS_XP + ' XP to tier ' + (pi.tier + 1)}</span></div></div>
      <div class="tier-grid">${cells.join('')}</div>
    </section>`;
  },
  showWave(w) {
    const t = w.hit ? `<h2>Ban wave #${w.n}</h2><p>BotGuard went back through old matches and you were in this batch.</p><p><b>−${U.fmt(w.fine)} CR</b>${w.fine ? ' fine' : ' (HWID Spoofer: no fine)'}, and your detection was reset to ${Math.round(AC.det)}%.</p>`
      : w.appealed ? `<h2>Ban wave #${w.n}</h2><p>You were in it, but Appeal Bot filed before anyone noticed. Detection lowered to ${Math.round(AC.det)}% instead.</p>`
      : `<h2>Ban wave #${w.n}</h2><p>BotGuard just banned ${U.fmt(w.banned)} accounts. You were not one of them. Yet.</p><p>Ban waves only hit Monitored accounts or worse. Cool off to get out of range.</p>`;
    this.openModal(`<div class="wave ${w.hit ? 'hit' : ''}"><div class="eyebrow">BotGuard</div>${t}<div class="ov-row"><button class="btn primary" id="wave-ok">${w.hit ? 'Ouch' : 'Phew'}</button></div></div>`,
      m => m.querySelector('#wave-ok').addEventListener('click', () => { SFX.ui(); this.closeModal(); this.render(); }));
    if (w.hit) SFX.die(); else SFX.deny();
  },
  rankHtml() {
    const ri = Extras.rankInfo();
    return `<div class="rank-card"><div><div class="eyebrow">Rank ${ri.r} of ${RANKS.length - 1}</div><h3>${U.esc(ri.name)}</h3></div>
      <div class="rank-bar"><div class="track"><i style="width:${Math.round(ri.frac * 100)}%"></i></div>
      <span>${ri.next ? `${U.fmt(ri.xp - ri.cur)} / ${U.fmt(ri.next - ri.cur)} XP to ${U.esc(RANKS[ri.r + 1])}` : 'Top rank. You own the server now.'}</span></div></div>`;
  },
  achHtml() {
    const A = Save.data.ach || {};
    const n = ACHIEVEMENTS.filter(a => A[a.id]).length;
    const items = ACHIEVEMENTS.map(a => `<div class="ach ${A[a.id] ? 'got' : ''}" title="${U.esc(a.desc)}"><b>${U.esc(a.name)}</b><span>${U.esc(a.desc)}</span><em>${A[a.id] ? 'Unlocked' : '+' + a.salt + ' salt'}</em></div>`).join('');
    return `<div class="ach-box"><div class="ct-head"><span class="eyebrow">Achievements</span><span class="msg">${n} of ${ACHIEVEMENTS.length}</span></div><div class="ach-grid">${items}</div></div>`;
  },

  /* ---------------- events ---------------- */
  onClick(e) {
    const b = e.target.closest('[data-act]');
    if (!b || b.disabled) return;
    const a = b.dataset.act, D = Save.data;
    if (b.tagName === 'INPUT') return;
    SFX.init();
    switch (a) {
      case 'mode': SFX.ui(); D.mode = b.dataset.mode; Save.save(); this.render(); break;
      case 'buymode': {
        const md = MODE_BY_ID[b.dataset.mode];
        if (Shop.buyMode(md.id)) { SFX.buy(); this.toast(`Unlocked ${md.name}`, 'good'); this.render(); }
        else { SFX.deny(); this.toast(`${md.name} costs ${U.fmt(md.cost)} CR`, 'bad'); }
        break;
      }
      case 'modelocked': SFX.deny(); this.toast('Unlock the modes before this one first', 'bad'); break;
      case 'play': SFX.ui(); this.startMatch(b.dataset.map); break;
      case 'attbuy': {
        const a = ATT_BY_ID[b.dataset.att];
        if (Shop.buyAtt(b.dataset.gun, a.id, b.dataset.pay)) { SFX.buy(); this.toast(`${a.name} fitted to the ${WEAPON_BY_ID[b.dataset.gun].name}`, 'good'); this.render(); }
        else { SFX.deny(); this.toast(b.dataset.pay === 'parts' ? 'Not enough loader parts. Kill rival cheaters for more.' : 'Not enough credits yet', 'bad'); }
        break;
      }
      case 'atteq': SFX.ui(); Shop.equipAtt(b.dataset.gun, b.dataset.att); this.render(); break;
      case 'claimdaily': {
        const r = More.claimDaily(+b.dataset.i);
        if (r) { SFX.buy(); this.toast(`Daily job paid: +${U.fmt(r.cr)} CR, +${r.salt} salt`, 'good'); this.render(); }
        break;
      }
      case 'claim': {
        const c = Extras.claim(+b.dataset.i);
        if (c) { SFX.buy(); this.toast(`Contract paid: +${U.fmt(c.cr)} CR, +${c.salt} salt`, 'good'); this.render(); }
        break;
      }
      case 'reroll': {
        if (Extras.reroll(+b.dataset.i)) { SFX.ui(); this.render(); }
        else { SFX.deny(); this.toast('Swapping costs 10 salt', 'bad'); }
        break;
      }
      case 'unlock': {
        if (Shop.buyMap(b.dataset.map)) { SFX.buy(); this.toast(`Unlocked ${MAP_BY_ID[b.dataset.map].name}`, 'good'); this.render(); }
        else { SFX.deny(); this.toast('Not enough credits yet', 'bad'); }
        break;
      }
      case 'mod': SFX.ui(); this.selMod = b.dataset.mod; this.selNode = null; this.render(); break;
      case 'node': {
        SFX.tick();
        this.selNode = b.dataset.up;
        if (Shop.state(this.selNode) === 'locked') this.setQuip(U.pick(BANDIT_QUIPS.locked));
        this.render();
        break;
      }
      case 'buy': this.buyNode(b.dataset.up); break;
      case 'gun': SFX.tick(); this.selWeapon = b.dataset.gun; this.render(); break;
      case 'buygun': {
        if (Shop.buyWeapon(b.dataset.gun)) { SFX.buy(); this.toast(`Bought ${WEAPON_BY_ID[b.dataset.gun].name}`, 'good'); this.render(); }
        else { SFX.deny(); this.toast('Not enough credits yet', 'bad'); }
        break;
      }
      case 'equip': SFX.ui(); D.equipped = b.dataset.gun; Save.save(); this.render(); break;
      case 'applyskin': SFX.ui(); D.skinOf[this.selWeapon || D.equipped] = b.dataset.skin; Save.save(); this.render(); break;
      case 'tab': SFX.ui(); if (b.dataset.tab === 'locker') this.lockerTab = 'skins'; this.setTab(b.dataset.tab); break;
      case 'locker': SFX.ui(); this.lockerTab = b.dataset.sub; this.render(); break;
      case 'lockgun': SFX.tick(); this.selWeapon = b.dataset.gun; this.render(); break;
      case 'buycos': {
        const kind = b.dataset.kind, id = b.dataset.id;
        const it = (kind === 'skin' ? SKINS : kind === 'xhair' ? XHAIRS : KILLFX).find(i => i.id === id);
        if (it && it.pass) { SFX.deny(); this.toast(`Unlocks at Bandit Pass tier ${this.passTierOf(kind, id)}`, 'bad'); break; }
        if (Shop.buyCosmetic(kind, id)) {
          SFX.buy();
          if (kind === 'skin') D.skinOf[this.selWeapon || D.equipped] = id;
          if (kind === 'xhair') D.xhair.style = id;
          if (kind === 'killfx') D.killfx = id;
          Save.save();
          this.toast('Unlocked with salt', 'good');
          this.render();
        } else { SFX.deny(); this.toast('Not enough salt. Make the lobby angrier.', 'bad'); }
        break;
      }
      case 'xstyle': SFX.tick(); D.xhair.style = b.dataset.id; Save.save(); this.render(); break;
      case 'xcolor': SFX.tick(); D.xhair.color = b.dataset.color; Save.save(); this.render(); break;
      case 'usefx': SFX.ui(); D.killfx = b.dataset.id; Save.save(); this.render(); break;
      case 'copy': {
        const ta = document.getElementById('save-out');
        const done = () => { const m = document.getElementById('save-msg'); if (m) m.textContent = 'Copied'; };
        try { navigator.clipboard.writeText(ta.value).then(done, () => { ta.select(); }); } catch (err) { ta.select(); }
        break;
      }
      case 'import': {
        const v = document.getElementById('save-in').value;
        const ok = Save.importCode(v);
        if (ok) { SFX.buy(); this.render(); this.toast('Save loaded', 'good'); }
        else { SFX.deny(); const m = document.getElementById('save-msg'); if (m) m.textContent = 'That code did not load. Check it was copied in full.'; }
        break;
      }
      case 'smurf': SFX.ui(); this.smurfArmed = true; this.render(); break;
      case 'smurf-no': SFX.ui(); this.smurfArmed = false; this.render(); break;
      case 'smurf-yes': {
        this.smurfArmed = false;
        if (Shop.smurf()) { SFX.buy(); this.selWeapon = 'pistol'; this.selNode = null; this.toast(`Account #${Save.data.smurf + 1} created. Nobody suspects a thing.`, 'good'); this.setTab('play'); }
        else { SFX.deny(); this.render(); }
        break;
      }
      case 'reset': SFX.ui(); this.resetArmed = true; this.render(); break;
      case 'reset-no': SFX.ui(); this.resetArmed = false; this.render(); break;
      case 'reset-yes': SFX.deny(); Save.reset(); this.resetArmed = false; this.selWeapon = 'pistol'; this.render(); this.toast('Progress wiped. Fresh account.', ''); break;
      default: break;
    }
  },
  onInput(e) {
    const t = e.target, a = t.dataset && t.dataset.act, D = Save.data;
    if (!a) return;
    if (a === 'toggle' && e.type === 'change') {
      if (t.checked) delete D.off[t.dataset.mod]; else D.off[t.dataset.mod] = true;
      Shop.compute(); Save.save(); SFX.ui(); this.render();
    } else if (a === 'xnum') {
      D.xhair[t.dataset.key] = parseFloat(t.value);
      const em = t.parentElement.querySelector('em'); if (em) em.textContent = t.value;
      if (e.type === 'change') Save.save();
      this.drawXhairPreview(true);
    } else if (a === 'xbool' && e.type === 'change') {
      D.xhair[t.dataset.key] = t.checked; Save.save(); this.drawXhairPreview(true);
    }
  },
  buyNode(id) {
    const u = UPGRADE_BY_ID[id];
    if (!u) return;
    const st = Shop.state(id);
    if (st === 'owned') return;
    if (st === 'locked') { SFX.deny(); this.setQuip(U.pick(BANDIT_QUIPS.locked)); return; }
    if (Save.data.credits < u.cost) { SFX.deny(); this.setQuip(U.pick(BANDIT_QUIPS.broke)); this.toast(`Need ${U.fmt(u.cost - Save.data.credits)} more CR`, 'bad'); return; }
    if (Shop.buy(id)) {
      SFX.buy();
      this.quip = U.pick(BANDIT_QUIPS.bought);
      const next = UPGRADES.find(n => n.mod === u.mod && Shop.state(n.id) === 'available');
      this.selNode = next ? next.id : id;
      this.render();
      const n = this.el.main.querySelector(`[data-up="${id}"]`);
      if (n) n.classList.add('just');
      this.toast(`Injected: ${u.name}`, 'good');
    }
  },
  startMatch(id) {
    if (!Save.data.maps[id]) return;
    Save.data.flags.intro = true;
    Match.start(id);
  },
  drawXhairPreview(force) {
    const cv = document.getElementById('xh-prev');
    if (!cv) return;
    const c = cv.getContext('2d'), w = cv.width, h = cv.height;
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#6f8fbf'); g.addColorStop(0.55, '#b9c6d8'); g.addColorStop(0.56, '#7b8494'); g.addColorStop(1, '#5d6573');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = '#c9ced8'; c.fillRect(w * 0.62, h * 0.18, w * 0.3, h * 0.5);
    c.fillStyle = '#d9822b'; c.fillRect(w * 0.08, h * 0.42, w * 0.22, h * 0.24);
    drawCrosshair(c, w / 2, h / 2, Save.data.xhair, 1.4);
  },

  /* ---------------- modals ---------------- */
  openModal(html, onReady) {
    const m = this.el.modal;
    m.innerHTML = `<div class="modal-card" role="dialog" aria-modal="true">${html}</div>`;
    m.hidden = false;
    m.onclick = e => { if (e.target === m) this.closeModal(); };
    if (onReady) onReady(m);
  },
  closeModal() {
    const m = this.el.modal;
    if (m.hidden) return;
    m.hidden = true; m.innerHTML = '';
    if (Game.mode === 'match' && Match.paused) HUD.setOverlay('pause');
  },
  openIntro() {
    Save.data.flags.intro = true;
    Save.save();
    this.openModal(`
      <div class="intro">
        ${RACCOON_SVG}
        <div>
          <div class="eyebrow">incoming message · BANDIT</div>
          <h2>psst. hey. you.</h2>
          <p>You can't aim. That's fine, nobody really can. Go win a few matches on the BOTCAMP servers and bring me the credits. I'll sort you out.</p>
          <p>One catch: the servers run BotGuard now. Every cheat you inject makes noise, and if the chat reports you enough, an admin logs in to watch. Get caught and you lose the match's credits. Buy quiet, play smart.</p>
          <button class="btn primary big" id="intro-ok">Sounds totally legit</button>
        </div>
      </div>`, m => {
      m.querySelector('#intro-ok').addEventListener('click', () => { SFX.init(); SFX.ui(); Save.data.flags.intro = true; Save.save(); this.closeModal(); });
    });
  },
  openSettings() {
    const s = Save.data.settings;
    this.openModal(`
      <div class="settings">
        <div class="eyebrow">Settings</div>
        <h2>Settings</h2>
        <label class="field"><span>Player name</span><input id="set-name" type="text" maxlength="20" value="${U.esc(s.name)}"></label>
        <label class="rng"><span>Mouse sensitivity</span><input id="set-sens" type="range" min="0.2" max="3" step="0.05" value="${s.sens}"><em>${s.sens.toFixed(2)}</em></label>
        <label class="rng"><span>Field of view</span><input id="set-fov" type="range" min="60" max="100" step="1" value="${s.fov}"><em>${s.fov}°</em></label>
        <label class="rng"><span>Volume</span><input id="set-vol" type="range" min="0" max="1" step="0.05" value="${s.vol}"><em>${Math.round(s.vol * 100)}%</em></label>
        <label class="rng"><span>Render scale</span><input id="set-q" type="range" min="0.5" max="1" step="0.05" value="${s.quality}"><em>${Math.round(s.quality * 100)}%</em></label>
        <div class="togs">
          <label class="tog"><input type="checkbox" id="set-dmg" ${s.dmgNums ? 'checked' : ''}> Damage numbers</label>
          <label class="tog"><input type="checkbox" id="set-shake" ${s.shake ? 'checked' : ''}> Screen shake</label>
          <label class="tog"><input type="checkbox" id="set-fps" ${s.fps ? 'checked' : ''}> Show FPS</label>
          <label class="tog"><input type="checkbox" id="set-inv" ${s.invert ? 'checked' : ''}> Invert mouse Y</label>
          <label class="tog"><input type="checkbox" id="set-auto" ${Save.data.flags.autoQueue ? 'checked' : ''}> Auto-queue while AFK farming</label>
        </div>
        <div class="ov-row"><button class="btn primary" id="set-done">Done</button></div>
      </div>`, m => {
      const bind = (id, fn) => { const el = m.querySelector(id); el.addEventListener('input', () => fn(el)); el.addEventListener('change', () => { fn(el); Save.save(); }); };
      const em = el => el.parentElement.querySelector('em');
      bind('#set-name', el => { s.name = el.value.trim().slice(0, 20) || 'legit_player'; });
      bind('#set-sens', el => { s.sens = parseFloat(el.value); em(el).textContent = s.sens.toFixed(2); });
      bind('#set-fov', el => { s.fov = parseInt(el.value, 10); em(el).textContent = s.fov + '°'; });
      bind('#set-vol', el => { s.vol = parseFloat(el.value); em(el).textContent = Math.round(s.vol * 100) + '%'; SFX.setVol(s.vol); });
      bind('#set-q', el => { s.quality = parseFloat(el.value); em(el).textContent = Math.round(s.quality * 100) + '%'; GFX.quality = s.quality; });
      bind('#set-dmg', el => { s.dmgNums = el.checked; });
      bind('#set-shake', el => { s.shake = el.checked; });
      bind('#set-fps', el => { s.fps = el.checked; });
      bind('#set-inv', el => { s.invert = el.checked; });
      bind('#set-auto', el => { Save.data.flags.autoQueue = el.checked; });
      m.querySelector('#set-done').addEventListener('click', () => { SFX.ui(); Save.save(); this.closeModal(); });
    });
  },
};

function fmtDur(s) {
  s = Math.floor(s || 0);
  const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60);
  return h ? `${h}h ${m}m` : `${m}m ${s % 60}s`;
}
