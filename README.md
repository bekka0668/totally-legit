# Totally Legit

An incremental first-person shooter about a player who can't aim. You win matches against training bots, take the credits to Bandit (a raccoon who runs a cheat loader), and buy your way from a 1v1 aim room to a 32-bot neon lobby while the lobby chat slowly works out what is going on. There is no anti-cheat. The admin is AFK.

## Play

Double-click `TotallyLegit.html`. It runs offline in any current desktop browser with WebGL 2 (Chrome, Edge, Firefox, Safari). Progress saves in the browser automatically; the Stats tab has a save code you can copy to move it.

| Key | Action |
| --- | --- |
| WASD / Mouse | Move / aim (arrow keys also turn) |
| Left click | Shoot · Right click: scope (LDR-50) |
| Space | Jump (hold to keep hopping) |
| R | Reload |
| 1–6, wheel | Switch weapon |
| Tab | Scoreboard |
| T or Enter | Type in chat (the bots answer) |
| Q / E / F | Freeze Frame / Blink / AFK Farm, once bought |
| Esc | Pause |

## Modes

Pick a mode in FRAGZONE before joining a server. Every map except The Closet supports all four.

| Mode | What happens | Pay |
| --- | --- | --- |
| Free-for-all | Everyone shoots everyone, bots included. Finish 1st to win. | ×1 per kill |
| Solo vs Squad (1vN) | The whole lobby is one team hunting you. They share your position. Win by getting more kills than deaths. | ×1.5 per kill |
| Clutch Rounds | One life per round, no respawns. Wipe the squad to take the round. First to 5. | ×1.3 per kill, plus a bonus per round won |
| Team Deathmatch | You and bot teammates against a bot team. No friendly fire. | ×1 per kill, plus 25% of every teammate kill |

Cheats that add bots always add them to the enemy team. Wallhack and aimbot ignore teammates.

## How it plays

- **Credits** come from kills, headshots, streaks and winning. Spend them at **Bandit's** on 65 upgrades across 10 cheat modules (aimbot, wallhack, triggerbot, hitbox expander, no spread, speedhack, ammo, godmode, money hacks, server tricks), on guns in the **Arsenal**, and on unlocking bigger lobbies.
- **Salt** drops when the chat gets angry. The more obvious you are (snap aim, wall kills, spinning, teleporting) the saltier the lobby. Spend salt in the **Locker** on gun finishes, crosshairs and kill effects.
- **AFK Farm** plays matches for you and queues the next one.
- **New account** (Stats tab): once you own every lobby and 40 cheats, start over for a permanent credit multiplier.

## Files

- `TotallyLegit.html` is the whole game in one file, built from `src/`. `index.html` is the same file, for GitHub Pages.
- `src/js/` holds the code: `gl.js` (WebGL renderer), `world.js` (maps, collision, pathfinding), `match.js` (gameplay, bots, cheats), `chat.js` (lobby chat and suspicion), `hub.js` / `hud.js` (UI), `data.js` (weapons, cheat trees, maps, chat lines).
- After editing `src/`, rebuild with `node build.js`.

For testing there is a console hook, `TL_DEBUG` (for example `TL_DEBUG.give(5000)` adds credits). Fitting, for a game about cheating.

Everything here is original: the name, Bandit, the BOTCAMP servers, the maps, the robots and all the art are made from code, and every sound is synthesized.
