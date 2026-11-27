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
  { id: 'revolver', name: 'Hand Cannon', kind: 'Revolver', cost: 3000, dmg: 62, head: 3, rate: 0.42, mag: 6, reload: 2.1,
    spread: 0.016, auto: false, pellets: 1, recoil: 0.085, range: 180, snd: 'revolver', vm: [0.19, -0.2, -0.5],
    desc: 'Six shots. Each one is a strongly worded statement.' },
  { id: 'rifle', name: "Ol' Reliable", kind: 'Rifle', cost: 5000, dmg: 31, head: 3, rate: 0.1, mag: 26, reload: 1.9,
    spread: 0.02, auto: true, pellets: 1, recoil: 0.02, range: 200, snd: 'rifle', vm: [0.2, -0.24, -0.62],
    desc: 'Full-auto workhorse. Pairs beautifully with No Recoil.' },
  { id: 'burst', name: 'Triple Threat', kind: 'Burst rifle', cost: 9000, dmg: 27, head: 3, rate: 0.36, mag: 30, reload: 2.0,
    spread: 0.014, auto: false, pellets: 1, recoil: 0.016, range: 200, snd: 'rifle', burst: 3, burstGap: 0.065, vm: [0.2, -0.24, -0.62],
    desc: 'Three rounds per click. For people who click a lot but hit a little.' },
  { id: 'xbow', name: 'Pointy Stick', kind: 'Crossbow', cost: 7000, dmg: 140, head: 2.5, rate: 1.0, mag: 1, reload: 1.3,
    spread: 0.006, auto: false, pellets: 1, recoil: 0.04, range: 150, snd: 'xbow', silent: true, vm: [0.2, -0.24, -0.58],
    desc: 'One bolt, no bang. Quiet kills raise suspicion and BotGuard detection half as much.' },
  { id: 'sniper', name: 'LDR-50', kind: 'Sniper', cost: 15000, dmg: 115, head: 2.5, rate: 1.1, mag: 5, reload: 2.4,
    spread: 0.07, scopeSpread: 0, auto: false, pellets: 1, recoil: 0.11, range: 300, snd: 'sniper', scope: true, vm: [0.2, -0.24, -0.6],
    desc: 'Long distance relationship. Right-click to scope.' },
  { id: 'lmg', name: 'Lawnmower', kind: 'LMG', cost: 40000, dmg: 22, head: 2.5, rate: 0.068, mag: 100, reload: 4.2,
    spread: 0.05, auto: true, pellets: 1, recoil: 0.013, range: 180, snd: 'lmg', vm: [0.2, -0.25, -0.62],
    desc: 'A hundred rounds and no plan. Hold the button and mow the lawn.' },
  { id: 'minigun', name: 'Hair Dryer', kind: 'Minigun', cost: 90000, dmg: 16, head: 2, rate: 0.04, mag: 200, reload: 5,
    spread: 0.06, auto: true, pellets: 1, recoil: 0.006, range: 160, snd: 'smg', spinUp: 0.6, vm: [0.2, -0.27, -0.6],
    desc: 'Spins up for half a second, then never stops. Hold the trigger and blow-dry the lobby.' },
  { id: 'launcher', name: 'Party Cannon', kind: 'Launcher', cost: 120000, dmg: 60, head: 1.5, rate: 0.9, mag: 4, reload: 2.6,
    spread: 0.008, auto: false, pellets: 1, recoil: 0.12, range: 220, snd: 'launcher', splash: { r: 5, dmg: 170 }, vm: [0.2, -0.24, -0.6],
    desc: 'Fires a gift-wrapped rocket. Five metres of surprise on impact.' },
  { id: 'rail', name: 'Unplugged', kind: 'Railgun', cost: 250000, dmg: 220, head: 2, rate: 0.7, mag: 4, reload: 2.0,
    spread: 0.004, auto: false, pellets: 1, recoil: 0.07, range: 400, snd: 'rail', pierceAll: true, vm: [0.2, -0.24, -0.6],
    desc: 'Goes through walls, bots, and the terms of service. It is not plugged in.' },
];
for (const w of WEAPONS) w.cost *= 2;
// small credit multiplier per gun: pricier guns pay a little more per kill
const WEAPON_PAY = { pistol: 1, smg: 1.05, shotgun: 1.1, revolver: 1.15, rifle: 1.2, burst: 1.2, xbow: 1.3, sniper: 1.25, lmg: 1.3, minigun: 1.3, launcher: 1.35, rail: 1.5 };
for (const w of WEAPONS) w.pay = WEAPON_PAY[w.id] || 1;
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
  { id: 'ks', name: 'KILLSTREAK.EXE', kind: 'Streak rewards', color: '#ff7a3d', glyph: 'star', blurb: 'Kill enough bots in a row and the sky helps out.' },
  { id: 'so', name: 'SOCIAL HACK', kind: 'Chat & lobby tricks', color: '#b8f55a', glyph: 'chat', blurb: 'Why beat the lobby when you can manage it?' },
  { id: 'gs', name: 'GUNSMITH', kind: 'Weapon mods', color: '#e0a15c', glyph: 'wrench', blurb: 'Same guns. Very different bullets.' },
  { id: 'ch', name: 'CHRONO', kind: 'Time tricks', color: '#a78bfa', glyph: 'clock', blurb: 'The server clock is more of a guideline.' },
  { id: 'in', name: 'INSIDER', kind: 'Economy hacks', color: '#facc15', glyph: 'chart', blurb: 'Money that never touches a scoreboard.' },
  { id: 'nd', name: 'BOOMBOX', kind: 'Grenades', color: '#ff6b3d', glyph: 'bomb', blurb: 'Press C. Things go boom. Upgrade the boom.' },
  { id: 'gh', name: 'GHOSTWARE', kind: 'Anti-anticheat', color: '#8fb3ff', glyph: 'ghost', blurb: 'BotGuard cannot ban what it cannot see.', stealth: true },
  { id: 'sp', name: 'SPOOFER', kind: 'Ban protection', color: '#e8e8f0', glyph: 'mask', blurb: 'For when BotGuard sees it anyway.', stealth: true },
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
  { id: 'mn8', mod: 'mn', x: 1, y: 4, cost: 280000, req: ['mn6', 'mn7'], name: 'Money Printer', desc: 'All credits ×2 on top of everything else.' },
  // LAG SWITCH
  { id: 'lg1', mod: 'lg', x: 1, y: 0, cost: 180, name: 'Packet Loss', desc: 'Bots aim 35% worse.' },
  { id: 'lg2', mod: 'lg', x: 0, y: 1, cost: 700, req: ['lg1'], name: 'Rubber Band', desc: 'Bots move 35% slower.' },
  { id: 'lg3', mod: 'lg', x: 2, y: 1, cost: 2800, req: ['lg1'], name: 'Bot Spam', desc: '+2 bots in every lobby. More bots, more credits.' },
  { id: 'lg4', mod: 'lg', x: 0, y: 2, cost: 9000, req: ['lg2'], name: 'Freeze Frame', desc: 'Press Q to freeze every bot for 4 seconds. 18 s cooldown.' },
  { id: 'lg5', mod: 'lg', x: 2, y: 2, cost: 24000, req: ['lg3'], name: 'Server Flood', desc: '+4 more bots in every lobby.' },
  { id: 'lg6', mod: 'lg', x: 2, y: 3, cost: 42000, req: ['lg5'], name: 'Magnet', desc: 'Bots respawn near you and come straight at you.' },
  { id: 'lg7', mod: 'lg', x: 0, y: 3, cost: 75000, req: ['lg4'], name: 'Desync', desc: 'Bot bullets almost never connect.' },
  // KILLSTREAK.EXE
  { id: 'ks1', mod: 'ks', x: 1, y: 0, cost: 1500, name: 'Recon Drone', desc: 'A 3-kill streak launches a drone: every enemy glows and shows on a radar for 12 s.' },
  { id: 'ks2', mod: 'ks', x: 0, y: 1, cost: 4000, req: ['ks1'], name: 'Care Package', desc: 'Every 5 kills in a streak: full health and a crate worth 4 kills of credits.' },
  { id: 'ks3', mod: 'ks', x: 2, y: 1, cost: 8000, req: ['ks1'], name: 'Airstrike', desc: 'Every 8 kills in a streak, jets flatten everything within 9 m of your crosshair.' },
  { id: 'ks4', mod: 'ks', x: 0, y: 2, cost: 18000, req: ['ks2'], name: 'Hardline', desc: 'Dying only halves your streak instead of resetting it.' },
  { id: 'ks5', mod: 'ks', x: 2, y: 2, cost: 55000, req: ['ks3'], name: 'Orbital Laser', desc: 'Press X: a laser from space deletes everything within 6 m of your aim. 20 s cooldown.' },
  { id: 'ks6', mod: 'ks', x: 1, y: 3, cost: 350000, req: ['ks4', 'ks5'], name: 'Ctrl+Alt+Delete', desc: 'A 25-kill streak deletes every enemy in the lobby at once. Each one pays double.' },
  // SOCIAL HACK
  { id: 'so1', mod: 'so', x: 1, y: 0, cost: 600, name: 'Proxy Chain', desc: 'The lobby gets suspicious 35% slower.' },
  { id: 'so2', mod: 'so', x: 0, y: 1, cost: 1800, req: ['so1'], name: 'Salt Harvester', desc: 'Angry chat drops 50% more salt.' },
  { id: 'so3', mod: 'so', x: 2, y: 1, cost: 5000, req: ['so1'], name: 'Fake Admin', desc: 'Press G to kick the angriest enemy from the server. Pays double a kill. 15 s cooldown.' },
  { id: 'so4', mod: 'so', x: 0, y: 2, cost: 9000, req: ['so2'], name: 'Ragebait', desc: 'Lobbies start 40% suspicious, and every rage quit drops 6 salt.' },
  { id: 'so5', mod: 'so', x: 2, y: 2, cost: 20000, req: ['so3'], name: 'Bounty Board', desc: 'One enemy always has a bounty on its head worth 5× a normal kill.' },
  { id: 'so6', mod: 'so', x: 1, y: 3, cost: 120000, req: ['so4', 'so5'], name: 'Clip Farming', desc: 'At the end of a match, every salt you earned also pays 1 kill of credits.' },
  // GUNSMITH
  { id: 'gs1', mod: 'gs', x: 1, y: 0, cost: 500, name: 'Hot Loads', desc: 'Every gun deals 20% more damage.' },
  { id: 'gs2', mod: 'gs', x: 0, y: 1, cost: 2500, req: ['gs1'], name: 'Hollow Points', desc: 'Headshots deal 50% more damage.' },
  { id: 'gs3', mod: 'gs', x: 2, y: 1, cost: 3500, req: ['gs1'], name: 'Vampire Rounds', desc: 'Heal 3 HP for every bullet that hits.' },
  { id: 'gs4', mod: 'gs', x: 0, y: 2, cost: 20000, req: ['gs2'], name: 'Explosive Rounds', desc: 'Every hit pops a 2.5 m blast for 40 damage.' },
  { id: 'gs5', mod: 'gs', x: 2, y: 2, cost: 16000, req: ['gs3'], name: 'Ricochet', desc: 'Shots that hit a wall bounce once toward the nearest bot within 15 m.' },
  { id: 'gs6', mod: 'gs', x: 1, y: 3, cost: 80000, req: ['gs4', 'gs5'], name: 'Chain Lightning', desc: 'Kills arc to the 2 nearest bots for 120 damage each.' },
  // CHRONO
  { id: 'ch1', mod: 'ch', x: 1, y: 0, cost: 700, name: 'Quick Hands', desc: 'Reloads and weapon swaps are 30% faster.' },
  { id: 'ch2', mod: 'ch', x: 0, y: 1, cost: 3000, req: ['ch1'], name: 'Bullet Time', desc: 'Press V: every bot moves and shoots at 30% speed for 5 s. 25 s cooldown.' },
  { id: 'ch3', mod: 'ch', x: 2, y: 1, cost: 12000, req: ['ch1'], name: 'Rewind', desc: 'Once per match, a hit that would kill you rewinds you 3 s instead, at full health.' },
  { id: 'ch4', mod: 'ch', x: 0, y: 2, cost: 15000, req: ['ch2'], name: 'Matrix Mode', desc: 'Bullet Time lasts 8 s and recharges in 15 s.' },
  { id: 'ch5', mod: 'ch', x: 1, y: 3, cost: 60000, req: ['ch3', 'ch4'], name: 'Time Thief', desc: 'Every kill adds 1 s to the match clock, up to 60 s.' },
  // INSIDER
  { id: 'in1', mod: 'in', x: 1, y: 0, cost: 400, name: 'Loot Drops', desc: 'Bots drop credit chips worth half a kill. Walk over them to collect.' },
  { id: 'in2', mod: 'in', x: 0, y: 1, cost: 2000, req: ['in1'], name: 'Magnet Pockets', desc: 'Pick up credit chips from 10 m away.' },
  { id: 'in3', mod: 'in', x: 2, y: 1, cost: 6000, req: ['in1'], name: 'Interest', desc: 'After every match, earn 2% of your wallet (up to 20 kills of that lobby).' },
  { id: 'in4', mod: 'in', x: 0, y: 2, cost: 20000, req: ['in2'], name: 'Sponsor Deal', desc: 'Win bonuses pay triple.' },
  { id: 'in5', mod: 'in', x: 1, y: 3, cost: 70000, req: ['in3', 'in4'], name: 'Insider Trading', desc: 'Contracts pay double.' },
  // GHOSTWARE
  { id: 'gh1', mod: 'gh', x: 1, y: 0, cost: 800, name: 'Signature Scrambler', desc: 'BotGuard scans find 30% less.' },
  { id: 'gh2', mod: 'gh', x: 0, y: 1, cost: 2500, req: ['gh1'], name: 'Humanizer', desc: 'Snaps, spins, wall kills and abilities raise detection 50% less.' },
  { id: 'gh3', mod: 'gh', x: 2, y: 1, cost: 4000, req: ['gh1'], name: 'Kernel Mode', desc: 'BotGuard scans you half as often.' },
  { id: 'gh4', mod: 'gh', x: 0, y: 2, cost: 9000, req: ['gh2'], name: 'Panic Key', desc: 'Press P to unload every cheat at once, and P again to reload. Unloaded cheats cannot be detected.' },
  { id: 'gh5', mod: 'gh', x: 2, y: 2, cost: 12000, req: ['gh3'], name: 'Stream Proof', desc: 'Spectating admins cannot see your overlays, so watching you no longer doubles detection.' },
  { id: 'gh6', mod: 'gh', x: 1, y: 3, cost: 40000, req: ['gh4', 'gh5'], name: 'Polymorphic Build', desc: 'Scans find 40% less again, and detection cools twice as fast after each match.' },
  { id: 'gh7', mod: 'gh', x: 1, y: 4, cost: 200000, req: ['gh6'], name: 'Ring -1', desc: 'Runs below the anticheat. Scans find nothing at all, and obvious plays raise detection half as much.' },
  // SPOOFER
  { id: 'sp1', mod: 'sp', x: 1, y: 0, cost: 1200, name: 'Report Shredder', desc: 'Half of all reports against you go missing. Admins show up less.' },
  { id: 'sp2', mod: 'sp', x: 0, y: 1, cost: 6000, req: ['sp1'], name: 'Admin Bribe', desc: 'When an admin joins, 10% of this match\'s credits send them back to AFK.' },
  { id: 'sp3', mod: 'sp', x: 2, y: 1, cost: 15000, req: ['sp1'], name: 'HWID Spoofer', desc: 'Bans no longer fine your wallet. You still lose that match\'s credits.' },
  { id: 'sp4', mod: 'sp', x: 2, y: 2, cost: 45000, req: ['sp3'], name: 'Alt Account', desc: 'After a ban, detection resets to 0% instead of 40%.' },
  { id: 'sp5', mod: 'sp', x: 1, y: 3, cost: 90000, req: ['sp2', 'sp4'], name: 'Appeal Bot', desc: 'Once per match, a ban is appealed automatically and detection drops to 60%.' },
  { id: 'sp6', mod: 'sp', x: 1, y: 4, cost: 600000, req: ['sp5', 'gh7'], name: 'Server Owner', desc: 'You bought the servers. No bans, no kicks, no ban waves. Admins report to you now. Needs Ring -1 too.' },
  // BOOMBOX (grenades on C)
  { id: 'nd1', mod: 'nd', x: 1, y: 0, cost: 400, name: 'Extra Pins', desc: 'Start every match with 5 grenades instead of 3.', risk: 0.5, fx: { add: { grenades: 2 } } },
  { id: 'nd2', mod: 'nd', x: 0, y: 1, cost: 1500, req: ['nd1'], name: 'Short Fuse', desc: 'Grenades go off 40% sooner.', risk: 0.5, fx: { mul: { fuse: 0.6 } } },
  { id: 'nd3', mod: 'nd', x: 2, y: 1, cost: 2000, req: ['nd1'], name: 'Big Bang', desc: 'Blast radius +40%.', risk: 1, fx: { mul: { nadeR: 1.4 } } },
  { id: 'nd4', mod: 'nd', x: 0, y: 2, cost: 6000, req: ['nd2'], name: 'Sticky Bombs', desc: 'Grenades stick to the first bot they touch.', risk: 1, fx: { set: { sticky: true } } },
  { id: 'nd5', mod: 'nd', x: 2, y: 2, cost: 9000, req: ['nd3'], name: 'Cluster', desc: 'Every grenade splits into 4 more small blasts.', risk: 2, fx: { set: { cluster: true } } },
  { id: 'nd6', mod: 'nd', x: 1, y: 3, cost: 20000, req: ['nd4', 'nd5'], name: 'Bandolier', desc: '+4 grenades, and every 5-kill streak hands you another.', risk: 1, fx: { add: { grenades: 4 }, set: { nadeRefill: true } } },
  { id: 'nd7', mod: 'nd', x: 1, y: 4, cost: 80000, req: ['nd6'], name: 'Smart Grenades', desc: 'Grenades steer toward the nearest bot in flight.', risk: 3, fx: { set: { homing: true } } },
  // ---- second wave of upgrades: a side branch per module, plus a capstone ----
  { id: 'aim9', mod: 'aim', x: 3, y: 0, cost: 600, req: ['aim1'], name: "Recoil Assist", desc: "Lock-on pulls 30% harder.", risk: 1, fx: {"mul": {"aimStr": 1.3}} },
  { id: 'aim10', mod: 'aim', x: 3, y: 1, cost: 2500, req: ['aim9'], name: "Sticky Crosshair", desc: "Lock-on cone is 40% wider.", risk: 1, fx: {"mul": {"aimFov": 1.4}} },
  { id: 'aim11', mod: 'aim', x: 3, y: 2, cost: 9000, req: ['aim10'], name: "Humanized Lock", desc: "Snaps raise BotGuard detection 50% less.", risk: 0, fx: {"mul": {"snapDet": 0.5}} },
  { id: 'aim12', mod: 'aim', x: 3, y: 3, cost: 30000, req: ['aim11'], name: "Bone Select", desc: "Headshots deal 25% more damage.", risk: 2, fx: {"mul": {"hsMul": 1.25}} },
  { id: 'aim13', mod: 'aim', x: 1, y: 5, cost: 350000, req: ['aim8', 'aim12'], name: "Aim God", desc: "Lock-on pulls twice as hard and headshots deal 25% more again.", risk: 3, fx: {"mul": {"aimStr": 2, "hsMul": 1.25}} },
  { id: 'esp8', mod: 'esp', x: 3, y: 0, cost: 500, req: ['esp1'], name: "Threat Radar", desc: "You see who is aiming at you and dodge: bots aim 10% worse.", risk: 1, fx: {"mul": {"botAcc": 0.9}} },
  { id: 'esp9', mod: 'esp', x: 3, y: 1, cost: 2000, req: ['esp8'], name: "Glow Up", desc: "Ambush kills pay 30% more.", risk: 0.5, fx: {"add": {"ambushBonus": 0.3}} },
  { id: 'esp10', mod: 'esp', x: 3, y: 2, cost: 6000, req: ['esp9'], name: "Wall Intel", desc: "Wall kills raise BotGuard detection 40% less.", risk: 0, fx: {"mul": {"wallDet": 0.6}} },
  { id: 'esp11', mod: 'esp', x: 3, y: 3, cost: 25000, req: ['esp10'], name: "Pre-Aim", desc: "Lock-on cone is 25% wider: you already know where they are.", risk: 1, fx: {"mul": {"aimFov": 1.25}} },
  { id: 'esp12', mod: 'esp', x: 1, y: 5, cost: 90000, req: ['esp7', 'esp11'], name: "All-Seeing", desc: "The radar is always on and ambush kills pay 60% more.", risk: 1, fx: {"set": {"radar": true}, "add": {"ambushBonus": 0.6}} },
  { id: 'trg7', mod: 'trg', x: 3, y: 0, cost: 800, req: ['trg1'], name: "Burst Trigger", desc: "Fire rate +10%.", risk: 1, fx: {"mul": {"fireRate": 1.1}} },
  { id: 'trg8', mod: 'trg', x: 3, y: 1, cost: 3000, req: ['trg7'], name: "Hair Trigger", desc: "Triggerbot reacts twice as fast.", risk: 1, fx: {"mul": {"trigDelay": 0.5}} },
  { id: 'trg9', mod: 'trg', x: 3, y: 2, cost: 10000, req: ['trg8'], name: "Mag Dump", desc: "Magazines hold 20% more.", risk: 0.5, fx: {"mul": {"mag": 1.2}} },
  { id: 'trg10', mod: 'trg', x: 3, y: 3, cost: 30000, req: ['trg9'], name: "Trigger Discipline", desc: "Fire rate +15%.", risk: 1, fx: {"mul": {"fireRate": 1.15}} },
  { id: 'trg11', mod: 'trg', x: 1, y: 4, cost: 120000, req: ['trg6', 'trg10'], name: "Machine Mind", desc: "Fire rate +25%, and 10% of hits are critical (double damage).", risk: 3, fx: {"mul": {"fireRate": 1.25}, "add": {"crit": 0.1}} },
  { id: 'hb6', mod: 'hb', x: 3, y: 0, cost: 300, req: ['hb1'], name: "Puffy", desc: "Body hitboxes +15%.", risk: 0.5, fx: {"mul": {"hbBody": 1.15}} },
  { id: 'hb7', mod: 'hb', x: 3, y: 1, cost: 1500, req: ['hb6'], name: "Big Brain", desc: "Head hitboxes +20%.", risk: 1, fx: {"mul": {"hbHeadX": 1.2}} },
  { id: 'hb8', mod: 'hb', x: 3, y: 2, cost: 6000, req: ['hb7'], name: "Hit Registration", desc: "Headshot kills pay 25% more.", risk: 0.5, fx: {"add": {"hsBonus": 0.25}} },
  { id: 'hb9', mod: 'hb', x: 3, y: 3, cost: 25000, req: ['hb8'], name: "Spongebob Mode", desc: "Body hitboxes +30%.", risk: 2, fx: {"mul": {"hbBody": 1.3}} },
  { id: 'hb10', mod: 'hb', x: 1, y: 4, cost: 150000, req: ['hb5', 'hb9'], name: "Event Horizon", desc: "All hitboxes +50%. They are basically buildings now.", risk: 4, fx: {"mul": {"hbBody": 1.5, "hbHeadX": 1.5}} },
  { id: 'st6', mod: 'st', x: 3, y: 0, cost: 300, req: ['st1'], name: "Grip Tape", desc: "Recoil \u221220%.", risk: 0.5, fx: {"mul": {"recoil": 0.8}} },
  { id: 'st7', mod: 'st', x: 3, y: 1, cost: 1500, req: ['st6'], name: "Gyro", desc: "Spread from moving and jumping \u221230%.", risk: 1, fx: {"mul": {"airSpread": 0.7}} },
  { id: 'st8', mod: 'st', x: 3, y: 2, cost: 5000, req: ['st7'], name: "Muscle Memory", desc: "Fire rate +10%.", risk: 1, fx: {"mul": {"fireRate": 1.1}} },
  { id: 'st9', mod: 'st', x: 3, y: 3, cost: 15000, req: ['st8'], name: "Iron Sights", desc: "Aim down sights 60% faster.", risk: 0.5, fx: {"mul": {"adsFast": 1.6}} },
  { id: 'st10', mod: 'st', x: 1, y: 4, cost: 80000, req: ['st5', 'st9'], name: "Statue", desc: "Moving and jumping spread \u221260% more, recoil halved.", risk: 2, fx: {"mul": {"airSpread": 0.4, "recoil": 0.5}} },
  { id: 'mv7', mod: 'mv', x: 3, y: 0, cost: 400, req: ['mv1'], name: "Light Shoes", desc: "Move 10% faster.", risk: 0.5, fx: {"mul": {"speed": 1.1}} },
  { id: 'mv8', mod: 'mv', x: 3, y: 1, cost: 2000, req: ['mv7'], name: "Moon Boots", desc: "Jump 30% higher.", risk: 1, fx: {"mul": {"jump": 1.3}} },
  { id: 'mv9', mod: 'mv', x: 3, y: 2, cost: 6000, req: ['mv8'], name: "Slide Cancel", desc: "Blink recharges 40% faster.", risk: 1, fx: {"mul": {"blinkCD": 0.6}} },
  { id: 'mv10', mod: 'mv', x: 3, y: 3, cost: 20000, req: ['mv9'], name: "Parkour", desc: "Much better air control.", risk: 1, fx: {"mul": {"airAccel": 1.6}} },
  { id: 'mv11', mod: 'mv', x: 1, y: 4, cost: 150000, req: ['mv6', 'mv10'], name: "Sonic", desc: "Move 25% faster again and jump 20% higher.", risk: 3, fx: {"mul": {"speed": 1.25, "jump": 1.2}} },
  { id: 'am8', mod: 'am', x: 3, y: 0, cost: 300, req: ['am1'], name: "Drum Mag", desc: "Magazines hold 25% more.", risk: 0.5, fx: {"mul": {"mag": 1.25}} },
  { id: 'am9', mod: 'am', x: 3, y: 1, cost: 1500, req: ['am8'], name: "Quick Strip", desc: "Reload 25% faster.", risk: 0.5, fx: {"mul": {"reload": 0.75}} },
  { id: 'am10', mod: 'am', x: 3, y: 2, cost: 6000, req: ['am9'], name: "Hollow Tips", desc: "Damage +10%.", risk: 1, fx: {"mul": {"dmgMul": 1.1}} },
  { id: 'am11', mod: 'am', x: 3, y: 3, cost: 25000, req: ['am10'], name: "Overpressure", desc: "8% of hits are critical (double damage).", risk: 2, fx: {"add": {"crit": 0.08}} },
  { id: 'am12', mod: 'am', x: 1, y: 4, cost: 120000, req: ['am7', 'am11'], name: "Infinite Arsenal", desc: "Damage +20% and 7% more critical hits.", risk: 3, fx: {"mul": {"dmgMul": 1.2}, "add": {"crit": 0.07}} },
  { id: 'pa7', mod: 'pa', x: 3, y: 0, cost: 300, req: ['pa1'], name: "Bandages", desc: "Heal 5 HP for every kill.", risk: 0.5, fx: {"add": {"lifeOnKill": 5}} },
  { id: 'pa8', mod: 'pa', x: 3, y: 1, cost: 1500, req: ['pa7'], name: "Adrenaline", desc: "Heal 10 more HP for every kill.", risk: 1, fx: {"add": {"lifeOnKill": 10}} },
  { id: 'pa9', mod: 'pa', x: 3, y: 2, cost: 6000, req: ['pa8'], name: "Plating", desc: "Take 15% less damage.", risk: 1, fx: {"mul": {"dmgTaken": 0.85}} },
  { id: 'pa10', mod: 'pa', x: 3, y: 3, cost: 25000, req: ['pa9'], name: "Second Wind", desc: "Respawn twice as fast.", risk: 1, fx: {"mul": {"respawn": 0.5}} },
  { id: 'pa11', mod: 'pa', x: 1, y: 4, cost: 130000, req: ['pa6', 'pa10'], name: "Untouchable", desc: "Take 30% less damage again and heal 20 HP per kill.", risk: 3, fx: {"mul": {"dmgTaken": 0.7}, "add": {"lifeOnKill": 20}} },
  { id: 'mn9', mod: 'mn', x: 3, y: 0, cost: 500, req: ['mn1'], name: "Penny Pincher", desc: "Credits +10%.", risk: 0.5, fx: {"mul": {"cr": 1.1}} },
  { id: 'mn10', mod: 'mn', x: 3, y: 1, cost: 2500, req: ['mn9'], name: "Tax Evasion", desc: "Win bonuses pay 50% more.", risk: 0, fx: {"mul": {"winMul": 1.5}} },
  { id: 'mn11', mod: 'mn', x: 3, y: 2, cost: 8000, req: ['mn10'], name: "Crypto Miner", desc: "Style points pay 50% more at the end of a match.", risk: 0, fx: {"mul": {"stylePay": 1.5}} },
  { id: 'mn12', mod: 'mn', x: 3, y: 3, cost: 30000, req: ['mn11'], name: "Offshore Account", desc: "Credits +15%.", risk: 1, fx: {"mul": {"cr": 1.15}} },
  { id: 'mn13', mod: 'mn', x: 1, y: 5, cost: 500000, req: ['mn8', 'mn12'], name: "Infinite Money", desc: "Credits +25% on top of everything.", risk: 2, fx: {"mul": {"cr": 1.25}} },
  { id: 'lg8', mod: 'lg', x: 3, y: 0, cost: 500, req: ['lg1'], name: "Jitter", desc: "Bots aim 10% worse.", risk: 1, fx: {"mul": {"botAcc": 0.9}} },
  { id: 'lg9', mod: 'lg', x: 3, y: 1, cost: 2500, req: ['lg8'], name: "Ping Spike", desc: "Bots move 10% slower.", risk: 1, fx: {"mul": {"botSpeed": 0.9}} },
  { id: 'lg10', mod: 'lg', x: 3, y: 2, cost: 8000, req: ['lg9'], name: "Long Freeze", desc: "Freeze Frame recharges 30% faster.", risk: 1, fx: {"mul": {"freezeCD": 0.7}} },
  { id: 'lg11', mod: 'lg', x: 3, y: 3, cost: 25000, req: ['lg10'], name: "Packet Flood", desc: "+2 bots in every lobby.", risk: 1, fx: {"add": {"extraBots": 2}} },
  { id: 'lg12', mod: 'lg', x: 1, y: 4, cost: 150000, req: ['lg7', 'lg11'], name: "Total Desync", desc: "Bots aim 30% worse and 2 more join every lobby.", risk: 3, fx: {"mul": {"botAcc": 0.7}, "add": {"extraBots": 2}} },
  { id: 'ks7', mod: 'ks', x: 3, y: 0, cost: 1500, req: ['ks1'], name: "Spy Plane", desc: "Recon Drone lasts 50% longer.", risk: 0.5, fx: {"mul": {"uavTime": 1.5}} },
  { id: 'ks8', mod: 'ks', x: 3, y: 1, cost: 4000, req: ['ks7'], name: "Bigger Crates", desc: "Care packages pay double.", risk: 0.5, fx: {"mul": {"careMul": 2}} },
  { id: 'ks9', mod: 'ks', x: 3, y: 2, cost: 12000, req: ['ks8'], name: "Laser Capacitor", desc: "Orbital Laser recharges 35% faster.", risk: 1, fx: {"mul": {"orbitalCD": 0.65}} },
  { id: 'ks10', mod: 'ks', x: 3, y: 3, cost: 30000, req: ['ks9'], name: "Cluster Bombs", desc: "Airstrike radius +50%.", risk: 1, fx: {"mul": {"strikeR": 1.5}} },
  { id: 'ks11', mod: 'ks', x: 1, y: 4, cost: 200000, req: ['ks6', 'ks10'], name: "Killstreak Kingpin", desc: "Care packages pay double again and the laser recharges 35% faster.", risk: 2, fx: {"mul": {"careMul": 2, "orbitalCD": 0.65}} },
  { id: 'so7', mod: 'so', x: 3, y: 0, cost: 500, req: ['so1'], name: "Copypasta", desc: "Angry chat drops 25% more salt.", risk: 0, fx: {"mul": {"salt": 1.25}} },
  { id: 'so8', mod: 'so', x: 3, y: 1, cost: 2500, req: ['so7'], name: "Mod Friend", desc: "Fake Admin recharges 40% faster.", risk: 0.5, fx: {"mul": {"kickCD": 0.6}} },
  { id: 'so9', mod: 'so', x: 3, y: 2, cost: 8000, req: ['so8'], name: "Wanted Poster", desc: "Bounties pay 3\u00d7 more.", risk: 0.5, fx: {"add": {"bountyAdd": 3}} },
  { id: 'so10', mod: 'so', x: 3, y: 3, cost: 25000, req: ['so9'], name: "Viral Clip", desc: "Clip Farming pays double.", risk: 0, fx: {"mul": {"clipMul": 2}} },
  { id: 'so11', mod: 'so', x: 1, y: 4, cost: 150000, req: ['so6', 'so10'], name: "Influencer Deal", desc: "Angry chat drops 50% more salt again.", risk: 0, fx: {"mul": {"salt": 1.5}} },
  { id: 'gs7', mod: 'gs', x: 3, y: 0, cost: 800, req: ['gs1'], name: "Polished Barrel", desc: "Damage +10%.", risk: 1, fx: {"mul": {"dmgMul": 1.1}} },
  { id: 'gs8', mod: 'gs', x: 3, y: 1, cost: 3000, req: ['gs7'], name: "Lucky Rounds", desc: "5% of hits are critical (double damage).", risk: 1, fx: {"add": {"crit": 0.05}} },
  { id: 'gs9', mod: 'gs', x: 3, y: 2, cost: 10000, req: ['gs8'], name: "Bloodsucker", desc: "Heal 3 more HP for every hit.", risk: 1, fx: {"add": {"vampAdd": 3}} },
  { id: 'gs10', mod: 'gs', x: 3, y: 3, cost: 30000, req: ['gs9'], name: "Big Boom", desc: "Explosive Rounds hit 50% harder.", risk: 1, fx: {"mul": {"exMul": 1.5}} },
  { id: 'gs11', mod: 'gs', x: 1, y: 4, cost: 150000, req: ['gs6', 'gs10'], name: "Chain Reaction", desc: "Chain Lightning arcs to 4 bots, and 5% more crits.", risk: 3, fx: {"set": {"chainN": 4}, "add": {"crit": 0.05}} },
  { id: 'ch6', mod: 'ch', x: 3, y: 0, cost: 800, req: ['ch1'], name: "Speed Loader II", desc: "Reload 15% faster.", risk: 0.5, fx: {"mul": {"reload": 0.85}} },
  { id: 'ch7', mod: 'ch', x: 3, y: 1, cost: 3000, req: ['ch6'], name: "Long Exposure", desc: "Bullet Time lasts 3 s longer.", risk: 1, fx: {"add": {"slowAdd": 3}} },
  { id: 'ch8', mod: 'ch', x: 3, y: 2, cost: 12000, req: ['ch7'], name: "Deja Vu", desc: "Rewind works twice per match.", risk: 1, fx: {"set": {"rewinds": 2}} },
  { id: 'ch9', mod: 'ch', x: 3, y: 3, cost: 30000, req: ['ch8'], name: "Stolen Hours", desc: "Time Thief can add up to 120 s.", risk: 1, fx: {"set": {"thiefCap": 120}} },
  { id: 'ch10', mod: 'ch', x: 1, y: 4, cost: 150000, req: ['ch5', 'ch9'], name: "Time Lord", desc: "Bullet Time recharges twice as fast and Rewind works 3 times per match.", risk: 2, fx: {"mul": {"slowCDMul": 0.5}, "set": {"rewinds": 3}} },
  { id: 'in6', mod: 'in', x: 3, y: 0, cost: 500, req: ['in1'], name: "Coupon Code", desc: "Credit chips are worth 50% more.", risk: 0, fx: {"mul": {"chipMul": 1.5}} },
  { id: 'in7', mod: 'in', x: 3, y: 1, cost: 2500, req: ['in6'], name: "Day Trader", desc: "Interest can pay twice as much.", risk: 0, fx: {"mul": {"interestCap": 2}} },
  { id: 'in8', mod: 'in', x: 3, y: 2, cost: 8000, req: ['in7'], name: "Black Friday", desc: "Contracts pay 50% more.", risk: 0, fx: {"mul": {"contractMul": 1.5}} },
  { id: 'in9', mod: 'in', x: 3, y: 3, cost: 25000, req: ['in8'], name: "Parts Dealer", desc: "Rival cheaters drop 1 more loader part.", risk: 0, fx: {"add": {"partsAdd": 1}} },
  { id: 'in10', mod: 'in', x: 1, y: 4, cost: 150000, req: ['in5', 'in9'], name: "Hedge Fund", desc: "Interest pays 4% of your wallet, and chips are worth 50% more again.", risk: 0, fx: {"set": {"interestRate": 0.04}, "mul": {"chipMul": 1.5}} },
  { id: 'gh8', mod: 'gh', x: 3, y: 0, cost: 1000, req: ['gh1'], name: "Clean Install", desc: "Detection cools 5% more after every match.", risk: 0, fx: {"add": {"coolAdd": 5}} },
  { id: 'gh9', mod: 'gh', x: 3, y: 1, cost: 4000, req: ['gh8'], name: "VPN Hop", desc: "Admins need 50% more reports before they show up.", risk: 0, fx: {"mul": {"reportMul": 1.5}} },
  { id: 'gh10', mod: 'gh', x: 3, y: 2, cost: 12000, req: ['gh9'], name: "Spoofed Telemetry", desc: "Obvious plays raise detection 20% less.", risk: 0, fx: {"mul": {"activeMul": 0.8}} },
  { id: 'gh11', mod: 'gh', x: 3, y: 3, cost: 40000, req: ['gh10'], name: "Ghost Protocol", desc: "Ban-wave risk builds up half as fast.", risk: 0, fx: {"mul": {"waveMul": 0.5}} },
  { id: 'gh12', mod: 'gh', x: 1, y: 5, cost: 300000, req: ['gh7', 'gh11'], name: "Invisible", desc: "Obvious plays raise detection 40% less again, and you cool 10% more per match.", risk: 0, fx: {"mul": {"activeMul": 0.6}, "add": {"coolAdd": 10}} },
  { id: 'sp7', mod: 'sp', x: 3, y: 0, cost: 2000, req: ['sp1'], name: "Lawyer", desc: "Admin kicks only take 25% of the match's credits.", risk: 0, fx: {"set": {"kickPenalty": 0.25}} },
  { id: 'sp8', mod: 'sp', x: 3, y: 1, cost: 6000, req: ['sp7'], name: "Fine Print", desc: "Ban fines are halved.", risk: 0, fx: {"mul": {"fineMul": 0.5}} },
  { id: 'sp9', mod: 'sp', x: 3, y: 2, cost: 15000, req: ['sp8'], name: "Short Attention Span", desc: "Admins only watch for 60% as long.", risk: 0, fx: {"mul": {"adminTime": 0.6}} },
  { id: 'sp10', mod: 'sp', x: 3, y: 3, cost: 40000, req: ['sp9'], name: "Admin Payroll", desc: "Every admin who shows up pays you 10 kills of credits. They work for you.", risk: 0, fx: {"set": {"payroll": true}} },
  { id: 'sp11', mod: 'sp', x: 1, y: 5, cost: 800000, req: ['sp6', 'sp10'], name: "Landlord", desc: "You own every lobby: credits +20%.", risk: 0, fx: {"mul": {"cr": 1.2}} },
];
// balance pass: cheats cost 2.5x what they used to, so the early game takes a few matches per cheat
for (const u of UPGRADES) u.cost = Math.round(u.cost * 2.5 / 10) * 10;
// detection risk per cheat: how much each one adds to every BotGuard scan while it's injected and on
const UPGRADE_RISK = {
  aim1: 1, aim2: 1, aim3: 1, aim4: 2, aim5: 2, aim6: 3, aim7: 3, aim8: 5,
  esp1: 1, esp2: 0.5, esp3: 0.5, esp4: 0.5, esp5: 0.5, esp6: 1, esp7: 1,
  trg1: 1, trg2: 1, trg3: 1, trg4: 2, trg5: 0.5, trg6: 3,
  hb1: 1, hb2: 1, hb3: 2, hb4: 3, hb5: 4,
  st1: 0.5, st2: 1, st3: 2, st4: 1, st5: 3,
  mv1: 1, mv2: 1, mv3: 1, mv4: 2, mv5: 3, mv6: 4,
  am1: 0.5, am2: 0.5, am3: 2, am4: 2, am5: 3, am6: 3, am7: 3,
  pa1: 1, pa2: 1, pa3: 2, pa4: 3, pa5: 2, pa6: 5,
  mn1: 0.5, mn2: 0.5, mn3: 0.5, mn4: 1, mn5: 0, mn6: 2, mn7: 1, mn8: 3,
  lg1: 1, lg2: 1, lg3: 1, lg4: 3, lg5: 2, lg6: 2, lg7: 4,
  ks1: 1, ks2: 1, ks3: 2, ks4: 1, ks5: 3, ks6: 4,
  so1: 0, so2: 0, so3: 2, so4: 0, so5: 1, so6: 0,
  gs1: 1, gs2: 1, gs3: 1, gs4: 2, gs5: 2, gs6: 3,
  ch1: 0.5, ch2: 2, ch3: 2, ch4: 2, ch5: 2,
  in1: 0.5, in2: 0.5, in3: 0, in4: 0, in5: 0,
};
for (const u of UPGRADES) u.risk = u.risk != null ? u.risk : UPGRADE_RISK[u.id] || 0;
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
  { id: 'zebra', name: 'Zebra', cost: 80, c0: '#f2f2f2', c1: '#141414', pat: 3, spec: 0.3 },
  { id: 'lava', name: 'Lava Lamp', cost: 140, c0: '#ff5a1f', c1: '#5a0d0d', pat: 4, spec: 0.6 },
  { id: 'mint', name: 'Mint Condition', cost: 180, c0: '#9ff5d0', c1: '#2f7d62', pat: 0, spec: 0.5 },
  { id: 'circuit', name: 'Circuit Board', cost: 260, c0: '#1d6b3a', c1: '#c9a227', pat: 7, spec: 0.7 },
  { id: 'candy', name: 'Candy Cane', cost: 320, c0: '#f5f5f5', c1: '#e0283c', pat: 3, spec: 0.5 },
  { id: 'bandit', name: 'Bandit Pink', cost: 700, c0: '#ff4f9a', c1: '#2a1530', pat: 4, spec: 0.6 },
  { id: 'chrome', name: 'Mirror Chrome', cost: 1100, c0: '#e6ebf2', c1: '#7d8896', pat: 0, spec: 1.8 },
  { id: 'void', name: 'The Void', cost: 2500, c0: '#06060c', c1: '#3b1d6e', pat: 13, spec: 1.1 },
  // Bandit Pass exclusives
  { id: 'p_static', name: 'Static Noise', cost: 0, pass: true, c0: '#d9dde4', c1: '#2a2d33', pat: 6, spec: 0.4 },
  { id: 'p_sunset', name: 'Rooftop Sunset', cost: 0, pass: true, c0: '#ff9b6a', c1: '#5b2a6e', pat: 0, spec: 0.8 },
  { id: 'p_toxic', name: 'Toxic Lobby', cost: 0, pass: true, c0: '#7cff4d', c1: '#1a2b12', pat: 4, spec: 0.6 },
  { id: 'p_galaxy', name: 'Moon Base', cost: 0, pass: true, c0: '#1b1446', c1: '#8fb3ff', pat: 13, spec: 1.2 },
  { id: 'p_raccoon', name: 'Raccoon Stripe', cost: 0, pass: true, c0: '#8a8c97', c1: '#17151b', pat: 3, spec: 0.4 },
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
  { id: 'diamond', name: 'Diamond', cost: 60 },
  { id: 'brackets', name: 'Brackets', cost: 80 },
  { id: 'triangle', name: 'Triforce-ish', cost: 120 },
  { id: 'star', name: 'Gold Star', cost: 0, pass: true },
  { id: 'ringx', name: 'Target Locked', cost: 0, pass: true },
  { id: 'hex', name: 'Hex Key', cost: 0, pass: true },
];
const XHAIR_COLORS = ['#7cffb2', '#4df0ff', '#ffffff', '#ffe24d', '#ff5ccf', '#ff4d4d', '#9d7bff', '#ff9a3c'];

const KILLFX = [
  { id: 'scrap', name: 'Scrap Metal', cost: 0, desc: 'Bots fall apart. Classic.' },
  { id: 'confetti', name: 'Confetti', cost: 60, desc: 'Every kill is a party.' },
  { id: 'pixels', name: 'Deleted', cost: 110, desc: 'Bots dissolve into glowing pixels.' },
  { id: 'coins', name: 'Jackpot', cost: 220, desc: 'Bots burst into a shower of gold.' },
  { id: 'fireworks', name: 'Fireworks', cost: 420, desc: 'Sparks fly straight up. Very subtle.' },
  { id: 'saltfx', name: 'Salt Shaker', cost: 300, desc: 'Bots crumble into a pile of salt. Fitting.' },
  { id: 'banned', name: 'BANNED', cost: 650, desc: 'A big red BANNED stamp over every kill. The irony is free.' },
  { id: 'glitchfx', name: 'Desync', cost: 0, pass: true, desc: 'Bots smear sideways into cyan and magenta cubes. Bandit Pass only.' },
  { id: 'smoke', name: 'Logged Off', cost: 0, pass: true, desc: 'Bots puff into a slow grey cloud. Bandit Pass only.' },
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

function genRuins() {
  const W = 28, H = 20, g = [], rnd = U.rng(7331);
  for (let r = 0; r < H; r++) g.push(Array.from({ length: W }, (_, q) => (r === 0 || q === 0 || r === H - 1 || q === W - 1) ? '#' : '.'));
  const put = (q, r, ch) => { if (q > 1 && r > 1 && q < W - 2 && r < H - 2 && g[r][q] === '.') g[r][q] = ch; };
  // broken wall stubs, never longer than 3 so the ruins stay open
  for (let i = 0; i < 26; i++) {
    const q = 2 + Math.floor(rnd() * (W - 4)), r = 2 + Math.floor(rnd() * (H - 4)), hz = rnd() < 0.5, len = 1 + Math.floor(rnd() * 3);
    const ch = rnd() < 0.55 ? '#' : 'h';
    for (let k = 0; k < len; k++) put(hz ? q + k : q, hz ? r : r + k, ch);
  }
  for (let i = 0; i < 12; i++) put(2 + Math.floor(rnd() * (W - 4)), 2 + Math.floor(rnd() * (H - 4)), rnd() < 0.5 ? 'p' : 'c');
  for (let q = 1; q < W - 1; q++) g[10][q] = '.';
  for (let r = 1; r < H - 1; r++) g[r][14] = '.';
  [[1, 1], [26, 1], [1, 18], [26, 18], [7, 5], [20, 5], [7, 14], [20, 14], [14, 2], [14, 17]].forEach(([q, r]) => { g[r][q] = 'S'; });
  g[10][14] = 'P';
  return g.map(r => r.join(''));
}

function genVolcano() {
  const N = 30, c = (N - 1) / 2, g = [], rnd = U.rng(666);
  for (let r = 0; r < N; r++) { const row = []; for (let q = 0; q < N; q++) row.push(Math.hypot(q - c, r - c) > 14 ? '#' : '.'); g.push(row); }
  const put = (q, r, ch) => { if (g[r] && g[r][q] === '.') g[r][q] = ch; };
  // lab blocks in a ring, rock clusters scattered
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; const q = Math.round(c + Math.cos(a) * 8), r = Math.round(c + Math.sin(a) * 8); put(q, r, 'K'); put(q + 1, r, 'K'); }
  for (let i = 0; i < 30; i++) { const q = 3 + Math.floor(rnd() * 24), r = 3 + Math.floor(rnd() * 24); put(q, r, rnd() < 0.6 ? 'C' : 'p'); }
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + 0.3; put(Math.round(c + Math.cos(a) * 4), Math.round(c + Math.sin(a) * 4), 'h'); }
  for (let r = 1; r < N - 1; r++) { if (g[r][15] !== '#') g[r][15] = '.'; }
  for (let q = 1; q < N - 1; q++) { if (g[15][q] !== '#') g[15][q] = '.'; }
  const spawns = [[15, 2], [15, 27], [2, 15], [27, 15], [7, 7], [22, 7], [7, 22], [22, 22], [11, 11], [18, 18], [11, 18], [18, 11]];
  spawns.forEach(([q, r]) => { if (g[r][q] !== '#') g[r][q] = 'S'; });
  g[15][15] = 'P';
  return g.map(r => r.join(''));
}

function genMoon() {
  const N = 34, c = (N - 1) / 2, g = [];
  for (let r = 0; r < N; r++) {
    const row = [];
    for (let q = 0; q < N; q++) row.push(Math.hypot(q - c, (r - c) * 1.05) > 16 ? '#' : '.');
    g.push(row);
  }
  const rnd = U.rng(1969);
  const put = (q, r, ch) => { if (g[r] && g[r][q] === '.') g[r][q] = ch; };
  // crater rims: rings of low rock
  for (const [cq, cr, rad] of [[10, 10, 3], [23, 11, 2.5], [11, 23, 2.5], [23, 23, 3.2], [17, 6, 1.8], [6, 17, 1.8], [28, 17, 1.8], [17, 28, 1.8]]) {
    for (let a = 0; a < TAU; a += 0.42) if (rnd() < 0.75) put(Math.round(cq + Math.cos(a) * rad), Math.round(cr + Math.sin(a) * rad), 'h');
  }
  for (let i = 0; i < 40; i++) { const q = 3 + Math.floor(rnd() * 28), r = 3 + Math.floor(rnd() * 28); put(q, r, rnd() < 0.5 ? 'c' : 'C'); }
  // the base in the middle
  for (let k = -2; k <= 2; k++) { put(17 + k, 15, 'K'); put(17 + k, 19, 'K'); }
  put(15, 17, 'p'); put(19, 17, 'p');
  for (let r = 1; r < N - 1; r++) { if (g[r][17] !== '#') g[r][17] = '.'; }
  const spawns = [[17, 3], [17, 30], [3, 17], [30, 17], [8, 8], [26, 8], [8, 26], [26, 26], [13, 13], [21, 21], [13, 21], [21, 13], [5, 12], [28, 22], [12, 28], [22, 5]];
  spawns.forEach(([q, r]) => { if (g[r][q] !== '#') g[r][q] = 'S'; });
  g[17][17] = 'P';
  return g.map(r => r.join(''));
}

const MAPS = [
  {
    id: 'closet', name: 'The Closet', mode: '1v1', blurb: 'A tiny aim room. One bot. Zero excuses.',
    bots: 1, cr: 10, time: 60, unlock: 0, wallH: 4.2,
    bot: { dmg: 9, acc: 0.21, react: 0.85, fire: 0.6, speed: 3.6 },
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
    id: 'garage', name: 'Parking Garage', mode: 'FFA', blurb: 'Concrete pillars, oil stains, four bots and terrible echo.',
    bots: 4, cr: 28, time: 80, unlock: 350, wallH: 3.4,
    bot: { dmg: 9, acc: 0.22, react: 0.75, fire: 0.52, speed: 3.9 },
    col: { floor: '#5d6068', wall: '#8a8f98', crate: '#7a5c3e', half: '#c9b43a', pillar: '#a3a8b0', hedge: '#4d8b46', accent: '#ffd23f' },
    pat: { floor: 14, wall: 14 },
    env: { zenith: '#2a3140', horizon: '#6c7385', sun: [0.2, -0.95, 0.2], sunCol: '#fff4d6', sky: '#4a5262', gnd: '#3c3e44', fog: '#3a3f4b', fogDen: 0.02, stars: 0, clouds: 0 },
    layout: [
      '##################',
      '#P...p....p....S.#',
      '#.cc.........cc..#',
      '#....p....p......#',
      '#hhhh....hhhh..h.#',
      '#....p....p......#',
      '#.C............C.#',
      '#....p....p......#',
      '#..hhhh....hhhh..#',
      '#S...p....p.....S#',
      '#........c.......#',
      '##################',
    ],
    props: 'garage', chat: ['who parked here', 'my car alarm keeps going off', 'level 2 is free parking right', 'it echoes so much in here'],
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
    id: 'snow', name: 'Snowed In', mode: 'FFA', blurb: 'An arctic outpost buried in drifts. Seven bots, cold hands.',
    bots: 7, cr: 50, time: 90, unlock: 1900, wallH: 4.6,
    bot: { dmg: 9, acc: 0.26, react: 0.68, fire: 0.48, speed: 3.9 },
    col: { floor: '#e6edf3', wall: '#9fb2c4', crate: '#7c5a3a', half: '#c7d3de', pillar: '#d9e2ea', hedge: '#f2f6fa', accent: '#3db8ff' },
    pat: { floor: 14, wall: 9 },
    env: { zenith: '#7fa6cf', horizon: '#eef4fa', sun: [-0.3, -0.6, -0.7], sunCol: '#ffffff', sky: '#c9d9ea', gnd: '#c9d3dc', fog: '#e8eef4', fogDen: 0.022, stars: 0, clouds: 0.8 },
    layout: [
      '####################',
      '#S.....g.....K....S#',
      '#..gg..g..c..K..c..#',
      '#..................#',
      '#.c...KKK....gg....#',
      '#.....KKK..........#',
      '#..g.......C..p....#',
      '#..g..p.........g..#',
      '#........gg.....g..#',
      '#.KK..c......KKK...#',
      '#.KK.........KKK.c.#',
      '#..c....g..........#',
      '#S.......P........S#',
      '####################',
    ],
    props: 'snow', chat: ['my fingers are frozen', 'cant see anything in this snow', 'who built a snowman over there', 'brr'],
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
    id: 'arcade', name: 'Neon Arcade', mode: 'FFA', blurb: 'Cabinets, carpet and a prize counter. Nine bots, insert coin.',
    bots: 9, cr: 70, time: 95, unlock: 5500, wallH: 4.2,
    bot: { dmg: 10, acc: 0.29, react: 0.6, fire: 0.45, speed: 4.2 },
    col: { floor: '#1b1238', wall: '#2a1a50', crate: '#ff3df0', half: '#3a2470', pillar: '#4b2d8c', hedge: '#4d8b46', accent: '#3dffe0' },
    pat: { floor: 12, wall: 16 },
    env: { zenith: '#0a0520', horizon: '#3b1366', sun: [0.2, -0.9, 0.3], sunCol: '#e0c8ff', sky: '#2d1a55', gnd: '#150c2e', fog: '#1e0f3a', fogDen: 0.016, stars: 0.6, clouds: 0 },
    layout: [
      '######################',
      '#S..p.p.p....p.p.p..S#',
      '#....................#',
      '#.hh....C....C....hh.#',
      '#....p.p......p.p....#',
      '#.c..................#',
      '#....hhh..ff..hhh..c.#',
      '#....hhh..ff..hhh....#',
      '#.c..................#',
      '#....p.p......p.p....#',
      '#.hh....C....C....hh.#',
      '#....................#',
      '#S..p.p.p.P..p.p.p..S#',
      '######################',
    ],
    props: 'arcade', chat: ['high score is mine', 'who unplugged the dance machine', 'i have 400 tickets', 'insert coin to continue'],
  },
  {
    id: 'servers', name: 'Server Farm', mode: 'FFA', blurb: 'Rows of humming racks. The admin left the door open. Ten bots.',
    bots: 10, cr: 80, time: 95, unlock: 8000, wallH: 5,
    bot: { dmg: 10, acc: 0.3, react: 0.58, fire: 0.44, speed: 4.25 },
    col: { floor: '#2b313d', wall: '#3a4456', crate: '#2d3a4f', half: '#46536a', pillar: '#59657a', hedge: '#4d8b46', accent: '#3dff9e' },
    pat: { floor: 12, wall: 9 },
    env: { zenith: '#0b1626', horizon: '#1f4a55', sun: [0.2, -0.9, -0.3], sunCol: '#b8ffe0', sky: '#2c4a5a', gnd: '#20262f', fog: '#122630', fogDen: 0.018, stars: 0.3, clouds: 0 },
    layout: [
      '######################',
      '#S..................S#',
      '#.KK.KK.KK..KK.KK.KK.#',
      '#.KK.KK.KK..KK.KK.KK.#',
      '#....................#',
      '#.c......p..p......c.#',
      '#...hhh........hhh...#',
      '#.KK.KK..C..C..KK.KK.#',
      '#.KK.KK........KK.KK.#',
      '#...hhh........hhh...#',
      '#.c......p..p......c.#',
      '#....................#',
      '#.KK.KK.KK..KK.KK.KK.#',
      '#.KK.KK.KK..KK.KK.KK.#',
      '#S........P.........S#',
      '######################',
    ],
    props: 'servers',
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
    id: 'desert', name: 'Desert Ruins', mode: 'FFA', blurb: 'Broken walls, burning sand, fourteen bots and no shade.',
    bots: 14, cr: 130, time: 110, unlock: 30000, wallH: 3.6,
    bot: { dmg: 11, acc: 0.32, react: 0.53, fire: 0.41, speed: 4.4 },
    col: { floor: '#d9b77a', wall: '#c09a62', crate: '#8a6236', half: '#b8925c', pillar: '#e2c896', hedge: '#6b8a3f', accent: '#ff7a2e' },
    pat: { floor: 14, wall: 10 },
    env: { zenith: '#3a7ad0', horizon: '#ffe2a8', sun: [0.4, -0.85, 0.3], sunCol: '#fff0c8', sky: '#d9c9a8', gnd: '#b8955c', fog: '#f2dcae', fogDen: 0.009, stars: 0, clouds: 0.15 },
    layout: genRuins(),
    props: 'desert', chat: ['sand in my keyboard', 'it is so hot', 'these ruins are older than the admin', 'water break?'],
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
    id: 'volcano', name: 'Volcano Lab', mode: 'FFA', blurb: 'A secret lab inside a volcano. Twenty-four bots. Do not touch the glowing stuff.',
    bots: 24, cr: 210, time: 120, unlock: 115000, wallH: 5,
    bot: { dmg: 12, acc: 0.35, react: 0.48, fire: 0.39, speed: 4.5 },
    col: { floor: '#3a2a26', wall: '#5a3a30', crate: '#2e3640', half: '#4a3a34', pillar: '#6a4a3a', hedge: '#4d8b46', accent: '#ff5a1f' },
    pat: { floor: 14, wall: 10 },
    env: { zenith: '#1a0606', horizon: '#ff5a1f', sun: [-0.2, -0.8, 0.5], sunCol: '#ffb070', sky: '#6a1e10', gnd: '#2a1410', fog: '#4a160c', fogDen: 0.014, stars: 0.2, clouds: 0.3 },
    layout: genVolcano(),
    props: 'volcano', chat: ['why is the floor warm', 'whose evil lab is this', 'i smell sulfur', 'is that lava or a texture'],
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
  {
    id: 'moon', name: 'Moon Base', mode: 'FFA', blurb: 'Low gravity, forty bots, and nobody up here to read the reports.',
    bots: 40, cr: 420, time: 130, unlock: 1200000, wallH: 4, grav: 0.42,
    bot: { dmg: 14, acc: 0.38, react: 0.42, fire: 0.36, speed: 4.7 },
    col: { floor: '#8d8f96', wall: '#c4c7cf', crate: '#d8dbe3', half: '#a9adb6', pillar: '#e6e8ee', hedge: '#4d8b46', accent: '#4dd4ff' },
    pat: { floor: 14, wall: 1 },
    env: { zenith: '#000000', horizon: '#141a2e', sun: [0.5, -0.6, -0.6], sunCol: '#ffffff', sky: '#1a2038', gnd: '#55575e', fog: '#0c1020', fogDen: 0.006, stars: 1, clouds: 0 },
    layout: genMoon(),
    props: 'moon',
  },
  {
    id: 'house', name: "The Admin's House", mode: 'FFA', blurb: 'You found where the admin lives. Forty-eight bots, and he is asleep upstairs.',
    bots: 48, cr: 600, time: 140, unlock: 3000000, wallH: 4.4,
    bot: { dmg: 15, acc: 0.4, react: 0.4, fire: 0.35, speed: 4.8 },
    col: { floor: '#8a6a4a', wall: '#d8ccb8', crate: '#6a4a8a', half: '#a88a6a', pillar: '#c9b89a', hedge: '#4d8b46', accent: '#ff4f9a' },
    pat: { floor: 8, wall: 10 },
    env: { zenith: '#101830', horizon: '#3a4a70', sun: [0.3, -0.8, -0.4], sunCol: '#ffe6c8', sky: '#2a3450', gnd: '#3a2e24', fog: '#1c2238', fogDen: 0.01, stars: 0.8, clouds: 0.2 },
    layout: [
      '##############################',
      '#S.......#..........#.......S#',
      '#..c.....#...C..C...#...KK...#',
      '#........#..........#...KK...#',
      '#..p..p..........p.......c...#',
      '#........#..........#........#',
      '####..####...hhhh...####..####',
      '#........#..........#........#',
      '#.C......#...f..f...#.....C..#',
      '#........#..........#........#',
      '#S...........P..............S#',
      '#........#..........#........#',
      '#..gg....#...hhhh...#....gg..#',
      '#........#..........#........#',
      '####..####..........####..####',
      '#........#...C..C...#........#',
      '#..c..p..............p....c..#',
      '#........#..........#........#',
      '#.KK.....#..ffff....#....KK..#',
      '#S.......#..........#.......S#',
      '##############################',
    ],
    props: 'house', chat: ['why are we in the admins house', 'shh he is asleep upstairs', 'his fridge is full of energy drinks', 'found his password on a sticky note', 'no wonder he is always afk'],
  },
];
for (const m of MAPS) m.unlock *= 2;
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
  'Cache_Miss', 'Overflow_Olga', 'Kernel_Panic', 'Segfault_Sid', 'Loading_Lou', 'Ping_Pong', 'Mouse_Pad', 'WASD_Wendy',
  'Alt_Tab', 'Crouch_Spammer', 'NoScope_Noel', 'Spray_n_Pray', 'Lag_Comp', 'Hitreg_Hank', 'Tutorial_Tom', 'Captcha_Kid',
  'Dumbbell_Dave', 'Boot_Loop', 'Rubber_Duck', 'Last_Patch', 'Dev_Null', 'Robo_Ron', 'Clip_It', 'Free_Trial',
  'Cable_Mgmt', 'Frame_Drop', 'Lag_Spike_Lucy', 'Toast_Master', 'Pixel_Pam', 'Server_Steve', 'Mod_Wannabe', 'Smurf_Account',
  'Daily_Grinder', 'Nade_Spammer', 'Camper_Van', 'Rage_Bait', 'Gg_Ez_Greg', 'Report_Bot', 'Uninstall_Ursula', 'Hotkey_Hal',
];
const PERSONAS = ['chill', 'salty', 'tryhard', 'troll', 'quiet', 'chill', 'salty'];

const CHAT = {
  greet: ['gl hf', 'glhf', 'hi', 'hello', 'yo', 'sup', 'gl', 'o/', 'hey all', 'lets goo', 'ready', 'have fun', 'first game today', 'warming up', 'back again', 'ok lets do this'],
  idle0: ['is it just me or is the floor sticky', 'whoever is crouch spamming, stop', 'my mouse battery is at 3%', 'one more game then bed', 'who invited the cheater', 'gg in advance',
    'anyone else lagging?', 'this map again lol', 'my aim is so bad today', 'who keeps camping', 'lol', 'what rank is everyone', 'i should be doing homework', 'need 3 more kills for my daily', 'is this ranked?', 'im so tired', 'who wants to 1v1 after', 'lol i fell off the crate', 'brb in 5', 'nice weather on this map', 'my dog just walked on my keyboard'],
  victim0: ['nice shot', 'ns', 'nice one', 'wp', 'dang', 'ok that was clean', 'you got me', 'ugh', 'lucky', 'ouch', 'unlucky me', 'good aim', 'how', 'gg'],
  taunt: ['ez', 'gotcha', 'lol', 'sorry', 'rip', 'too slow', '1 tap', 'get good', 'nt', 'ha', 'bye', 'that was easy', 'you ok?', 'is that guy afk?'],
  tier1: ['did he just pre aim that corner', 'he is too smooth', 'that was a little too fast', 'ok that was suspicious',
    'hmm', 'that was weird', 'how did you see me', '?', '??', 'bro is warmed up', 'ok who is this guy', 'bro is cracked', 'lucky or hacking', 'that flick tho', 'kinda sus ngl', 'did he prefire me', 'how did he know', 'ok calm down', 'someone stop this guy'],
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
  join: ['hi', 'what did i miss', 'why is everyone mad', 'yo', 'who is the cheater', 'hello', 'oh no not this guy again', 'is it safe to join', 'why is the lobby on fire'],
  kicked: ['WHO KICKED ME', 'since when is he admin', 'he kicked him??', 'abuse of power', 'the cheater is the ADMIN now?', 'this server is a dictatorship'],
  strike: ['WHAT WAS THAT', 'did the sky just shoot me', 'AIRSTRIKE?? in this game?', 'there are no killstreaks in this mode', 'bro called in the air force'],
  laser: ['A LASER FROM SPACE', 'what is that beam', 'orbital??', 'he has a satellite', 'i just got deleted from orbit'],
  nuke: ['THE WHOLE SERVER DIED', 'did he just delete us', 'everyone died at once', 'what. just. happened.', 'i am calling the developers', 'ctrl alt delete??'],
  bounty: ['why is there a price on my head', 'stop hunting me', 'i am not the bounty, he is', 'why does everyone want me dead'],
  bossGreet: ['FEAR ME', 'i am the raid boss', 'bring it, tiny', 'i was trained on 10000 matches', 'you cannot aim. i can.'],
  bossHurt: ['that tickles', 'ow', 'stop that', 'my health bar!', 'you will pay for that', 'minions, help!'],
  bossDown: ['i... have been... patched out', 'impossible', 'tell my creators... i tried', 'gg i guess'],
  gungame: ['why does he keep switching guns', 'he is speedrunning the arsenal', 'one more gun and he wins', 'STOP HIM BEFORE THE LAST GUN'],
  headsOnly: ['headshots only and he never misses', 'every bullet in the head', 'he is not even aiming at bodies'],
  moon: ['how is he jumping that high', 'moon gravity and aimbot is a crime', 'houston we have a cheater', 'one small step for cheaters'],
  botKill: ['nice', 'got him', 'lol', 'ty'],
};

/* ---------------- BotGuard anticheat + admins ---------------- */
const DET_TIERS = [
  { at: 0, name: 'UNDETECTED', color: '#5fe3a1' },
  { at: 25, name: 'FLAGGED', color: '#ffe24d' },
  { at: 50, name: 'MONITORED', color: '#ffa53c' },
  { at: 75, name: 'UNDER REVIEW', color: '#ff5470' },
  { at: 100, name: 'BANNED', color: '#ff2d55' },
];
const ADMIN_NAMES = ['mod_Greg', 'admin_Linda', 'SysOp_Dave', 'mod_Priya', 'xX_Admin_Xx', 'Moderator_Ken', 'root_Rosa', 'mod_Theo'];
const ADMIN_LINES = {
  join: ['ok what is going on in here', 'got 40 reports, spectating', 'who is the problem', 'reports came in. watching.', 'admin here. play normal.', 'i was eating dinner. this better be good'],
  watching: ['hmm', 'still watching', 'interesting', 'keep playing', 'taking notes', 'recording'],
  clean: ['looks legit to me', 'nothing here, back to dinner', 'he is just good. stop reporting', 'false alarm. closing the ticket', 'cant find anything. gg'],
  kick: ['yeah no. kicked.', 'that was not legit. bye', 'kicking for "suspicious gameplay"', 'enough of that. kicked'],
  bribe: ['...ok i saw nothing', 'transfer received. going afk', 'i am suddenly very busy', 'nice doing business'],
};
CHAT.adminCheer = ['FINALLY AN ADMIN', 'admin spectate him!!', 'ADMIN HE IS RIGHT THERE', 'ban him ban him ban him', 'admin pls'];
CHAT.adminClean = ['WHAT', 'are you blind??', 'the admin is in on it', 'unbelievable', 'he bribed you didnt he'];
CHAT.adminKick = ['GET OUT', 'JUSTICE', 'finally', 'bye cheater', 'the system works'];
CHAT.banned = ['BANNED LMAO', 'ez ban', 'BotGuard actually works??', 'press F', 'enjoy your new account'];
CHAT.jumpshot = ['mid air??', 'he jumped and hit that', 'bro is doing tricks', 'flying headshot lmao', 'show off', 'how do you aim in the air', 'parkour aimbot'];
CHAT.rivalCall = ['{n} is cheating too lol', 'two cheaters in one lobby??', 'report {n} as well', 'is everyone walling today', '{n} has walls, i saw it'];
CHAT.rivalTaunt = ['nice walls. mine are better', 'get a better loader', 'bandit sold you the cheap version', 'imagine paying for that', 'my cheats > your cheats'];
CHAT.rivalDown = ['ok your loader is better', 'how did you beat MY walls', 'refund. refund now', 'my cheat expired mid match'];
CHAT.nade = ['GRENADE', 'nade!!', 'who threw that', 'run', 'it is stuck to me', 'where did that come from', 'why does it follow me'];
CHAT.xbow = ['did he just shoot me with a stick', 'silent but deadly', 'i didnt even hear it', 'robin hood over here'];
CHAT.minigun = ['WHAT IS THAT NOISE', 'he brought a minigun', 'bro is blow drying the map', 'that thing never reloads'];
CHAT.panic = ['wait he stopped hitting everything', 'oh now he misses?', 'he turned it off when the admin came lol', 'suddenly legit'];

const SERVER_LINES = [
  'Thanks for your report. An admin will review it shortly.',
  'Report received. Queue position: #{n}.',
  'Report inbox is full. Please try again later.',
  'Admin status: AFK (last seen {d} days ago).',
  'Vote kick failed: needs an admin to confirm.',
  'BotGuard scan queued. Please continue playing normally.',
  'Your report was forwarded to /dev/null.',
  'Admin vacation mode: enabled until further notice.',
  'Ban hammer not found. Checked under the couch.',
  'Reports are now processed in order of how funny they are.',
  'BotGuard signature database updated. Somewhat.',
  'Server tip: if you are losing, try not losing.',
];

const BANDIT_QUIPS = {
  idle: [
    "First one's cheap. They're always cheap at first.",
    "Everything here is 100% undetected. Mostly. Some of it. Check the risk dots.",
    'Bigger heads, easier hits. That is just science.',
    "Don't tell anyone where you got this.",
    "Refunds? Never heard of 'em.",
    "Chat's mad? Good. Salt sells in the Locker.",
    "Admins only log in when the reports pile up. So don't let them pile up.",
    "You're doing great, champ. Statistically.",
    "I'm not a raccoon. I'm a small business.",
    'Paid in credits. No questions asked.',
    "BotGuard showed up. Don't panic. Well, press P if you have it.",
    'Every cheat makes noise. Run fewer, or run quieter.',
    'Flagged? Play a match with everything off. Lay low.',
    'GHOSTWARE is the best money you will ever spend. Says the guy selling it.',
    'Contracts on the board, kid. Honest work. Sort of.',
    'Ever wanted to call in an airstrike on a bot? Asking for a friend.',
    "Social engineering is just networking with extra steps.",
    'The moon has no admin either. I checked.',
    "Gun game's a great way to try stuff before you buy it. Then buy it.",
    'Raid Boss? Big bot, big wallet. Bring a big gun.',
    'Check the black market. Prices like these fell off a truck.',
    'Come back tomorrow. I give loyal customers a little something.',
    'Grenades are just cheats you throw.',
    'That crossbow? Quietest thing I sell. BotGuard barely hears it.',
    'Daily jobs pay double. I am feeling generous. Do not get used to it.',
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
  { id: 'ffa', name: 'Free-for-all', tag: 'FFA', blurb: 'Everyone shoots everyone. Bots fight each other too.', pay: 1, win: 5, ffa: true },
  { id: 'squad', name: 'Solo vs Squad', tag: '1vN', blurb: 'The whole lobby hunts you as one team. They share your position and keep respawning.', pay: 1.5, win: 8, botAcc: 0.85, respawn: 3.4 , cost: 600 },
  { id: 'tdm', name: 'Team Deathmatch', tag: 'TDM', blurb: 'You and bot teammates against a bot team. Every teammate kill pays you a 25% cut.', pay: 1, win: 6, assist: 0.25 , cost: 2000 },
  { id: 'heads', name: 'Heads Only', tag: 'HS only', blurb: 'Body shots do nothing. Only headshots count. Bots play by the same rule.', pay: 1.8, win: 6, ffa: true , cost: 5000 },
  { id: 'clutch', name: 'Clutch Rounds', tag: 'Rounds', blurb: 'One life per round, no respawns. Wipe the squad to take the round. First to 5.', pay: 1.3, win: 6, botAcc: 0.8, roundBonus: 1.5, rounds: 5, roundTime: 45 , cost: 12000 },
  { id: 'gungame', name: 'Hand-Me-Downs', tag: 'Gun game', blurb: 'Every kill swaps your gun for the next one, owned or not. A kill with the last gun wins.', pay: 1.2, win: 8, ffa: true , cost: 25000 },
  { id: 'boss', name: 'Raid Boss', tag: 'Boss', blurb: 'A giant bot with a giant health bar and a few minions. Take it down before time runs out.', pay: 1, win: 14, botAcc: 0.9 , cost: 60000 },
  { id: 'snipers', name: 'Long Distance', tag: 'Snipers', blurb: 'LDR-50 only, for everyone in your hands. Scope or no-scope, it is all you get.', pay: 1.6, win: 8, ffa: true, weapons: ['sniper'], cost: 100000 },
  { id: 'pistols', name: 'Pistol Party', tag: 'Pistols', blurb: 'Peashooter and Hand Cannon only. Short range, short tempers.', pay: 1.5, win: 8, ffa: true, weapons: ['pistol', 'revolver'], cost: 150000 },
];
const MODE_BY_ID = Object.fromEntries(MODES.map(m => [m.id, m]));
const TEAM_ACCENTS = {
  red: ['#ff5d5d', '#ff7a45', '#ff4f9a', '#ff9a3c', '#e8455e', '#ffb03a'].map(U.hex),
  blue: ['#4dd4ff', '#5b8cff', '#4dffc8', '#7aa2ff', '#43a8ff', '#8be9ff'].map(U.hex),
};
// how a lobby splits up in each mode: bots on your side, bots against you (extra bots always join the enemy)
function lineup(map, modeId, extraBots) {
  const extra = extraBots || 0;
  if (modeId === 'boss') return { allies: 0, foes: 1 + Math.ceil(map.bots / 2) + extra };
  if (modeId === 'tdm') {
    const allies = Math.ceil((map.bots + 1) / 2) - 1;
    return { allies, foes: map.bots - allies + extra };
  }
  return { allies: 0, foes: map.bots + extra };
}
function matchupLabel(map, modeId, extraBots) {
  const l = lineup(map, modeId, extraBots);
  const md = MODE_BY_ID[modeId];
  if (modeId === 'boss') return 'BOSS+' + (l.foes - 1);
  if (md && md.ffa) return l.foes === 1 ? '1v1' : md.id === 'ffa' ? 'FFA' : md.tag.toUpperCase();
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

// the gun order for Hand-Me-Downs: big and silly first, the humble pistol last
const GUNGAME_ORDER = ['launcher', 'minigun', 'rail', 'lmg', 'rifle', 'burst', 'shotgun', 'smg', 'sniper', 'xbow', 'revolver', 'pistol'];

/* ---------------- contracts: Bandit's odd jobs ---------------- */
// stat: which tracked event counts. max: track the best single-match value instead of a running total.
const CONTRACTS = [
  { id: 'kills', text: 'Get {n} kills', stat: 'kill', base: 30, pay: 1 },
  { id: 'hs', text: 'Get {n} headshot kills', stat: 'hs', base: 15, pay: 1.2 },
  { id: 'wall', text: 'Get {n} kills through walls', stat: 'wall', base: 8, pay: 1.6, req: () => Shop.S.wallbang || Save.data.weapons.rail },
  { id: 'multi', text: 'Get {n} multi-kills', stat: 'multi', base: 5, pay: 1.5 },
  { id: 'jump', text: 'Get {n} jump-shot kills', stat: 'jump', base: 5, pay: 1.7 },
  { id: 'rival', text: 'Kill {n} rival cheaters', stat: 'rival', base: 2, pay: 2.5, fixed: true, req: () => Save.data.maps.court },
  { id: 'style', text: 'Score {n} style points in one match', stat: 'style', base: 400, pay: 1.4, max: true },
  { id: 'streak', text: 'Reach a {n}-kill streak in one match', stat: 'streak', base: 8, pay: 1.8, max: true },
  { id: 'wins', text: 'Win {n} matches', stat: 'win', base: 2, pay: 3 },
  { id: 'salt', text: 'Earn {n} salt', stat: 'salt', base: 40, pay: 1.2 },
  { id: 'rq', text: 'Make {n} bots rage quit', stat: 'ragequit', base: 3, pay: 2 },
  { id: 'ez', text: 'Type "ez" in chat {n} times', stat: 'ez', base: 3, pay: 0.8, fixed: true },
  { id: 'weapon', text: 'Get {n} kills with the {a}', stat: 'weapon', base: 20, pay: 1.3, arg: () => U.pick(WEAPONS.filter(w => Save.data.weapons[w.id])).id, label: a => (WEAPON_BY_ID[a] || {}).name },
  { id: 'map', text: 'Play {n} matches on {a}', stat: 'map', base: 2, pay: 1.5, fixed: true, arg: () => U.pick(MAPS.filter(m => Save.data.maps[m.id])).id, label: a => (MAP_BY_ID[a] || {}).name },
  { id: 'mode', text: 'Win a {a} match', stat: 'modewin', base: 1, pay: 5, fixed: true, arg: () => U.pick(MODES.filter(m => m.id !== 'ffa' && Save.data.modes[m.id]).map(m => m.id)), label: a => (MODE_BY_ID[a] || {}).name, req: () => MODES.some(m => m.id !== 'ffa' && Save.data.modes[m.id]) },
  { id: 'calls', text: 'Call in {n} killstreak rewards', stat: 'streakcall', base: 4, pay: 2, req: () => Shop.S.recon },
  { id: 'bounty', text: 'Claim {n} bounties', stat: 'bounty', base: 4, pay: 2, req: () => Shop.S.bounty },
  { id: 'kick', text: 'Kick {n} bots as "admin"', stat: 'kick', base: 4, pay: 1.5, req: () => Shop.S.admin },
];
const CONTRACT_BY_ID = Object.fromEntries(CONTRACTS.map(c => [c.id, c]));

/* ---------------- ranks ---------------- */
const RANKS = [
  'Unranked', 'Wood Bot', 'Plastic I', 'Plastic II', 'Plastic III', 'Aluminum I', 'Aluminum II', 'Steel I', 'Steel II', 'Titanium',
  'Chrome', 'Carbon', 'Plasma', 'Quantum', 'Overclocked', 'Admin Material', 'Totally Legit', 'Legit Legend', 'Server Owner',
];
const RANK_XP = RANKS.map((_, i) => i === 0 ? 0 : Math.round(60 * Math.pow(1.62, i - 1)));

/* ---------------- achievements ---------------- */
const ACH = (id, name, desc, salt, test) => ({ id, name, desc, salt, test });
const ACHIEVEMENTS = [
  ACH('owner', 'Untouchable', 'Buy Server Owner. BotGuard works for you now.', 100, () => !!Save.data.owned.sp6),
  ACH('nade50', 'Pineapple Express', 'Get 50 grenade kills.', 25, s => (s.nadeKills || 0) >= 50),
  ACH('streak7', 'Regular', 'Log in 7 days in a row.', 40, () => ((Save.data.daily || {}).streak || 0) >= 7),
  ACH('market10', 'Bargain Hunter', 'Buy 10 black market deals.', 25, s => (s.marketBuys || 0) >= 10),
  ACH('dailies', 'Clocked In', 'Finish 15 daily jobs.', 30, s => (s.dailiesDone || 0) >= 15),
  ACH('snipers', 'Long Distance Relationship', 'Win a Long Distance match.', 20, s => (s.modeWins || {}).snipers >= 1),
  ACH('pistols', 'Sidearm Supremacy', 'Win a Pistol Party match.', 20, s => (s.modeWins || {}).pistols >= 1),
  ACH('hoarder', 'Hoarder', 'Own 150 cheats.', 60, () => Object.keys(Save.data.owned).filter(k => Save.data.owned[k]).length >= 150),
  ACH('silent', 'Silent Night', 'Get 50 kills with the Pointy Stick.', 25, s => (s.xbowKills || 0) >= 50),
  ACH('rival10', 'Takes One To Know One', 'Kill 10 rival cheaters.', 30, s => (s.rivals || 0) >= 10),
  ACH('wave', 'Survived The Wave', 'Get hit by a BotGuard ban wave.', 15, s => (s.waves || 0) >= 1),
  ACH('pass25', 'Halfway There', 'Reach tier 25 of the Bandit Pass.', 30, s => Math.floor((s.passXp || 0) / PASS_XP) >= 25),
  ACH('pass50', 'Pass Completed', 'Reach tier 50 of the Bandit Pass.', 80, s => Math.floor((s.passXp || 0) / PASS_XP) >= 50),
  ACH('jump25', 'Frequent Flyer', 'Get 25 jump-shot kills.', 20, s => (s.jumpKills || 0) >= 25),
  ACH('noscope', 'Who Needs A Scope', 'Get 10 no-scope kills with the LDR-50.', 25, s => (s.noScopes || 0) >= 10),
  ACH('stylish', 'Totally Stylish', 'Reach the top style rank in a match.', 40, s => (s.topStyleRank || 0) >= 6),
  ACH('ban1', 'Banned', 'Get banned by BotGuard. It happens.', 10, s => (s.bans || 0) >= 1),
  ACH('ghost', 'Never Seen', 'Win a match running 30+ risk worth of cheats without leaving Undetected.', 60, s => (s.ghostWins || 0) >= 1),
  ACH('admin', 'Looks Legit To Me', 'Survive 10 admin spectates.', 40, s => (s.adminsSurvived || 0) >= 10),
  ACH('bribe', 'Business Expense', 'Bribe an admin.', 15, s => (s.bribes || 0) >= 1),
  ACH('first', 'First Blood', 'Get your first kill.', 5, s => s.kills >= 1),
  ACH('k100', 'Warmed Up', 'Get 100 kills.', 10, s => s.kills >= 100),
  ACH('k1k', 'Bot Recycler', 'Get 1,000 kills.', 25, s => s.kills >= 1000),
  ACH('k10k', 'Scrap Yard', 'Get 10,000 kills.', 60, s => s.kills >= 10000),
  ACH('k100k', 'Extinction Event', 'Get 100,000 kills.', 200, s => s.kills >= 100000),
  ACH('hs500', 'Melon Farmer', 'Get 500 headshot kills.', 20, s => s.hs >= 500),
  ACH('w1', 'Winner Winner', 'Win a match.', 5, s => s.wins >= 1),
  ACH('w50', 'Habitual', 'Win 50 matches.', 30, s => s.wins >= 50),
  ACH('w250', 'Can Not Stop', 'Win 250 matches.', 80, s => s.wins >= 250),
  ACH('st10', 'On Fire', 'Reach a 10-kill streak.', 10, s => s.bestStreak >= 10),
  ACH('st50', 'Unstoppable', 'Reach a 50-kill streak.', 40, s => s.bestStreak >= 50),
  ACH('st200', 'It Is Not Even Close', 'Reach a 200-kill streak.', 100, s => s.bestStreak >= 200),
  ACH('cr1m', 'Millionaire', 'Earn 1,000,000 credits in total.', 40, s => s.crEarned >= 1e6),
  ACH('cr1b', 'Billionaire', 'Earn 1,000,000,000 credits in total.', 150, s => s.crEarned >= 1e9),
  ACH('spend', 'Big Spender', 'Spend 500,000 credits at Bandit\'s.', 40, s => s.crSpent >= 5e5),
  ACH('salt1k', 'Salt Of The Earth', 'Collect 1,000 salt.', 30, s => s.saltEarned >= 1000),
  ACH('rq', 'Uninstaller', 'Make 50 bots rage quit.', 30, s => s.ragequits >= 50),
  ACH('rep', 'Most Reported', 'Collect 10,000 reports.', 40, s => s.reports >= 10000),
  ACH('melt', 'Meltdown', 'Push lobby suspicion to 100%.', 15, s => s.peakSus >= 100),
  ACH('squad', 'One Man Army', 'Win a Solo vs Squad match.', 20, s => (s.modeWins || {}).squad >= 1),
  ACH('clutch', 'Clutch King', 'Win a Clutch Rounds series.', 20, s => (s.modeWins || {}).clutch >= 1),
  ACH('tdm', 'Team Player', 'Win a Team Deathmatch.', 15, s => (s.modeWins || {}).tdm >= 1),
  ACH('gg', 'Hand-Me-Up', 'Win a game of Hand-Me-Downs.', 20, s => (s.modeWins || {}).gungame >= 1),
  ACH('heads', 'Neck Up', 'Win a Heads Only match.', 20, s => (s.modeWins || {}).heads >= 1),
  ACH('boss', 'Giant Slayer', 'Take down a Raid Boss.', 30, s => (s.bosses || 0) >= 1),
  ACH('boss10', 'Boss Rush', 'Take down 10 Raid Bosses.', 60, s => (s.bosses || 0) >= 10),
  ACH('nuke', 'Ctrl+Alt+Deleted', 'Delete an entire lobby at once.', 80, s => (s.nukes || 0) >= 1),
  ACH('kick', 'Power Trip', 'Kick 25 bots with Fake Admin.', 25, s => (s.kicks || 0) >= 25),
  ACH('bounty', 'Bounty Hunter', 'Claim 25 bounties.', 25, s => (s.bounties || 0) >= 25),
  ACH('jobs', 'Odd Jobs', 'Finish 10 contracts.', 25, s => (s.contracts || 0) >= 10),
  ACH('jobs50', 'Contractor', 'Finish 50 contracts.', 80, s => (s.contracts || 0) >= 50),
  ACH('hour', 'Touch Grass Later', 'Play for an hour.', 20, s => s.playTime >= 3600),
  ACH('maps', 'World Tour', 'Unlock every lobby.', 60, () => MAPS.every(m => Save.data.maps[m.id])),
  ACH('guns', 'Collector', 'Own every gun.', 50, () => WEAPONS.every(w => Save.data.weapons[w.id])),
  ACH('cheats', 'Fully Loaded', 'Own every cheat Bandit sells.', 150, () => UPGRADES.every(u => Save.data.owned[u.id])),
  ACH('smurf', 'New Account, Who Dis', 'Start over on a fresh account.', 50, () => (Save.data.smurf || 0) >= 1),
  ACH('rank', 'Admin Material', 'Reach the Admin Material rank.', 60, s => (s.xp || 0) >= RANK_XP[15]),
];

/* ---------------- gun attachments (bought with loader parts from rival cheaters, or credits) ---------------- */
const ATTACHMENTS = [
  { id: 'reddot', slot: 'optic', name: 'Red Dot', parts: 2, desc: 'Aiming zooms a little more and tightens spread by another 15%.' },
  { id: 'holo', slot: 'optic', name: 'Holo Sight', parts: 2, desc: 'Aim down sights 50% faster.' },
  { id: 'suppressor', slot: 'muzzle', name: 'Suppressor', parts: 3, desc: 'Kills with this gun raise BotGuard detection 30% less. −10% damage.' },
  { id: 'comp', slot: 'muzzle', name: 'Compensator', parts: 3, desc: '−40% recoil.' },
  { id: 'extmag', slot: 'mag', name: 'Extended Mag', parts: 2, desc: '+40% magazine size.' },
  { id: 'fastmag', slot: 'mag', name: 'Fast Mag', parts: 2, desc: 'Reload 35% faster.' },
];
const ATT_BY_ID = Object.fromEntries(ATTACHMENTS.map(a => [a.id, a]));
const ATT_SLOTS = [['optic', 'Optic'], ['muzzle', 'Muzzle'], ['mag', 'Magazine']];
const ATT_CR_PER_PART = 3000;

/* ---------------- Bandit Pass: 50 tiers on the XP you already earn ---------------- */
const PASS_XP = 150, PASS_TIERS = 50;
const PASS_COSMETICS = [['skin', 'p_raccoon'], ['xhair', 'star'], ['skin', 'p_static'], ['killfx', 'glitchfx'], ['skin', 'p_sunset'],
  ['xhair', 'ringx'], ['skin', 'p_toxic'], ['killfx', 'smoke'], ['xhair', 'hex'], ['skin', 'p_galaxy']];
function passReward(i) {
  if (i % 5 === 0) { const [kind, id] = PASS_COSMETICS[i / 5 - 1]; return { kind, id }; }
  if (i % 5 === 2 || i % 5 === 4) return { kind: 'parts', n: i > 25 ? 2 : 1 };
  return i % 2 ? { kind: 'salt', n: 15 + i * 2 } : { kind: 'cr', n: 10 + i };
}
