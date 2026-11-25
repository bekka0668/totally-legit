'use strict';
/* =========================================================================
   Box models: training bots, weapons + hands, Bandit the raccoon, showroom
   ========================================================================= */
const COL_DARK = U.hex('#24262c'), COL_LIGHT = U.hex('#8d96a3'), COL_GLOVE = U.hex('#262a31'), COL_SLEEVE = U.hex('#34456a');
const BOT_ACCENTS = ['#ff5d5d', '#4dd4ff', '#ffd23f', '#7cff7c', '#ff8bd8', '#a98bff', '#ff9a3c', '#4dffc8', '#ff4f9a', '#c6ff4d'].map(U.hex);
const BOT_BODIES = ['#dfe3ea', '#d9d3c8', '#cfd8e3', '#e6e1d8', '#c9ccd3'].map(U.hex);

// parts: [x, y, z, sx, sy, sz, slot, rx, ry]
// slots: 0 skin main, 1 skin secondary, 2 dark metal, 3 glowing sight, 4 light metal
const GUNS = {
  pistol: {
    parts: [
      [0, 0.045, -0.06, 0.036, 0.034, 0.2, 0], [0, 0.015, -0.05, 0.032, 0.03, 0.17, 1],
      [0, 0.046, -0.162, 0.018, 0.018, 0.012, 2], [0, -0.045, 0.012, 0.03, 0.1, 0.042, 1, -0.28],
      [0, -0.008, -0.035, 0.008, 0.025, 0.04, 2], [0, 0.066, -0.145, 0.007, 0.012, 0.008, 3],
      [0, 0.066, 0.03, 0.024, 0.012, 0.008, 2],
    ],
    muzzle: [0, 0.046, -0.175], left: null,
  },
  smg: {
    parts: [
      [0, 0.04, -0.08, 0.05, 0.06, 0.26, 0], [0, 0.045, -0.255, 0.024, 0.024, 0.1, 2], [0, 0.07, -0.2, 0.03, 0.012, 0.07, 1],
      [0, -0.035, 0.005, 0.034, 0.1, 0.04, 1, -0.22], [0, -0.065, -0.1, 0.03, 0.13, 0.04, 1, 0.12],
      [0, 0.035, 0.11, 0.03, 0.035, 0.14, 1], [0, 0.0, 0.17, 0.03, 0.09, 0.025, 1],
      [0, 0.084, -0.05, 0.018, 0.022, 0.035, 2], [0, 0.098, -0.05, 0.007, 0.008, 0.006, 3],
    ],
    muzzle: [0, 0.045, -0.31], left: [-0.005, -0.03, -0.16],
  },
  shotgun: {
    parts: [
      [0, 0.06, -0.27, 0.04, 0.04, 0.46, 2], [0, 0.028, -0.26, 0.036, 0.03, 0.4, 2], [0, 0.024, -0.24, 0.054, 0.044, 0.16, 1],
      [0, 0.045, 0.0, 0.056, 0.07, 0.2, 0], [0, 0.012, 0.2, 0.046, 0.08, 0.24, 0, 0.12],
      [0, -0.04, 0.05, 0.036, 0.09, 0.04, 1, -0.3], [0, 0.088, -0.48, 0.009, 0.012, 0.01, 3],
    ],
    muzzle: [0, 0.06, -0.5], left: [-0.005, 0.0, -0.24], pump: true,
  },
  rifle: {
    parts: [
      [0, 0.04, -0.05, 0.05, 0.07, 0.32, 0], [0, 0.045, -0.3, 0.05, 0.055, 0.2, 1], [0, 0.05, -0.46, 0.02, 0.02, 0.13, 2],
      [0, 0.05, -0.53, 0.03, 0.03, 0.03, 2], [0, -0.065, -0.1, 0.035, 0.14, 0.06, 1, 0.25],
      [0, -0.05, 0.05, 0.034, 0.1, 0.04, 1, -0.25], [0, 0.025, 0.22, 0.042, 0.08, 0.2, 0],
      [0, 0.1, -0.08, 0.03, 0.035, 0.1, 2], [0, 0.1, -0.132, 0.024, 0.024, 0.006, 3], [0, 0.081, -0.08, 0.04, 0.008, 0.22, 2],
    ],
    muzzle: [0, 0.05, -0.55], left: [-0.005, -0.005, -0.28],
  },
  burst: {
    parts: [
      [0, 0.04, -0.06, 0.052, 0.07, 0.3, 0], [0, 0.045, -0.29, 0.046, 0.05, 0.18, 1], [0, 0.05, -0.43, 0.022, 0.022, 0.12, 2],
      [0, 0.05, -0.5, 0.034, 0.034, 0.03, 2], [0, -0.06, -0.06, 0.034, 0.12, 0.05, 1, 0.12], [0, -0.05, 0.06, 0.034, 0.1, 0.04, 1, -0.25],
      [0, 0.03, 0.21, 0.044, 0.085, 0.18, 0], [0, 0.088, -0.1, 0.03, 0.012, 0.26, 2], [0, 0.104, -0.04, 0.026, 0.024, 0.05, 2],
      [0, 0.104, -0.068, 0.02, 0.02, 0.006, 3], [0.03, 0.04, -0.12, 0.008, 0.03, 0.12, 3],
    ],
    muzzle: [0, 0.05, -0.52], left: [-0.005, -0.005, -0.27],
  },
  sniper: {
    parts: [
      [0, 0.03, -0.05, 0.05, 0.07, 0.4, 0], [0, 0.04, -0.5, 0.026, 0.026, 0.55, 2], [0, 0.04, -0.79, 0.042, 0.042, 0.06, 2],
      [0, 0.105, -0.06, 0.044, 0.044, 0.3, 2], [0, 0.105, -0.215, 0.052, 0.052, 0.02, 2], [0, 0.105, -0.226, 0.036, 0.036, 0.004, 3],
      [0, 0.072, -0.06, 0.02, 0.025, 0.06, 2], [0, 0.0, 0.28, 0.046, 0.1, 0.26, 0], [0, -0.05, 0.08, 0.034, 0.1, 0.04, 1, -0.3],
      [0, -0.045, -0.06, 0.034, 0.07, 0.07, 1], [0, 0.042, -0.28, 0.056, 0.05, 0.16, 1],
    ],
    muzzle: [0, 0.04, -0.82], left: [-0.005, -0.005, -0.28],
  },
  revolver: {
    parts: [
      [0, 0.05, -0.1, 0.03, 0.03, 0.22, 2], [0, 0.04, -0.005, 0.056, 0.056, 0.07, 0], [0, 0.04, -0.005, 0.06, 0.02, 0.06, 1],
      [0, 0.06, 0.05, 0.034, 0.05, 0.05, 0], [0, -0.04, 0.06, 0.032, 0.11, 0.045, 1, -0.32], [0, 0.072, -0.2, 0.008, 0.014, 0.01, 3],
      [0, 0.088, 0.07, 0.01, 0.02, 0.02, 2], [0, -0.01, 0.0, 0.008, 0.03, 0.04, 2],
    ],
    muzzle: [0, 0.05, -0.22], left: null,
  },
  lmg: {
    parts: [
      [0, 0.04, -0.06, 0.07, 0.09, 0.36, 0], [0, 0.05, -0.36, 0.05, 0.06, 0.26, 1], [0, 0.05, -0.58, 0.026, 0.026, 0.2, 2],
      [0, -0.05, -0.08, 0.1, 0.1, 0.12, 2], [0, -0.085, -0.08, 0.104, 0.03, 0.124, 1], [0, -0.06, 0.07, 0.036, 0.1, 0.045, 1, -0.25],
      [0, 0.03, 0.25, 0.05, 0.09, 0.22, 0], [0, 0.11, -0.04, 0.05, 0.03, 0.18, 2], [0, 0.11, -0.14, 0.024, 0.024, 0.006, 3],
      [0.03, -0.02, -0.62, 0.008, 0.09, 0.008, 2, 0.3], [-0.03, -0.02, -0.62, 0.008, 0.09, 0.008, 2, 0.3],
    ],
    muzzle: [0, 0.05, -0.69], left: [-0.005, -0.005, -0.34],
  },
  launcher: {
    parts: [
      [0, 0.06, -0.16, 0.1, 0.1, 0.76, 0], [0, 0.06, -0.55, 0.12, 0.12, 0.04, 1], [0, 0.06, 0.22, 0.12, 0.12, 0.04, 1],
      [0, 0.06, -0.56, 0.07, 0.07, 0.02, 3], [0, -0.04, -0.02, 0.034, 0.11, 0.045, 1, -0.2], [0, -0.04, -0.24, 0.03, 0.09, 0.04, 1, 0.15],
      [0.07, 0.11, -0.1, 0.03, 0.05, 0.12, 2], [0.07, 0.11, -0.17, 0.02, 0.02, 0.006, 3],
    ],
    muzzle: [0, 0.06, -0.58], left: [-0.005, -0.03, -0.26],
  },
  rail: {
    parts: [
      [0, 0.04, -0.05, 0.07, 0.09, 0.4, 0], [0, 0.088, -0.36, 0.05, 0.016, 0.42, 4], [0, -0.002, -0.36, 0.05, 0.016, 0.42, 4],
      [0, 0.043, -0.22, 0.08, 0.08, 0.025, 3], [0, 0.043, -0.33, 0.08, 0.08, 0.025, 3], [0, 0.043, -0.44, 0.08, 0.08, 0.025, 3],
      [0, -0.05, 0.06, 0.036, 0.1, 0.045, 1, -0.25], [0, 0.03, 0.22, 0.05, 0.09, 0.2, 0], [0.047, 0.05, 0.0, 0.022, 0.06, 0.12, 3],
    ],
    muzzle: [0, 0.043, -0.58], left: [-0.005, -0.03, -0.17],
  },
};

const RACCOON = {
  grey: U.hex('#8a8c97'), light: U.hex('#e8e3d9'), black: U.hex('#17151b'), hoodie: U.hex('#e0408a'), hoodie2: U.hex('#a92b67'),
  jeans: U.hex('#2c3550'), shoe: U.hex('#f2f2f2'), steel: U.hex('#c9ced6'), led: U.hex('#7cffb2'), white: U.hex('#ffffff'),
};

const Models = {
  m: M4.create(), m2: M4.create(), m3: M4.create(), m4: M4.create(),
  _fl: false, _fz: false,

  pc(B, m, sx, sy, sz, c, e, pat, spec) {
    let r = c[0], g = c[1], bl = c[2];
    if (this._fl) { r = 1; g = 1; bl = 1; e = 0.55; }
    else if (this._fz) { r = r * 0.4 + 0.42; g = g * 0.45 + 0.56; bl = bl * 0.35 + 0.72; }
    GFX.push(B, m, sx, sy, sz, r, g, bl, 1, pat || 0, e || 0, spec == null ? 0.25 : spec, 0);
  },

  /* ---- training bot ---- */
  bot(B, b, hv, frozen, t) {
    const m = this.m, m2 = this.m2, m3 = this.m3;
    this._fl = b.hitFlash > 0; this._fz = frozen;
    M4.ident(m); M4.translate(m, m, b.pos[0], b.pos[1], b.pos[2]); M4.rotY(m, m, b.yaw);
    if (b.scale && b.scale !== 1) M4.scaleU(m, m, b.scale);
    const ma = frozen ? 0 : (b.moveAmt || 0), ph = b.walkPhase || 0;
    const sw = Math.sin(ph) * 0.65 * ma, bob = Math.abs(Math.cos(ph)) * 0.05 * ma;
    const body = b.col.body, dark = b.col.dark, acc = b.col.acc;
    for (const s of [-1, 1]) {
      M4.translate(m2, m, s * 0.12, 0.8, 0); M4.rotX(m2, m2, sw * s); M4.translate(m2, m2, 0, -0.39, 0);
      this.pc(B, m2, 0.17, 0.78, 0.2, dark);
      M4.translate(m2, m2, 0, -0.36, -0.05); this.pc(B, m2, 0.19, 0.08, 0.3, dark);
    }
    M4.translate(m2, m, 0, 0.84 + bob, 0); this.pc(B, m2, 0.42, 0.16, 0.25, dark);
    M4.translate(m2, m, 0, 1.15 + bob, 0); this.pc(B, m2, 0.52, 0.5, 0.3, body);
    M4.translate(m2, m, 0, 1.2 + bob, -0.155); this.pc(B, m2, 0.36, 0.24, 0.03, acc, 0.2);
    M4.translate(m2, m, 0, 1.14 + bob, 0.2); this.pc(B, m2, 0.34, 0.36, 0.12, dark);
    M4.translate(m2, m, 0, 1.22 + bob, 0.265); this.pc(B, m2, 0.18, 0.07, 0.03, acc, 0.9);
    // head
    M4.translate(m2, m, 0, 1.47 + bob, 0); M4.rotX(m2, m2, (b.aimPitch || 0) * 0.6);
    M4.translate(m2, m2, 0, 0.15 * hv, 0);
    this.pc(B, m2, 0.34 * hv, 0.3 * hv, 0.32 * hv, body);
    M4.translate(m3, m2, 0, 0.02 * hv, -0.16 * hv); this.pc(B, m3, 0.27 * hv, 0.08 * hv, 0.03 * hv, acc, 1);
    M4.translate(m3, m2, 0.1 * hv, 0.2 * hv, 0.05 * hv); this.pc(B, m3, 0.025 * hv, 0.14 * hv, 0.025 * hv, dark);
    M4.translate(m3, m2, 0.1 * hv, 0.29 * hv, 0.05 * hv); this.pc(B, m3, 0.06 * hv, 0.06 * hv, 0.06 * hv, acc, 0.5 + 0.5 * Math.sin(t * 6 + b.id));
    // arms + gun
    M4.translate(m2, m, 0, 1.33 + bob, 0); M4.rotX(m2, m2, b.aimPitch || 0);
    M4.translate(m3, m2, 0.31, -0.05, -0.12); this.pc(B, m3, 0.12, 0.13, 0.34, body);
    M4.translate(m3, m2, -0.2, -0.07, -0.2); M4.rotY(m3, m3, -0.55); this.pc(B, m3, 0.12, 0.13, 0.34, body);
    M4.translate(m3, m2, 0.12, -0.1, -0.42); this.pc(B, m3, 0.08, 0.12, 0.46, COL_DARK);
    M4.translate(m3, m2, 0.12, -0.035, -0.42); this.pc(B, m3, 0.03, 0.025, 0.3, acc, 0.7);
    this._fl = false; this._fz = false;
  },
  botMuzzle(b, out) {
    const m = this.m4;
    M4.ident(m); M4.translate(m, m, b.pos[0], b.pos[1], b.pos[2]); M4.rotY(m, m, b.yaw);
    if (b.scale && b.scale !== 1) M4.scaleU(m, m, b.scale);
    M4.translate(m, m, 0, 1.33, 0); M4.rotX(m, m, b.aimPitch || 0);
    return M4.transformPoint(out || [0, 0, 0], m, [0.12, -0.1, -0.66]);
  },
  shadow(B, x, y, z, s) { GFX.pushAA(B, x, y + 0.02, z, s, 0.02, s, 0, 0, 0, 0.3, 0, 1, 0, 0); },

  /* ---- weapons ---- */
  skinCols(skinId) {
    const sk = SKIN_BY_ID[skinId] || SKINS[0];
    if (!sk._c0) { sk._c0 = U.hex(sk.c0); sk._c1 = U.hex(sk.c1); sk._p0 = U.packRGB(sk.c1); sk._p1 = U.packRGB(sk.c0); }
    return sk;
  },
  gun(B, base, wid, skinId, o) {
    const G = GUNS[wid] || GUNS.pistol, sk = this.skinCols(skinId), m = this.m;
    const sight = o.sight || [0.5, 1, 0.7];
    for (const p of G.parts) {
      M4.translate(m, base, p[0], p[1], p[2]);
      if (p[8]) M4.rotY(m, m, p[8]);
      if (p[7]) M4.rotX(m, m, p[7]);
      let c, pat = 0, e = 0, spec = 0.3, sec = 0;
      switch (p[6]) {
        case 0: c = sk._c0; pat = sk.pat; spec = sk.spec; sec = sk._p0; break;
        case 1: c = sk._c1; pat = (sk.pat === 5 || sk.pat === 6 || sk.pat === 13) ? sk.pat : 0; spec = sk.spec * 0.6; sec = sk._p1; break;
        case 2: c = COL_DARK; spec = 0.55; break;
        case 3: c = sight; e = 1; break;
        default: c = COL_LIGHT; spec = 0.9;
      }
      GFX.push(B, m, p[3], p[4], p[5], c[0], c[1], c[2], 1, pat, e, spec, sec);
    }
    // attachments
    const at = o.att;
    if (at) {
      const mz = G.muzzle;
      if (at.suppressor) { M4.translate(m, base, mz[0], mz[1], mz[2] - 0.08); GFX.push(B, m, 0.046, 0.046, 0.17, COL_DARK[0], COL_DARK[1], COL_DARK[2], 1, 0, 0, 0.5, 0); }
      if (at.comp) { M4.translate(m, base, mz[0], mz[1], mz[2] - 0.025); GFX.push(B, m, 0.052, 0.042, 0.05, COL_LIGHT[0], COL_LIGHT[1], COL_LIGHT[2], 1, 0, 0, 0.9, 0); }
      const sp = G.parts.find(q => q[6] === 3);
      if (sp && (at.reddot || at.holo)) {
        M4.translate(m, base, sp[0], sp[1] - 0.016, sp[2] + 0.02); GFX.push(B, m, 0.05, 0.016, 0.06, COL_DARK[0], COL_DARK[1], COL_DARK[2], 1, 0, 0, 0.5, 0);
        M4.translate(m, base, sp[0], sp[1] + 0.004, sp[2] + 0.04); GFX.push(B, m, 0.05, 0.03, 0.006, COL_DARK[0], COL_DARK[1], COL_DARK[2], 1, 0, 0, 0.5, 0);
        const c = at.reddot ? [1, 0.2, 0.2] : [0.3, 0.9, 1];
        M4.translate(m, base, sp[0], sp[1], sp[2] - 0.004); GFX.push(B, m, 0.012, 0.012, 0.004, c[0], c[1], c[2], 1, 0, 1, 0, 0);
      }
      if (at.extmag) { M4.translate(m, base, 0, -0.07, mz[2] * 0.25); GFX.push(B, m, 0.03, 0.09, 0.05, COL_DARK[0], COL_DARK[1], COL_DARK[2], 1, 0, 0, 0.4, 0); }
    }
    if (o.hands) {
      // right hand + forearm
      M4.translate(m, base, 0.0, -0.045, 0.03); M4.rotX(m, m, -0.28);
      GFX.push(B, m, 0.062, 0.075, 0.072, COL_GLOVE[0], COL_GLOVE[1], COL_GLOVE[2], 1, 0, 0, 0.1, 0);
      M4.translate(m, base, 0.035, -0.115, 0.16); M4.rotY(m, m, 0.25); M4.rotX(m, m, 0.55);
      GFX.push(B, m, 0.07, 0.07, 0.26, COL_SLEEVE[0], COL_SLEEVE[1], COL_SLEEVE[2], 1, 0, 0, 0.1, 0);
      if (G.left) {
        const l = G.left, pump = G.pump ? (o.pump || 0) * 0.06 : 0;
        M4.translate(m, base, l[0], l[1], l[2] + pump);
        GFX.push(B, m, 0.058, 0.055, 0.085, COL_GLOVE[0], COL_GLOVE[1], COL_GLOVE[2], 1, 0, 0, 0.1, 0);
        M4.translate(m, base, l[0] - 0.08, l[1] - 0.075, l[2] + pump + 0.12); M4.rotY(m, m, -0.75); M4.rotX(m, m, 0.45);
        GFX.push(B, m, 0.065, 0.065, 0.28, COL_SLEEVE[0], COL_SLEEVE[1], COL_SLEEVE[2], 1, 0, 0, 0.1, 0);
      }
    }
  },

  /* ---- Bandit, the raccoon who sells you everything ---- */
  raccoon(B, t, base) {
    const m = this.m, h = this.m2, tl = this.m3, R = RACCOON;
    const bob = Math.sin(t * 2.1) * 0.015;
    const P = (mat, x, y, z, sx, sy, sz, c, e) => { M4.translate(m, mat, x, y, z); GFX.push(B, m, sx, sy, sz, c[0], c[1], c[2], 1, 0, e || 0, 0.15, 0); };
    // legs + shoes
    for (const s of [-1, 1]) { P(base, s * 0.16, 0.22, 0, 0.2, 0.44, 0.24, R.jeans); P(base, s * 0.16, 0.04, -0.05, 0.22, 0.08, 0.34, R.shoe); }
    // hoodie body
    P(base, 0, 0.78 + bob, 0, 0.72, 0.74, 0.5, R.hoodie);
    P(base, 0, 0.5 + bob, -0.02, 0.74, 0.12, 0.52, R.hoodie2);
    P(base, 0, 0.72 + bob, -0.255, 0.36, 0.16, 0.02, R.hoodie2);
    // arms, paws, USB stick
    P(base, 0.44, 0.84 + bob, -0.05, 0.17, 0.5, 0.2, R.hoodie);
    P(base, -0.44, 0.84 + bob, -0.05, 0.17, 0.5, 0.2, R.hoodie);
    P(base, 0.44, 0.55 + bob, -0.09, 0.15, 0.13, 0.15, R.black);
    P(base, -0.44, 0.55 + bob, -0.09, 0.15, 0.13, 0.15, R.black);
    P(base, 0.44, 0.52 + bob, -0.22, 0.07, 0.045, 0.16, R.steel);
    P(base, 0.44, 0.52 + bob, -0.31, 0.04, 0.025, 0.03, R.led, 1);
    // tail
    M4.translate(tl, base, 0, 0.42, 0.26); M4.rotY(tl, tl, Math.sin(t * 1.7) * 0.35);
    const tc = [R.grey, R.black, R.grey, R.black, R.grey];
    for (let i = 0; i < 5; i++) {
      const s = 0.24 - i * 0.02;
      M4.translate(m, tl, 0, 0.05 + i * 0.12, 0.1 + i * 0.12 - i * i * 0.012);
      GFX.push(B, m, s, s, 0.16, tc[i][0], tc[i][1], tc[i][2], 1, 0, 0, 0.1, 0);
    }
    // head
    M4.translate(h, base, 0, 1.2 + bob, 0); M4.rotY(h, h, Math.sin(t * 0.6) * 0.25); M4.rotZ(h, h, Math.sin(t * 0.9) * 0.05);
    P(h, 0, 0.0, 0.12, 0.66, 0.32, 0.32, R.hoodie2); // hood
    P(h, 0, 0.22, 0, 0.62, 0.5, 0.52, R.grey);
    P(h, 0, 0.11, -0.27, 0.32, 0.2, 0.12, R.light);
    P(h, 0, 0.16, -0.34, 0.1, 0.07, 0.05, R.black);
    P(h, 0, 0.29, -0.262, 0.6, 0.14, 0.02, R.black);
    for (const s of [-1, 1]) {
      P(h, s * 0.135, 0.295, -0.274, 0.08, 0.08, 0.02, R.white, 0.4);
      P(h, s * 0.13, 0.29, -0.286, 0.038, 0.045, 0.01, R.black);
      P(h, s * 0.15, 0.39, -0.262, 0.14, 0.04, 0.02, R.light);
      const tw = s > 0 ? Math.max(0, Math.sin(t * 3.3)) * 0.2 : 0;
      M4.translate(m, h, s * 0.23, 0.53, 0.02); M4.rotZ(m, m, -s * (0.15 + tw));
      GFX.push(B, m, 0.15, 0.17, 0.1, R.grey[0], R.grey[1], R.grey[2], 1, 0, 0, 0.1, 0);
      M4.translate(m, m, 0, -0.01, -0.055);
      GFX.push(B, m, 0.08, 0.1, 0.02, R.black[0], R.black[1], R.black[2], 1, 0, 0, 0.1, 0);
    }
  },
};

/* ---------------- hub showroom scene ---------------- */
const STUDIO_ENV = { zenith: '#0a1022', horizon: '#18213d', sun: [-0.55, -0.75, -0.6], sunCol: '#fff6ea', sky: '#c4d2f0', gnd: '#3a4058', fog: '#0c1226', fogDen: 0.05, stars: 0.35, clouds: 0, ao: 0.5 };

const Showroom = {
  fakeBot: null,
  setup() {
    const inst = [];
    const add = (cx, cy, cz, sx, sy, sz, col, pat, emis) => { const c = U.hex(col); inst.push([cx, cy, cz, sx, sy, sz, c[0], c[1], c[2], pat || 0, emis || 0, 0, 0]); };
    add(0, -0.5, 0, 80, 1, 80, '#121a33', 1);
    add(0, 0.09, 0, 3.0, 0.18, 3.0, '#1a2444', 0);
    add(0, 0.09, 0, 3.08, 0.05, 3.08, '#ffd23f', 0, 0.9);
    add(0, 2.5, -7, 30, 5, 0.4, '#141d3a', 1);
    for (let i = -4; i <= 4; i++) add(i * 3, 2.5, -6.75, 0.08, 5, 0.1, '#ffd23f', 0, 0.35);
    GFX.setStatic(inst);
    GFX.setEnv(STUDIO_ENV);
    this.fakeBot = {
      id: 3, pos: [0, 0.2, 0], yaw: 0, aimPitch: 0, moveAmt: 0, walkPhase: 0, hitFlash: 0,
      col: { body: BOT_BODIES[0], dark: U.hex('#3a3f4a'), acc: BOT_ACCENTS[1] },
    };
  },
  submit(kind, t, opt) {
    const B = GFX.b.dyn, m = Models.m4;
    // turntable
    M4.ident(m); M4.translate(m, m, 0, 0.2, 0); M4.rotY(m, m, t * 0.4);
    GFX.push(B, m, 2.4, 0.06, 2.4, 0.16, 0.2, 0.32, 1, 1, 0, 0.3, 0);
    M4.rotY(m, m, Math.PI / 4);
    GFX.push(B, m, 2.4, 0.06, 2.4, 0.16, 0.2, 0.32, 1, 1, 0, 0.3, 0);
    if (kind === 'bot') {
      const b = this.fakeBot;
      b.yaw = t * 0.4 + Math.PI * 0.15;
      b.aimPitch = Math.sin(t * 0.7) * 0.15;
      b.pos[1] = 0.23;
      Models.bot(B, b, 1, false, t);
      Models.shadow(GFX.b.trans, 0, 0.23, 0, 1.0);
    } else if (kind === 'raccoon') {
      M4.ident(m); M4.translate(m, m, 0, 0.23, 0); M4.rotY(m, m, Math.PI - 0.35 + Math.sin(t * 0.35) * 0.35);
      Models.raccoon(B, t, m);
      Models.shadow(GFX.b.trans, 0, 0.23, 0, 1.1);
    } else if (kind === 'gun') {
      M4.ident(m); M4.translate(m, m, 0, 1.25 + Math.sin(t * 1.4) * 0.05, 0); M4.rotY(m, m, t * 0.6); M4.rotZ(m, m, 0.12);
      const s = 3.2;
      for (let i = 0; i < 12; i++) if (i % 4 !== 3) m[i] *= s;
      Models.gun(B, m, opt.weapon, opt.skin, { sight: opt.sight, hands: false, att: Shop.attOf(opt.weapon) });
      Models.shadow(GFX.b.trans, 0, 0.23, 0, 1.4);
    }
  },
  // ndcX: where on screen (-1..1) the subject should sit, so it lands in the space the hub panel leaves free
  camera(kind, ndcX) {
    const dist = kind === 'gun' ? 4.6 : kind === 'raccoon' ? 5.6 : 4.8;
    const fovy = 52 * DEG, t = Math.tan(fovy / 2) * GFX.aspect;
    const ox = GFX.aspect > 1.15 ? -(ndcX || 0) * t * dist : 0;
    return { eye: [ox, kind === 'gun' ? 1.55 : 1.45, dist], yaw: 0, pitch: kind === 'gun' ? -0.05 : -0.1, fovy };
  },
};
