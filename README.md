# Totally Legit

An incremental first-person shooter about a player who can't aim. You win matches against training bots, take the credits to Bandit (a raccoon who runs a cheat loader), and buy your way from a 1v1 aim room to a 32-bot neon lobby while the lobby chat slowly works out what is going on. The servers run an anticheat called BotGuard, and an admin logs in when the reports pile up.

## Play

Double-click `TotallyLegit.html`. It runs offline in any current desktop browser with WebGL 2 (Chrome, Edge, Firefox, Safari). Progress saves in the browser automatically; the Stats tab has a save code you can copy to move it.

| Key | Action |
| --- | --- |
| WASD / Mouse | Move / aim (arrow keys also turn) |
| Left click | Shoot · Right click: aim down sights (scope on the LDR-50) |
| Space | Jump (hold to keep hopping once you own Bunny Hop) |
| R | Reload |
| 1–9, wheel | Switch weapon |
| Tab | Scoreboard |
| T or Enter | Type in chat (the bots answer) |
| Q / E / F | Freeze Frame / Blink / AFK Farm, once bought |
| X / G / V | Orbital Laser / Fake Admin kick / Bullet Time, once bought |
| P | Panic Key: unload every cheat (GHOSTWARE) |
| Esc | Pause |

## Modes

Pick a mode before joining a server. You start with Free-for-all only (The Closet is a 1v1). The rest unlock in order with credits, from the Play tab: Solo vs Squad (600), Team Deathmatch (2,000), Heads Only (5,000), Clutch Rounds (12,000), Hand-Me-Downs (25,000), Raid Boss (60,000).

| Mode | What happens | Pay |
| --- | --- | --- |
| Free-for-all | Everyone shoots everyone, bots included. Finish 1st to win. | ×1 per kill |
| Solo vs Squad (1vN) | The whole lobby is one team hunting you. They share your position. Win by getting more kills than deaths. | ×1.5 per kill |
| Clutch Rounds | One life per round, no respawns. Wipe the squad to take the round. First to 5. | ×1.3 per kill, plus a bonus per round won |
| Team Deathmatch | You and bot teammates against a bot team. No friendly fire. | ×1 per kill, plus 25% of every teammate kill |
| Hand-Me-Downs | Gun game: every kill swaps your gun for the next one, owned or not. A kill with the last gun wins. | ×1.2 per kill |
| Heads Only | Body shots do nothing. Bots play by the same rule. | ×1.8 per kill |
| Raid Boss | A giant bot with a big health bar, plus minions. Take it down before time runs out. | ×1 per kill, the boss pays 25× |

Cheats that add bots always add them to the enemy team. Wallhack and aimbot ignore teammates.

## How it plays

- **Credits** come from kills, headshots, streaks and winning. Spend them at **Bandit's** on 105 upgrades across 17 cheat modules (aimbot, wallhack, triggerbot, hitbox expander, no spread, speedhack, ammo, godmode, money hacks, server tricks, killstreak rewards, social hacks, weapon mods, time tricks, economy hacks, and two stealth modules), on 9 guns in the **Arsenal**, and on unlocking 9 lobbies, up to a low-gravity Moon Base with 40 bots.
- **BotGuard** is the anticheat. Every cheat has a detection risk, and BotGuard scans you every 20 s during a match, so running everything at once gets you caught fast. Obvious plays (wall kills, snaps, spinning, abilities) add more. Detection carries between matches and cools off after each one, faster if you play a match with nothing loaded.
  - At 25 / 50 / 75% you're Flagged / Monitored / Under Review. At 100% you're **banned**: that match's credits are confiscated and you pay a 10% wallet fine.
  - Enough chat reports bring an **admin** to spectate you for 22 s. If you look dirty while they watch, they kick you and you lose half the match's credits.
  - **GHOSTWARE** and **SPOOFER** are the stealth modules: scramble signatures, humanize your aim, hit **P** to unload everything, bribe admins, spoof your hardware ID, auto-appeal bans.
- **Streaks and style**: your kill streak multiplies kill credits (×1.1 at 3, ×1.25 at 5, ×1.5 at 10, ×2 at 20). Flashy kills score **style points**: jump shots (+40, +30 more for a mid-air headshot), no-scopes, long shots, last-bullet kills, revenge, quick swaps, low-health clutches, wallbangs. Points fill a style meter from MID up to TOTALLY LEGIT that multiplies kill credits up to ×2 and drains when you stop killing. Every point also pays out at the end of the match.
- **Contracts** on the Play tab are Bandit's odd jobs (get 30 headshots, win a Raid Boss match, type "ez" three times...). Claim them for credits and salt, or swap one for 10 salt.
- **Ranks** go from Wood Bot to Server Owner. XP comes from kills, wins and contracts, and every rank-up pays salt.
- **Achievements**: 41 of them on the Stats tab, each paying salt.
- **Salt** drops when the chat gets angry. The more obvious you are (snap aim, wall kills, spinning, teleporting) the saltier the lobby. Spend salt in the **Locker** on gun finishes, crosshairs and kill effects.
- **AFK Farm** plays matches for you and queues the next one.
- **New account** (Stats tab): once you own every lobby and 40 cheats, start over for a permanent credit multiplier.

## Files

- `TotallyLegit.html` is the whole game in one file, built from `src/`. `index.html` is the same file, for GitHub Pages.
- `src/js/` holds the code: `gl.js` (WebGL renderer), `world.js` (maps, collision, pathfinding), `match.js` (gameplay, bots, cheats), `extras.js` (killstreaks, social hacks, weapon/time/economy mods, raid boss, gun game, contracts, ranks, achievements), `anticheat.js` (BotGuard detection, admins, kicks and bans), `chat.js` (lobby chat and suspicion), `hub.js` / `hud.js` (UI), `data.js` (weapons, cheat trees, maps, chat lines).
- After editing `src/`, rebuild with `node build.js`.

For testing there is a console hook, `TL_DEBUG` (for example `TL_DEBUG.give(5000)` adds credits). Fitting, for a game about cheating.

Everything here is original: the name, Bandit, the BOTCAMP servers, the maps, the robots and all the art are made from code, and every sound is synthesized.
