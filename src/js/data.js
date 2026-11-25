'use strict';
/* =========================================================================
   TOTALLY LEGIT — game data: weapons, cheats, maps, cosmetics, chat
   ========================================================================= */

/* ---------------- weapons ---------------- */
const WEAPONS = [
  { id: 'pistol', name: 'Peashooter', kind: 'Pistol', cost: 0, dmg: 34, head: 3, rate: 0.17, mag: 8, reload: 1.2,
    spread: 0.022, auto: false, pellets: 1, recoil: 0.03, range: 160, snd: 'pistol', vm: [0.19, -0.2, -0.5],
    desc: 'Starter sidearm. Perfectly fine, if you could aim.' },
  { id: 'smg', name: 'Leafblower', kind: 'SMG', cost: 600, dmg: 14, head: 2.5, rate: 0.072, mag: 32, reload: 1.7,
    spread: 0.04, auto: true, pellets: 1, recoil: 0.011, range: 120, snd: 'smg', vm: [0.2, -0.23, -0.56],
    desc: 'Sprays a lot. Hits a little. Until you buy the right things.' },
  { id: 'shotgun', name: 'Barn Door', kind: 'Shotgun', cost: 1500, dmg: 12, head: 1.5, rate: 0.85, mag: 6, reload: 2.0,
    spread: 0.085, auto: false, pellets: 9, recoil: 0.09, range: 60, snd: 'shotgun', vm: [0.2, -0.24, -0.6],
    desc: 'Named after the one thing you could hit before.' },
  { id: 'rifle', name: "Ol' Reliable", kind: 'Rifle', cost: 5000, dmg: 31, head: 3, rate: 0.1, mag: 26, reload: 1.9,
    spread: 0.02, auto: true, pellets: 1, recoil: 0.02, range: 200, snd: 'rifle', vm: [0.2, -0.24, -0.62],
    desc: 'Full-auto workhorse. Pairs beautifully with No Recoil.' },
  { id: 'sniper', name: 'LDR-50', kind: 'Sniper', cost: 15000, dmg: 115, head: 2.5, rate: 1.1, mag: 5, reload: 2.4,
    spread: 0.07, scopeSpread: 0, auto: false, pellets: 1, recoil: 0.11, range: 300, snd: 'sniper', scope: true, vm: [0.2, -0.24, -0.6],
    desc: 'Long distance relationship. Right-click to scope.' },
  { id: 'rail', name: 'Unplugged', kind: 'Railgun', cost: 250000, dmg: 220, head: 2, rate: 0.7, mag: 4, reload: 2.0,
    spread: 0.004, auto: false, pellets: 1, recoil: 0.07, range: 400, snd: 'rail', pierceAll: true, vm: [0.2, -0.24, -0.6],
    desc: 'Goes through walls, bots, and the terms of service. It is not plugged in.' },
];
const WEAPON_BY_ID = Object.fromEntries(WEAPONS.map(w => [w.id, w]));

/* ---------------- cheat modules + upgrade trees ---------------- */
const MODULES = [
  { id: 'aim', name: 'LOCK-ON', kind: 'Aimbot', color: '#ff6b6b', glyph: 'aim', blurb: 'Your crosshair finds heads so you do not have to.' },
  { id: 'esp', name: 'X-RAY', kind: 'Wallhack', color: '#43d9ff', glyph: 'eye', blurb: 'Walls are more of a suggestion.' },
  { id: 'trg', name: 'TRIGGER HAPPY', kind: 'Triggerbot', color: '#ffd23f', glyph: 'bolt', blurb: 'Clicking is for people with free time.' },
  { id: 'hb', name: 'BIGHEAD', kind: 'Hitbox expander', color: '#ff9f43', glyph: 'head', blurb: 'Same aim. Bigger targets.' },
  { id: 'st', name: 'STEADY', kind: 'No spread / recoil', color: '#a3e635', glyph: 'level', blurb: 'Hands of a surgeon. Bought, not earned.' },
  { id: 'mv', name: 'ZOOMIES', kind: 'Speedhack', color: '#5eead4', glyph: 'speed', blurb: 'Legs are a subscription now.' },
  { id: 'am', name: 'BOTTOMLESS', kind: 'Ammo & bullets', color: '#c084fc', glyph: 'inf', blurb: 'Bullets that do what you meant.' },
  { id: 'pa', name: 'PLOT ARMOR', kind: 'Godmode', color: '#7aa2ff', glyph: 'shield', blurb: 'The main character never dies in act one.' },
  { id: 'mn', name: 'MONEY GLITCH', kind: 'Credit hacks', color: '#4ade80', glyph: 'coin', blurb: 'Make the number go up faster.' },
  { id: 'lg', name: 'LAG SWITCH', kind: 'Server tricks', color: '#f472b6', glyph: 'wifi', blurb: 'Their ping is your problem no longer.' },
];
const MODULE_BY_ID = Object.fromEntries(MODULES.map(m => [m.id, m]));

const UPGRADES = [
  // LOCK-ON
  { id: 'aim1', mod: 'aim', x: 1, y: 0, cost: 90, name: 'Soft Lock', desc: 'While you hold fire, your aim drifts toward bots near your crosshair.' },
  { id: 'aim2', mod: 'aim', x: 0, y: 1, cost: 400, req: ['aim1'], name: 'Sticky Aim', desc: 'The pull gets about three times stronger.' },
  { id: 'aim3', mod: 'aim', x: 2, y: 1, cost: 650, req: ['aim1'], name: 'Wide Net', desc: 'Lock-on cone grows from 7° to 18°.' },
  { id: 'aim4', mod: 'aim', x: 0, y: 2, cost: 2400, req: ['aim2'], name: 'Head Hunter', desc: 'Locks onto heads instead of chests.' },
  { id: 'aim5', mod: 'aim', x: 2, y: 2, cost: 3500, req: ['aim3'], name: 'Always On', desc: 'Tracks bots even when you are not firing.' },
  { id: 'aim6', mod: 'aim', x: 0, y: 3, cost: 14000, req: ['aim4'], name: 'Snap', desc: 'Instant lock. Zero travel time. Chat will notice.' },
  { id: 'aim7', mod: 'aim', x: 2, y: 3, cost: 45000, req: ['aim5'], name: 'Silent Aim', desc: 'Any shot fired while a bot is in your cone hits that bot.' },
  { id: 'aim8', mod: 'aim', x: 1, y: 4, cost: 160000, req: ['aim6', 'aim7'], name: 'Spinbot', desc: '360° lock-on cone. You will spin. They will see it.' },
  // X-RAY
  { id: 'esp1', mod: 'esp', x: 1, y: 0, cost: 150, name: 'Chams', desc: 'Every bot glows through walls.' },
  { id: 'esp2', mod: 'esp', x: 0, y: 1, cost: 450, req: ['esp1'], name: 'Boxes', desc: 'Draws a box around every bot on your screen.' },
  { id: 'esp3', mod: 'esp', x: 2, y: 1, cost: 700, req: ['esp1'], name: 'Name Tags', desc: 'Names, distance, and live chat bubbles over each bot.' },
  { id: 'esp4', mod: 'esp', x: 0, y: 2, cost: 1500, req: ['esp2'], name: 'Health Bars', desc: 'See exactly how many shots each bot has left.' },
  { id: 'esp5', mod: 'esp', x: 2, y: 2, cost: 2800, req: ['esp3'], name: 'Snaplines', desc: 'Lines from your screen to every bot in the lobby.' },
  { id: 'esp6', mod: 'esp', x: 1, y: 3, cost: 6500, req: ['esp4', 'esp5'], name: 'Radar', desc: 'A minimap with every bot on it.' },
  { id: 'esp7', mod: 'esp', x: 1, y: 4, cost: 22000, req: ['esp6'], name: 'Ambush Pay', desc: '+60% credits for bots that never saw you coming.' },
  // TRIGGER HAPPY
  { id: 'trg1', mod: 'trg', x: 1, y: 0, cost: 220, name: 'Auto Click', desc: 'Fires by itself when your crosshair is on a bot. 0.25s reaction.' },
  { id: 'trg2', mod: 'trg', x: 0, y: 1, cost: 1000, req: ['trg1'], name: 'Quick Draw', desc: 'Reaction time drops to 0.08s.' },
  { id: 'trg3', mod: 'trg', x: 2, y: 1, cost: 1800, req: ['trg1'], name: 'Full Auto', desc: 'Every gun fires full-auto while you hold the trigger. +15% fire rate.' },
  { id: 'trg4', mod: 'trg', x: 0, y: 2, cost: 6000, req: ['trg2'], name: 'Zero Delay', desc: 'No reaction time at all.' },
  { id: 'trg5', mod: 'trg', x: 2, y: 2, cost: 5000, req: ['trg3'], name: 'Tactical Reload', desc: 'Reloads in the background whenever no bot is in sight.' },
  { id: 'trg6', mod: 'trg', x: 1, y: 3, cost: 38000, req: ['trg4'], name: 'Double Tap', desc: 'Every shot fires two bullets.' },
  // BIGHEAD
  { id: 'hb1', mod: 'hb', x: 1, y: 0, cost: 40, name: 'Swollen', desc: 'Bot hitboxes +50%. Your aim stays the same.' },
  { id: 'hb2', mod: 'hb', x: 0, y: 1, cost: 300, req: ['hb1'], name: 'Inflated', desc: 'Bot hitboxes are twice their size.' },
  { id: 'hb3', mod: 'hb', x: 2, y: 1, cost: 900, req: ['hb1'], name: 'Melon Mode', desc: 'Bot heads grow to 2.2× size. Visibly.' },
  { id: 'hb4', mod: 'hb', x: 0, y: 2, cost: 8000, req: ['hb2'], name: 'All Head', desc: 'Every hit counts as a headshot.' },
  { id: 'hb5', mod: 'hb', x: 1, y: 3, cost: 60000, req: ['hb3', 'hb4'], name: 'Planetary', desc: 'Hitboxes ×3.5. Heads the size of hatchbacks.' },
  // STEADY
  { id: 'st1', mod: 'st', x: 1, y: 0, cost: 60, name: 'Decaf', desc: 'Crosshair wobble −60%, bullet spread −25%.' },
  { id: 'st2', mod: 'st', x: 0, y: 1, cost: 450, req: ['st1'], name: 'No Recoil', desc: 'Your gun stops kicking.' },
  { id: 'st3', mod: 'st', x: 2, y: 1, cost: 2000, req: ['st1'], name: 'Laser Pointer', desc: 'Zero spread, zero wobble. Bullets go exactly where you point.' },
  { id: 'st4', mod: 'st', x: 0, y: 2, cost: 3800, req: ['st2'], name: 'Fast Fingers', desc: 'Fire rate +35%.' },
  { id: 'st5', mod: 'st', x: 1, y: 3, cost: 32000, req: ['st4', 'st3'], name: 'Overclock', desc: 'Fire rate ×1.8 on top of everything else.' },
  // ZOOMIES
  { id: 'mv1', mod: 'mv', x: 1, y: 0, cost: 250, name: 'Energy Drink', desc: 'Move 30% faster.' },
  { id: 'mv2', mod: 'mv', x: 0, y: 1, cost: 1200, req: ['mv1'], name: 'Bunny Hop', desc: 'Hold Space to chain hops. Every hop adds speed.' },
  { id: 'mv3', mod: 'mv', x: 2, y: 1, cost: 1600, req: ['mv1'], name: 'Double Jump', desc: 'Jump again in mid-air.' },
  { id: 'mv4', mod: 'mv', x: 0, y: 2, cost: 6500, req: ['mv2'], name: 'Second Can', desc: 'Move 75% faster.' },
  { id: 'mv5', mod: 'mv', x: 2, y: 2, cost: 22000, req: ['mv3'], name: 'Blink', desc: 'Press E to teleport behind the bot you are aiming at.' },
  { id: 'mv6', mod: 'mv', x: 1, y: 3, cost: 110000, req: ['mv4', 'mv5'], name: 'Ludicrous', desc: 'Move 150% faster. Physics is a suggestion.' },
  // BOTTOMLESS
  { id: 'am1', mod: 'am', x: 1, y: 0, cost: 120, name: 'Extended Mag', desc: 'Magazines hold 50% more.' },
  { id: 'am2', mod: 'am', x: 0, y: 1, cost: 500, req: ['am1'], name: 'Speed Loader', desc: 'Reload twice as fast.' },
  { id: 'am3', mod: 'am', x: 2, y: 1, cost: 2600, req: ['am1'], name: 'Pierce', desc: 'Bullets pass through bots and keep going.' },
  { id: 'am4', mod: 'am', x: 0, y: 2, cost: 6000, req: ['am2'], name: 'Bottomless', desc: 'Never reload again.' },
  { id: 'am5', mod: 'am', x: 2, y: 2, cost: 14000, req: ['am3'], name: 'Wallbang', desc: 'Bullets go through walls. Lock-on and Trigger Happy work through walls too.' },
  { id: 'am6', mod: 'am', x: 0, y: 3, cost: 85000, req: ['am4'], name: 'Party Popper', desc: 'Kills burst into confetti that deals 150 damage within 5 m.' },
  { id: 'am7', mod: 'am', x: 2, y: 3, cost: 50000, req: ['am5'], name: 'Magic Bullet', desc: 'Shots that miss by under 12° curve into the nearest head.' },
  // PLOT ARMOR
  { id: 'pa1', mod: 'pa', x: 1, y: 0, cost: 200, name: 'Thick Skin', desc: 'Take 30% less damage.' },
  { id: 'pa2', mod: 'pa', x: 0, y: 1, cost: 800, req: ['pa1'], name: 'Regen', desc: 'Heal 12 HP per second after 3 seconds without getting hit.' },
  { id: 'pa3', mod: 'pa', x: 2, y: 1, cost: 3500, req: ['pa1'], name: 'Kevlar Pajamas', desc: 'Take 65% less damage.' },
  { id: 'pa4', mod: 'pa', x: 0, y: 2, cost: 13000, req: ['pa2'], name: 'Return to Sender', desc: 'Anyone who shoots you takes double that damage right back.' },
  { id: 'pa5', mod: 'pa', x: 2, y: 2, cost: 18000, req: ['pa3'], name: 'Ghost', desc: 'Bots only notice you within 8 m, or after you shoot them.' },
  { id: 'pa6', mod: 'pa', x: 1, y: 3, cost: 95000, req: ['pa4', 'pa5'], name: 'Main Character', desc: 'You cannot die. HP stops at 1.' },
  // MONEY GLITCH
  { id: 'mn1', mod: 'mn', x: 1, y: 0, cost: 300, name: 'Rounding Error', desc: '+25% credits from every kill.' },
  { id: 'mn2', mod: 'mn', x: 0, y: 1, cost: 1100, req: ['mn1'], name: 'Headshot Tax', desc: 'Headshot kills pay 50% more.' },
  { id: 'mn3', mod: 'mn', x: 2, y: 1, cost: 2400, req: ['mn1'], name: 'Compound Interest', desc: 'Each kill in a streak pays 10% more, up to +200%.' },
  { id: 'mn4', mod: 'mn', x: 0, y: 2, cost: 5000, req: ['mn2'], name: 'Overtime', desc: 'Matches last 30 seconds longer.' },
  { id: 'mn5', mod: 'mn', x: 2, y: 2, cost: 7500, req: ['mn3'], name: 'Salt Mine', desc: 'Angry chat drops twice the salt.' },
  { id: 'mn6', mod: 'mn', x: 0, y: 3, cost: 48000, req: ['mn4'], name: 'Decimal Shift', desc: 'All credits ×2.' },
  { id: 'mn7', mod: 'mn', x: 2, y: 3, cost: 30000, req: ['mn5'], name: 'AFK Farm', desc: 'Press F and the cheat plays for you. Matches queue up on their own.' },
  { id: 'mn8', mod: 'mn', x: 1, y: 4, cost: 280000, req: ['mn6', 'mn7'], name: 'Money Printer', desc: 'All credits ×3 on top of everything else.' },
  // LAG SWITCH
  { id: 'lg1', mod: 'lg', x: 1, y: 0, cost: 180, name: 'Packet Loss', desc: 'Bots aim 35% worse.' },
  { id: 'lg2', mod: 'lg', x: 0, y: 1, cost: 700, req: ['lg1'], name: 'Rubber Band', desc: 'Bots move 35% slower.' },
  { id: 'lg3', mod: 'lg', x: 2, y: 1, cost: 2800, req: ['lg1'], name: 'Bot Spam', desc: '+2 bots in every lobby. More bots, more credits.' },
  { id: 'lg4', mod: 'lg', x: 0, y: 2, cost: 9000, req: ['lg2'], name: 'Freeze Frame', desc: 'Press Q to freeze every bot for 4 seconds. 18 s cooldown.' },
  { id: 'lg5', mod: 'lg', x: 2, y: 2, cost: 24000, req: ['lg3'], name: 'Server Flood', desc: '+4 more bots in every lobby.' },
  { id: 'lg6', mod: 'lg', x: 2, y: 3, cost: 42000, req: ['lg5'], name: 'Magnet', desc: 'Bots respawn near you and come straight at you.' },
  { id: 'lg7', mod: 'lg', x: 0, y: 3, cost: 75000, req: ['lg4'], name: 'Desync', desc: 'Bot bullets almost never connect.' },
];
const UPGRADE_BY_ID = Object.fromEntries(UPGRADES.map(u => [u.id, u]));

/* ---------------- cosmetics (bought with salt) ---------------- */
const SKINS = [
  { id: 'factory', name: 'Factory Grey', cost: 0, c0: '#5d6573', c1: '#2a2f38', pat: 0, spec: 0.35 },
  { id: 'midnight', name: 'Midnight', cost: 15, c0: '#1f2a4a', c1: '#0d1224', pat: 0, spec: 0.7 },
  { id: 'bubblegum', name: 'Bubblegum', cost: 25, c0: '#ff7eb6', c1: '#ffe0ef', pat: 0, spec: 0.4 },
  { id: 'hazmat', name: 'Hazmat', cost: 40, c0: '#d4f23c', c1: '#1e1f1a', pat: 3, spec: 0.3 },
  { id: 'arctic', name: 'Arctic Camo', cost: 60, c0: '#e4ecf2', c1: '#8fa5b8', pat: 4, spec: 0.2 },
  { id: 'jungle', name: 'Jungle Camo', cost: 60, c0: '#6b8a3f', c1: '#283419', pat: 4, spec: 0.2 },
  { id: 'tiger', name: 'Tiger', cost: 90, c0: '#f0892a', c1: '#17130f', pat: 3, spec: 0.3 },
  { id: 'carbon', name: 'Carbon', cost: 120, c0: '#30343c', c1: '#15171b', pat: 7, spec: 0.9 },
  { id: 'deepsea', name: 'Deep Sea', cost: 160, c0: '#0f6e8c', c1: '#06283a', pat: 4, spec: 0.8 },
  { id: 'gold', name: '24 Karat', cost: 400, c0: '#e9b824', c1: '#8f6510', pat: 0, spec: 1.4 },
  { id: 'rgb', name: 'Gamer RGB', cost: 600, c0: '#ffffff', c1: '#222222', pat: 5, spec: 0.6 },
  { id: 'glitch', name: 'Glitch', cost: 900, c0: '#9b5cff', c1: '#00e5ff', pat: 6, spec: 0.3 },
  { id: 'salt', name: 'Pure Salt', cost: 1500, c0: '#f4f7fb', c1: '#c8dbef', pat: 13, spec: 1.2 },
];
const SKIN_BY_ID = Object.fromEntries(SKINS.map(s => [s.id, s]));

const XHAIRS = [
  { id: 'cross', name: 'Classic', cost: 0 },
  { id: 'dot', name: 'Dot', cost: 0 },
  { id: 'circle', name: 'Ring', cost: 20 },
  { id: 'tee', name: 'T-Bar', cost: 20 },
  { id: 'x', name: 'Saltire', cost: 35 },
  { id: 'chevron', name: 'Chevron', cost: 45 },
  { id: 'square', name: 'Box', cost: 45 },
  { id: 'smile', name: 'Have A Nice Day', cost: 90 },
  { id: 'reticle', name: 'Range Finder', cost: 140 },
  { id: 'paw', name: 'Bandit Paw', cost: 300 },
];
const XHAIR_COLORS = ['#7cffb2', '#4df0ff', '#ffffff', '#ffe24d', '#ff5ccf', '#ff4d4d', '#9d7bff', '#ff9a3c'];

const KILLFX = [
  { id: 'scrap', name: 'Scrap Metal', cost: 0, desc: 'Bots fall apart. Classic.' },
  { id: 'confetti', name: 'Confetti', cost: 60, desc: 'Every kill is a party.' },
  { id: 'pixels', name: 'Deleted', cost: 110, desc: 'Bots dissolve into glowing pixels.' },
  { id: 'coins', name: 'Jackpot', cost: 220, desc: 'Bots burst into a shower of gold.' },
  { id: 'fireworks', name: 'Fireworks', cost: 420, desc: 'Sparks fly straight up. Very subtle.' },
];

/* ---------------- maps ---------------- */
function genColosseum() {
  const N = 26, c = (N - 1) / 2, g = [];
  for (let r = 0; r < N; r++) {
    const row = [];
    for (let q = 0; q < N; q++) row.push(Math.hypot(q - c, r - c) > 11.6 ? '#' : '.');
    g.push(row);
  }
  const put = (rad, ang, ch) => {
    const q = Math.round(c + Math.cos(ang) * rad), r = Math.round(c + Math.sin(ang) * rad);
    if (g[r] && g[r][q] === '.') g[r][q] = ch;
  };
  for (let i = 0; i < 12; i++) put(8.3, i / 12 * TAU, 'p');
  for (let i = 0; i < 6; i++) put(4.9, i / 6 * TAU + 0.26, i % 2 ? 'C' : 'c');
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + 0.39; put(10.2, a, 'h'); put(10.2, a + 0.09, 'h'); }
  g[12][12] = g[12][13] = g[13][12] = g[13][13] = 'C';
  for (let i = 0; i < 10; i++) put(9.9, i / 10 * TAU + 0.2, 'S');
  for (let i = 0; i < 6; i++) put(6.6, i / 6 * TAU, 'S');
  put(10.4, Math.PI / 2 + 0.17, 'P');
  return g.map(r => r.join(''));
}

function genMega() {
  const N = 32, g = [];
  for (let r = 0; r < N; r++) g.push(new Array(N).fill('.'));
  for (let i = 0; i < N; i++) { g[0][i] = g[N - 1][i] = g[i][0] = g[i][N - 1] = '#'; }
  const rnd = U.rng(424242);
  const setQ = (q, r, ch) => {
    if (q < 2 || r < 2 || q > 13 || r > 13) return;
    g[r][q] = ch; g[r][N - 1 - q] = ch; g[N - 1 - r][q] = ch; g[N - 1 - r][N - 1 - q] = ch;
  };
  for (let i = 0; i < 20; i++) {
    const q = 2 + Math.floor(rnd() * 12), r = 2 + Math.floor(rnd() * 12), t = rnd();
    if (t < 0.32) { setQ(q, r, 'C'); if (rnd() < 0.5) setQ(q + 1, r, 'C'); else setQ(q, r + 1, 'C'); }
    else if (t < 0.58) { const len = 2 + Math.floor(rnd() * 2), hz = rnd() < 0.5; for (let k = 0; k < len; k++) setQ(hz ? q + k : q, hz ? r : r + k, 'h'); }
    else if (t < 0.8) setQ(q, r, 'p');
    else setQ(q, r, 'c');
  }
  for (let i = 1; i < N - 1; i++) { g[15][i] = g[16][i] = '.'; g[i][15] = g[i][16] = '.'; }
  [[12, 12], [12, 19], [19, 12], [19, 19]].forEach(([q, r]) => { g[r][q] = 'p'; });
  const spawns = [[1, 1], [30, 1], [1, 30], [30, 30], [15, 1], [16, 30], [1, 16], [30, 15], [8, 8], [23, 8], [8, 23], [23, 23], [15, 15], [16, 16], [1, 8], [30, 23], [8, 1], [23, 30]];
  spawns.forEach(([q, r]) => { g[r][q] = 'S'; });
  g[28][16] = 'P';
  return g.map(r => r.join(''));
}

const MAPS = [
  {
    id: 'closet', name: 'The Closet', mode: '1v1', blurb: 'A tiny aim room. One bot. Zero excuses.',
    bots: 1, cr: 10, time: 60, unlock: 0, wallH: 4.2,
    bot: { dmg: 7, acc: 0.16, react: 0.95, fire: 0.62, speed: 3.5 },
    col: { floor: '#7b8494', wall: '#c9ced8', crate: '#d9822b', half: '#9aa0a8', pillar: '#b6bdc9', hedge: '#4d8b46', accent: '#3d7bd9' },
    pat: { floor: 1, wall: 1 },
    env: { zenith: '#3f6fc4', horizon: '#c9def2', sun: [-0.42, -0.82, -0.38], sunCol: '#fff1dc', sky: '#b7cbe6', gnd: '#6d6b66', fog: '#c9def2', fogDen: 0.010, stars: 0, clouds: 0.45 },
    layout: [
      '############',
      '#P....#...S#',
      '#.....#..c.#',
      '#..c.....C.#',
      '#....pp....#',
      '#.C.....c..#',
      '#.c..#.....#',
      '#S...#....S#',
      '############',
    ],
    props: 'closet',
  },
  {
    id: 'yard', name: 'Crate Yard', mode: 'FFA', blurb: 'Shipping crates, sunburnt concrete, three bots.',
    bots: 3, cr: 20, time: 75, unlock: 120, wallH: 4.5,
    bot: { dmg: 8, acc: 0.2, react: 0.8, fire: 0.55, speed: 3.8 },
    col: { floor: '#cbb68c', wall: '#b8a88b', crate: '#a8743f', half: '#9c9a94', pillar: '#c2b59b', hedge: '#4d8b46', accent: '#e05a2b' },
    pat: { floor: 14, wall: 1 },
    env: { zenith: '#3b78d0', horizon: '#f2e2c4', sun: [-0.5, -0.75, 0.3], sunCol: '#ffe9c4', sky: '#c4d4e8', gnd: '#8a7552', fog: '#efe0c4', fogDen: 0.010, stars: 0, clouds: 0.3 },
    layout: [
      '################',
      '#P.....#......S#',
      '#..c...#...C...#',
      '#..C.......cc..#',
      '#......h.......#',
      '#.cc.......C...#',
      '#...C..h.......#',
      '#.......c...h..#',
      '#S..........c..#',
      '#....#..CC.....#',
      '#S...#........S#',
      '################',
    ],
    props: 'yard',
  },
  {
    id: 'court', name: 'Courtyard', mode: 'FFA', blurb: 'Hedges, pillars and a fountain nobody asked for.',
    bots: 5, cr: 35, time: 90, unlock: 700, wallH: 4.8,
    bot: { dmg: 9, acc: 0.24, react: 0.7, fire: 0.5, speed: 4.0 },
    col: { floor: '#d6cfbf', wall: '#d2c2a2', crate: '#9b6b3c', half: '#b7a789', pillar: '#e4dccb', hedge: '#4a8a45', accent: '#c4553a' },
    pat: { floor: 8, wall: 10 },
    env: { zenith: '#4a7fcf', horizon: '#f6d9b8', sun: [0.45, -0.7, -0.45], sunCol: '#ffe2bd', sky: '#c9d6ea', gnd: '#7d725f', fog: '#f1dcc0', fogDen: 0.009, stars: 0, clouds: 0.55 },
    layout: [
      '##################',
      '#S.......#......S#',
      '#..gg....#...gg..#',
      '#..g.............#',
      '#.......p..p.....#',
      '#.c..........c...#',
      '#....###..###....#',
      '#....#......#....#',
      '#.p..#..ff..#..p.#',
      '#................#',
      '#..c.........c...#',
      '#..gg..p..p..gg..#',
      '#S......P.......S#',
      '##################',
    ],
    props: 'court',
  },
  {
    id: 'warehouse', name: 'Warehouse 9', mode: 'FFA', blurb: 'Shelving, containers, flickering lights. Eight bots.',
    bots: 8, cr: 60, time: 90, unlock: 3500, wallH: 6,
    bot: { dmg: 10, acc: 0.28, react: 0.6, fire: 0.46, speed: 4.2 },
    col: { floor: '#6a6e75', wall: '#557394', crate: '#8d6a43', half: '#7d828a', pillar: '#8b9099', hedge: '#4d8b46', accent: '#e8a33d' },
    pat: { floor: 14, wall: 9 },
    env: { zenith: '#1d2a4a', horizon: '#a27b6a', sun: [-0.3, -0.85, 0.4], sunCol: '#ffd7b0', sky: '#7d8aa8', gnd: '#4b4641', fog: '#5d5560', fogDen: 0.016, stars: 0.4, clouds: 0.2 },
    layout: [
      '######################',
      '#S.........#........S#',
      '#..KKKK....#...KKKK..#',
      '#....................#',
      '#..CCCC...cc...CCCC..#',
      '#.........cc.........#',
      '#.h....h........h..h.#',
      '#....................#',
      '###...####..####...###',
      '#....................#',
      '#..KKK..c....c..KKK..#',
      '#.......c....c.......#',
      '#..CCC..........CCC..#',
      '#.....p...pp...p.....#',
      '#S........P.........S#',
      '######################',
    ],
    props: 'warehouse',
  },
  {
    id: 'roofs', name: 'Rooftops', mode: 'FFA', blurb: 'Sunset over the city. Twelve bots, nowhere to hide.',
    bots: 12, cr: 100, time: 105, unlock: 15000, wallH: 2.2,
    bot: { dmg: 11, acc: 0.31, react: 0.55, fire: 0.42, speed: 4.3 },
    col: { floor: '#5b5e68', wall: '#9c5643', crate: '#8e949e', half: '#a45c47', pillar: '#c9c4bb', hedge: '#4d8b46', accent: '#ffb347' },
    pat: { floor: 14, wall: 10 },
    env: { zenith: '#27306e', horizon: '#ff9b6a', sun: [0.62, -0.32, -0.7], sunCol: '#ffb58a', sky: '#8a7fb3', gnd: '#5a4646', fog: '#e88d6d', fogDen: 0.008, stars: 0.15, clouds: 0.6 },
    layout: [
      '######################',
      '#S.....h......h.....S#',
      '#..C...h..c...h..C...#',
      '#......h......h......#',
      '#..c.......C.........#',
      '#hhh..hhhh..hhhh..hhh#',
      '#....................#',
      '#..C....c....c....C..#',
      '#.........pp.........#',
      '#..c..............c..#',
      '#....................#',
      '#hhh..hhhh..hhhh..hhh#',
      '#......h......h......#',
      '#..C...h..c...h..C...#',
      '#......h......h......#',
      '#..c...........c.....#',
      '#S.....h..P...h.....S#',
      '######################',
    ],
    props: 'roofs',
  },
  {
    id: 'colosseum', name: 'Colosseum', mode: 'FFA', blurb: 'A night arena under the stars. Eighteen bots.',
    bots: 18, cr: 160, time: 120, unlock: 60000, wallH: 5,
    bot: { dmg: 12, acc: 0.34, react: 0.5, fire: 0.4, speed: 4.4 },
    col: { floor: '#c6a66c', wall: '#8f897e', crate: '#7a5a3a', half: '#a39b8c', pillar: '#d8d0c0', hedge: '#4d8b46', accent: '#ff8a3d' },
    pat: { floor: 14, wall: 10 },
    env: { zenith: '#070c24', horizon: '#33406e', sun: [-0.3, -0.9, 0.3], sunCol: '#aab8ff', sky: '#4d5a8c', gnd: '#3e3528', fog: '#232b4d', fogDen: 0.012, stars: 1, clouds: 0.15 },
    layout: genColosseum(),
    props: 'colosseum',
  },
  {
    id: 'mega', name: 'Megalobby', mode: 'FFA', blurb: 'Thirty-two bots on a neon grid. Pure chaos.',
    bots: 32, cr: 260, time: 120, unlock: 220000, wallH: 4,
    bot: { dmg: 13, acc: 0.36, react: 0.45, fire: 0.38, speed: 4.6 },
    col: { floor: '#0f1022', wall: '#211640', crate: '#2a1d52', half: '#251a4a', pillar: '#30205e', hedge: '#4d8b46', accent: '#ff3df0' },
    pat: { floor: 12, wall: 16 },
    env: { zenith: '#05020f', horizon: '#4b1366', sun: [0.3, -0.8, -0.5], sunCol: '#c7a6ff', sky: '#5b3b8c', gnd: '#1a0f2e', fog: '#2a0d3d', fogDen: 0.014, stars: 1, clouds: 0 },
    layout: genMega(),
    props: 'mega',
  },
];
const MAP_BY_ID = Object.fromEntries(MAPS.map(m => [m.id, m]));

/* ---------------- names & chat ---------------- */
const BOT_NAMES = [
  'Pixel_Pete', 'xX_Gary_Xx', 'TacticalToaster', 'bot_kevin', 'SweatyPalms', 'AFK_Andy', 'CampingCarl', 'PingSpike',
  'FragileFrank', 'MidLaneMike', 'Respawn_Ronnie', 'BoxMuncher', 'PeekABoo', 'LagMaster3000', 'DadGamer42', 'Mr_Clutch',
  'RageQuitRita', 'Sir_Spams_A_Lot', 'UnitTest_07', 'Rusty_Bolt', 'ServoSteve', 'CPU_Carl', 'Glitchy', 'Wobble',
  'NullPointer', 'DivByZero', 'Byte_Me', 'Clanky', 'Bolts_McGee', 'RoboRita', 'Toaster_Pro', 'MicrowaveMan',
  'tryhard_tina', 'gg_no_re', 'WifiWarrior', 'LowFPS_Larry', 'Strafe_Lord', 'Jumpy', 'Couch_Cmdr', 'SnackBreak',
  'Chill_Bill', 'Sweaty_Sven', 'Velvet_Thunder', 'Pogo', 'KnifeOnly_Ken', 'Unpaid_Intern', 'Recoil_Rick', 'Peanut',
  'Mango', 'Biscuit', 'Captain_Lag', 'Duck_Main', 'Sprocket', 'Gearbox_Gus', 'Firmware_Fay', 'Servo_Sal', 'Tin_Tim',
  'Dial_Up_Dan', 'Bluescreen', 'Ctrl_Z', 'Sudo_Sam', 'Patch_Notes', 'Hotfix', 'Beta_Bob',
];
const PERSONAS = ['chill', 'salty', 'tryhard', 'troll', 'quiet', 'chill', 'salty'];

const CHAT = {
  greet: ['gl hf', 'glhf', 'hi', 'hello', 'yo', 'sup', 'gl', 'o/', 'hey all', 'lets goo', 'ready', 'have fun', 'first game today', 'warming up', 'back again', 'ok lets do this'],
  idle0: ['anyone else lagging?', 'this map again lol', 'my aim is so bad today', 'who keeps camping', 'lol', 'what rank is everyone', 'i should be doing homework', 'need 3 more kills for my daily', 'is this ranked?', 'im so tired', 'who wants to 1v1 after', 'lol i fell off the crate', 'brb in 5', 'nice weather on this map', 'my dog just walked on my keyboard'],
  victim0: ['nice shot', 'ns', 'nice one', 'wp', 'dang', 'ok that was clean', 'you got me', 'ugh', 'lucky', 'ouch', 'unlucky me', 'good aim', 'how', 'gg'],
  taunt: ['ez', 'gotcha', 'lol', 'sorry', 'rip', 'too slow', '1 tap', 'get good', 'nt', 'ha', 'bye', 'that was easy', 'you ok?', 'is that guy afk?'],
  tier1: ['hmm', 'that was weird', 'how did you see me', '?', '??', 'bro is warmed up', 'ok who is this guy', 'bro is cracked', 'lucky or hacking', 'that flick tho', 'kinda sus ngl', 'did he prefire me', 'how did he know', 'ok calm down', 'someone stop this guy'],
  tier2: ['walls?', 'aimbot?', 'bro is walling', '100% walling', 'he knows where everyone is', 'this guy is not legit', 'spectate him', 'he is locking on', 'cheater', 'obvious', 'hacker', 'nice cheats', 'turn it off', 'bro paid for that aim', 'how much did that cost', 'reported btw', 'his crosshair is glued to heads', 'not even trying to hide it'],
  tier3: ['REPORTED', 'reported', 'report him', 'everyone report', 'admin??', 'ADMIN', 'where are the admins', 'vote kick', 'kick him', 'can someone kick this guy', 'i sent a clip', 'enjoy your ban', 'turn off the aimbot bro', 'every single headshot lol', 'report the guy on top', 'HE IS CHEATING', 'mods??', 'i am recording this'],
  tier4: ['IM UNINSTALLING', 'THIS GAME IS DEAD', 'WHY IS THERE NO ANTICHEAT', 'ive reported you 40 times', 'bro im just trying to do my dailies', 'ok i give up', 'alt+f4', 'this isnt even fun for you', 'what is the point', 'congrats you beat bots', 'touch grass', 'BRO', 'AAAAAAAAA', 'unreal', 'i am writing a strongly worded email', 'devs fix your game', 'refund', 'i just bought this game', 'my keyboard is broken now', 'im telling my mom', 'do you feel good about this', 'LITERALLY UNPLAYABLE'],
  wall: ['through the WALL?', 'he shot me through a wall', 'walls confirmed', 'how did that go through', 'wallbang? from there?', 'bro has x-ray'],
  snap: ['that snap lmao', 'his crosshair teleported', 'aimlock', 'bro snapped 180', 'that flick was not human', 'aimbot 100%'],
  spin: ['HE IS SPINNING', 'why is he spinning', 'spinbot lmao', 'bro is a beyblade', 'he shot me without looking'],
  speed: ['speedhack', 'how is he so fast', 'bro is on 5 energy drinks', 'he is zooming', 'nobody moves that fast'],
  freeze: ['LAG??', 'i cant move', 'server is lagging', 'why did everyone freeze', 'bro froze the server', 'ping spike?'],
  blink: ['he TELEPORTED', 'teleport hack', 'he just appeared behind me', 'how is he behind me', 'nothing personal kid'],
  popper: ['why did i explode', 'CONFETTI??', 'what was that', 'he is blowing people up', 'party poppers??'],
  reflect: ['i died shooting HIM', 'how did i die', 'my bullets came back', 'reflect hack??'],
  multi: ['bro got 3 in a second', 'how', 'multikill with that?', 'ok that is not normal'],
  deathCheat: ['finally', 'GOT HIM', 'cheats cant save you', 'who is the bot now', 'killed the cheater', 'first death all game lol'],
  respAdmit: ['HE ADMITTED IT', 'screenshotted', 'lmao he said it', 'admitted it', 'thanks for confirming'],
  respLegit: ['sure buddy', 'yeah right', 'and i am the pope', 'totally legit huh', 'sure you are', 'lol ok'],
  respGG: ['gg', 'gg wp', 'gg i guess', 'no gg from me', 'gg cheater'],
  respEZ: ['bro typed ez', 'ez with cheats', 'REPORTED AGAIN', 'you need help', 'not ez when you pay for it'],
  respSorry: ['apology not accepted', 'then turn it off', 'sure you are', 'sorry wont fix it'],
  respHi: ['hi', 'hey', 'hello', 'yo'],
  respHiSus: ['hello cheater', 'dont talk to me', 'no'],
  respOther: ['what', 'nobody asked', 'ok', '?', 'lol', 'who asked', 'cool story'],
  join: ['hi', 'what did i miss', 'why is everyone mad', 'yo', 'who is the cheater', 'hello'],
  botKill: ['nice', 'got him', 'lol', 'ty'],
};

const SERVER_LINES = [
  'Thanks for your report. An admin will review it shortly.',
  'Report received. Queue position: #{n}.',
  'Report inbox is full. Please try again later.',
  'Admin status: AFK (last seen {d} days ago).',
  'Vote kick failed: needs an admin to confirm.',
  'Anti-cheat module not found. Continuing anyway.',
  'Your report was forwarded to /dev/null.',
];

const BANDIT_QUIPS = {
  idle: [
    "First one's cheap. They're always cheap at first.",
    "Everything here is 100% undetected. There's nothing on those servers to detect it.",
    'Bigger heads, easier hits. That is just science.',
    "Don't tell anyone where you got this.",
    "Refunds? Never heard of 'em.",
    "Chat's mad? Good. Salt sells in the Locker.",
    "The admin's been AFK since the servers went up.",
    "You're doing great, champ. Statistically.",
    "I'm not a raccoon. I'm a small business.",
    'Paid in credits. No questions asked.',
  ],
  broke: ["Come back with more credits. I don't do layaway.", 'Window shopping is free. Everything else costs.'],
  bought: ['Pleasure doing business.', "Injected. Don't ask how.", "Ooh, that one's my favorite.", 'Enjoy. Responsibly. Or not.', 'Another satisfied customer.'],
  locked: ['Buy the one above it first. I have a system.'],
};

const SUS_TIERS = [
  { name: 'CHILL', color: '#7cffb2' },
  { name: 'SUS', color: '#ffe24d' },
  { name: 'SALTY', color: '#ffa53c' },
  { name: 'REPORTING', color: '#ff6a4d' },
  { name: 'MELTDOWN', color: '#ff3d7a' },
];
const SALT_PER_TIER = [0, 1, 2, 4, 7];

/* ---------------- match modes ---------------- */
const MODES = [
  { id: 'ffa', name: 'Free-for-all', tag: 'FFA', blurb: 'Everyone shoots everyone. Bots fight each other too.', pay: 1, win: 5 },
  { id: 'squad', name: 'Solo vs Squad', tag: '1vN', blurb: 'The whole lobby hunts you as one team. They share your position and keep respawning.', pay: 1.5, win: 8, botAcc: 0.85, respawn: 3.4 },
  { id: 'clutch', name: 'Clutch Rounds', tag: 'Rounds', blurb: 'One life per round, no respawns. Wipe the squad to take the round. First to 5.', pay: 1.3, win: 6, botAcc: 0.8, roundBonus: 1.5, rounds: 5, roundTime: 45 },
  { id: 'tdm', name: 'Team Deathmatch', tag: 'TDM', blurb: 'You and bot teammates against a bot team. Every teammate kill pays you a 25% cut.', pay: 1, win: 6, assist: 0.25 },
];
const MODE_BY_ID = Object.fromEntries(MODES.map(m => [m.id, m]));
const TEAM_ACCENTS = {
  red: ['#ff5d5d', '#ff7a45', '#ff4f9a', '#ff9a3c', '#e8455e', '#ffb03a'].map(U.hex),
  blue: ['#4dd4ff', '#5b8cff', '#4dffc8', '#7aa2ff', '#43a8ff', '#8be9ff'].map(U.hex),
};
// how a lobby splits up in each mode: bots on your side, bots against you (extra bots always join the enemy)
function lineup(map, modeId, extraBots) {
  const extra = extraBots || 0;
  if (modeId === 'tdm') {
    const allies = Math.ceil((map.bots + 1) / 2) - 1;
    return { allies, foes: map.bots - allies + extra };
  }
  return { allies: 0, foes: map.bots + extra };
}
function matchupLabel(map, modeId, extraBots) {
  const l = lineup(map, modeId, extraBots);
  if (modeId === 'ffa') return l.foes === 1 ? '1v1' : 'FFA';
  if (modeId === 'tdm') return (l.allies + 1) + 'v' + l.foes;
  return '1v' + l.foes;
}

Object.assign(CHAT, {
  squadGreet: ['{n} on 1 lol', 'lets get him', 'focus the solo guy', 'ez win boys', 'gl solo', 'stick together', 'we got this', 'he is alone lol'],
  squadSpot: ['he is here', 'spotted', 'on me', 'pushing him', 'found him', 'rotate to me', 'he is by the crates', 'follow me'],
  squadLosing: ['HOW IS HE WINNING 1V{n}', 'we have more people', 'he is the final boss', 'bro is solo and winning', 'we need backup', 'all of us vs him and we are losing'],
  lastBot: ['just me left', 'ok 1v1 me', 'i got this', 'where did everyone go', 'help', 'great, its on me again'],
  clutchLost: ['how did he clutch that', 'ACE??', 'he killed all of us', 'that round was not legit', 'we lost to ONE guy'],
  clutchWon: ['ez round', 'got him', 'round is ours', 'nice try solo', 'too easy'],
  teamGreet: ['gl team', 'lets win this', 'stick together blue', 'who is carrying', 'ok team, focus up'],
  allyNice: ['nice', 'carry us', 'this guy is insane', 'stay with him', 'i am following you', 'MVP', 'ok you play, i watch'],
  allySus: ['ngl he might be cheating... but he is on our team', 'report? nah he is carrying', 'i saw nothing', 'he is just good, leave him alone', 'who cares, we are winning'],
  foeTeam: ['their team has a cheater', 'blue has walls', 'switch teams', 'report the guy on blue', 'kick the blue guy'],
});
