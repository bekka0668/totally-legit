'use strict';
/* =========================================================================
   TOTALLY LEGIT — shared helpers: math, vectors, matrices, formatting
   ========================================================================= */
const TAU = Math.PI * 2, DEG = Math.PI / 180;

const U = {
  clamp(v, a, b) { return v < a ? a : v > b ? b : v; },
  lerp(a, b, t) { return a + (b - a) * t; },
  rand(a, b) { return a + Math.random() * (b - a); },
  randi(a, b) { return Math.floor(a + Math.random() * (b - a + 1)); },
  pick(a) { return a[Math.floor(Math.random() * a.length)]; },
  chance(p) { return Math.random() < p; },
  damp(cur, target, rate, dt) { return cur + (target - cur) * (1 - Math.exp(-rate * dt)); },
  wrap(a) { a = (a + Math.PI) % TAU; if (a < 0) a += TAU; return a - Math.PI; },
  angDiff(from, to) { return U.wrap(to - from); },
  smoothstep(a, b, x) { const t = U.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); },
  fmt(n) {
    n = Math.floor(n);
    const a = Math.abs(n);
    if (a >= 1e9) return (n / 1e9).toFixed(a >= 1e10 ? 1 : 2) + 'B';
    if (a >= 1e6) return (n / 1e6).toFixed(a >= 1e7 ? 1 : 2) + 'M';
    return n.toLocaleString('en-US');
  },
  fmtTime(s) { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); },
  hex(h) {
    h = h.replace('#', '');
    return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255];
  },
  packRGB(h) {
    const c = U.hex(h);
    return Math.round(c[0] * 255) * 65536 + Math.round(c[1] * 255) * 256 + Math.round(c[2] * 255);
  },
  toHex(c) {
    return '#' + c.map(v => Math.round(U.clamp(v, 0, 1) * 255).toString(16).padStart(2, '0')).join('');
  },
  hsv(h, s, v) {
    h = ((h % 1) + 1) % 1;
    const i = Math.floor(h * 6), f = h * 6 - i, p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
    switch (i % 6) {
      case 0: return [v, t, p]; case 1: return [q, v, p]; case 2: return [p, v, t];
      case 3: return [p, q, v]; case 4: return [t, p, v]; default: return [v, p, q];
    }
  },
  esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  },
  shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  },
  rng(seed) {
    let s = (seed >>> 0) || 0x9e3779b9;
    return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  },
};

/* ---------- vec3 as plain arrays ---------- */
const V = {
  set(o, x, y, z) { o[0] = x; o[1] = y; o[2] = z; return o; },
  copy(o, a) { o[0] = a[0]; o[1] = a[1]; o[2] = a[2]; return o; },
  add(o, a, b) { o[0] = a[0] + b[0]; o[1] = a[1] + b[1]; o[2] = a[2] + b[2]; return o; },
  sub(o, a, b) { o[0] = a[0] - b[0]; o[1] = a[1] - b[1]; o[2] = a[2] - b[2]; return o; },
  scale(o, a, s) { o[0] = a[0] * s; o[1] = a[1] * s; o[2] = a[2] * s; return o; },
  madd(o, a, b, s) { o[0] = a[0] + b[0] * s; o[1] = a[1] + b[1] * s; o[2] = a[2] + b[2] * s; return o; },
  dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; },
  cross(o, a, b) {
    const x = a[1] * b[2] - a[2] * b[1], y = a[2] * b[0] - a[0] * b[2], z = a[0] * b[1] - a[1] * b[0];
    o[0] = x; o[1] = y; o[2] = z; return o;
  },
  len(a) { return Math.hypot(a[0], a[1], a[2]); },
  dist(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]); },
  dist2D(a, b) { return Math.hypot(a[0] - b[0], a[2] - b[2]); },
  norm(o, a) { const l = Math.hypot(a[0], a[1], a[2]) || 1; o[0] = a[0] / l; o[1] = a[1] / l; o[2] = a[2] / l; return o; },
  // yaw = 0 looks down -Z; positive pitch looks up
  fromAngles(o, yaw, pitch) {
    const cp = Math.cos(pitch);
    o[0] = -Math.sin(yaw) * cp; o[1] = Math.sin(pitch); o[2] = -Math.cos(yaw) * cp; return o;
  },
  yawOf(d) { return Math.atan2(-d[0], -d[2]); },
  pitchOf(d) { return Math.asin(U.clamp(d[1] / (Math.hypot(d[0], d[1], d[2]) || 1), -1, 1)); },
  // random direction inside a cone of half-angle `ang` around `dir` (dir must be normalized)
  cone(o, dir, ang) {
    if (ang <= 1e-5) return V.copy(o, dir);
    const up = Math.abs(dir[1]) < 0.98 ? [0, 1, 0] : [1, 0, 0];
    const r = V.norm([], V.cross([], dir, up));
    const u = V.cross([], r, dir);
    const a = Math.random() * TAU, rr = Math.sqrt(Math.random()) * Math.tan(ang);
    o[0] = dir[0] + (r[0] * Math.cos(a) + u[0] * Math.sin(a)) * rr;
    o[1] = dir[1] + (r[1] * Math.cos(a) + u[1] * Math.sin(a)) * rr;
    o[2] = dir[2] + (r[2] * Math.cos(a) + u[2] * Math.sin(a)) * rr;
    return V.norm(o, o);
  },
  angleBetween(a, b) {
    const d = V.dot(a, b) / ((V.len(a) * V.len(b)) || 1);
    return Math.acos(U.clamp(d, -1, 1));
  },
};

/* ---------- 4x4 matrices, column-major Float32Array ---------- */
const M4 = {
  create() { const m = new Float32Array(16); m[0] = m[5] = m[10] = m[15] = 1; return m; },
  ident(o) { o.fill(0); o[0] = o[5] = o[10] = o[15] = 1; return o; },
  copy(o, m) { o.set(m); return o; },
  perspective(o, fovy, aspect, near, far) {
    const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
    o.fill(0); o[0] = f / aspect; o[5] = f; o[10] = (far + near) * nf; o[11] = -1; o[14] = 2 * far * near * nf;
    return o;
  },
  mul(o, a, b) {
    const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
      a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
    for (let i = 0; i < 4; i++) {
      const b0 = b[i * 4], b1 = b[i * 4 + 1], b2 = b[i * 4 + 2], b3 = b[i * 4 + 3];
      o[i * 4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      o[i * 4 + 1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      o[i * 4 + 2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      o[i * 4 + 3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    }
    return o;
  },
  // o = m * T(x,y,z)
  translate(o, m, x, y, z) {
    if (o !== m) o.set(m);
    o[12] = m[0] * x + m[4] * y + m[8] * z + m[12];
    o[13] = m[1] * x + m[5] * y + m[9] * z + m[13];
    o[14] = m[2] * x + m[6] * y + m[10] * z + m[14];
    o[15] = m[3] * x + m[7] * y + m[11] * z + m[15];
    return o;
  },
  // o = m * Ry(a)
  rotY(o, m, a) {
    const c = Math.cos(a), s = Math.sin(a);
    const m0 = m[0], m1 = m[1], m2 = m[2], m3 = m[3], m8 = m[8], m9 = m[9], m10 = m[10], m11 = m[11];
    if (o !== m) { o[4] = m[4]; o[5] = m[5]; o[6] = m[6]; o[7] = m[7]; o[12] = m[12]; o[13] = m[13]; o[14] = m[14]; o[15] = m[15]; }
    o[0] = m0 * c - m8 * s; o[1] = m1 * c - m9 * s; o[2] = m2 * c - m10 * s; o[3] = m3 * c - m11 * s;
    o[8] = m0 * s + m8 * c; o[9] = m1 * s + m9 * c; o[10] = m2 * s + m10 * c; o[11] = m3 * s + m11 * c;
    return o;
  },
  // o = m * Rx(a)
  rotX(o, m, a) {
    const c = Math.cos(a), s = Math.sin(a);
    const m4 = m[4], m5 = m[5], m6 = m[6], m7 = m[7], m8 = m[8], m9 = m[9], m10 = m[10], m11 = m[11];
    if (o !== m) { o[0] = m[0]; o[1] = m[1]; o[2] = m[2]; o[3] = m[3]; o[12] = m[12]; o[13] = m[13]; o[14] = m[14]; o[15] = m[15]; }
    o[4] = m4 * c + m8 * s; o[5] = m5 * c + m9 * s; o[6] = m6 * c + m10 * s; o[7] = m7 * c + m11 * s;
    o[8] = m8 * c - m4 * s; o[9] = m9 * c - m5 * s; o[10] = m10 * c - m6 * s; o[11] = m11 * c - m7 * s;
    return o;
  },
  // o = m * Rz(a)
  rotZ(o, m, a) {
    const c = Math.cos(a), s = Math.sin(a);
    const m0 = m[0], m1 = m[1], m2 = m[2], m3 = m[3], m4 = m[4], m5 = m[5], m6 = m[6], m7 = m[7];
    if (o !== m) { o[8] = m[8]; o[9] = m[9]; o[10] = m[10]; o[11] = m[11]; o[12] = m[12]; o[13] = m[13]; o[14] = m[14]; o[15] = m[15]; }
    o[0] = m0 * c + m4 * s; o[1] = m1 * c + m5 * s; o[2] = m2 * c + m6 * s; o[3] = m3 * c + m7 * s;
    o[4] = m4 * c - m0 * s; o[5] = m5 * c - m1 * s; o[6] = m6 * c - m2 * s; o[7] = m7 * c - m3 * s;
    return o;
  },
  // inverse of a rotation+translation matrix
  invertRigid(o, m) {
    const r00 = m[0], r01 = m[1], r02 = m[2], r10 = m[4], r11 = m[5], r12 = m[6], r20 = m[8], r21 = m[9], r22 = m[10];
    const tx = m[12], ty = m[13], tz = m[14];
    o[0] = r00; o[1] = r10; o[2] = r20; o[3] = 0;
    o[4] = r01; o[5] = r11; o[6] = r21; o[7] = 0;
    o[8] = r02; o[9] = r12; o[10] = r22; o[11] = 0;
    o[12] = -(r00 * tx + r01 * ty + r02 * tz);
    o[13] = -(r10 * tx + r11 * ty + r12 * tz);
    o[14] = -(r20 * tx + r21 * ty + r22 * tz);
    o[15] = 1;
    return o;
  },
  // matrix whose local Z axis points along dir (unit), positioned at p
  fromDir(o, p, dir) {
    const up = Math.abs(dir[1]) < 0.98 ? [0, 1, 0] : [1, 0, 0];
    const x = V.norm([], V.cross([], up, dir));
    const y = V.cross([], dir, x);
    o[0] = x[0]; o[1] = x[1]; o[2] = x[2]; o[3] = 0;
    o[4] = y[0]; o[5] = y[1]; o[6] = y[2]; o[7] = 0;
    o[8] = dir[0]; o[9] = dir[1]; o[10] = dir[2]; o[11] = 0;
    o[12] = p[0]; o[13] = p[1]; o[14] = p[2]; o[15] = 1;
    return o;
  },
  transformPoint(o, m, p) {
    const x = p[0], y = p[1], z = p[2];
    o[0] = m[0] * x + m[4] * y + m[8] * z + m[12];
    o[1] = m[1] * x + m[5] * y + m[9] * z + m[13];
    o[2] = m[2] * x + m[6] * y + m[10] * z + m[14];
    return o;
  },
};
