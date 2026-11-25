'use strict';
/* =========================================================================
   World: map building from ASCII layouts, collision, raycasts, navigation
   ========================================================================= */
const CS = 2; // meters per layout cell

const World = {
  def: null, W: 0, H: 0, grid: null, boxes: [], clips: [], inst: [],
  walk: null, reach: null, reachList: [], spawns: [], pspawn: null,

  load(def) {
    this.def = def;
    this.boxes = []; this.clips = []; this.inst = []; this.spawns = []; this.pspawn = null;
    const rows = def.layout;
    this.H = rows.length;
    this.W = Math.max(...rows.map(r => r.length));
    this.grid = rows.map(r => r.padEnd(this.W, '#').split(''));
    this.walk = new Uint8Array(this.W * this.H);
    const C = def.col, wallH = def.wallH, rnd = U.rng(def.id.length * 7919 + 17);
    const Wm = this.W * CS, Hm = this.H * CS;

    // floor
    this.addBox(Wm / 2, -0.5, Hm / 2, Wm, 1, Hm, C.floor, def.pat.floor, { nav: false });
    // merged walls + low walls
    this.merge('#', (c0, r0, c1, r1) => {
      const cx = (c0 + c1 + 1) * CS / 2, cz = (r0 + r1 + 1) * CS / 2;
      this.addBox(cx, wallH / 2, cz, (c1 - c0 + 1) * CS, wallH, (r1 - r0 + 1) * CS, C.wall, def.pat.wall, { nav: false });
    });
    this.merge('h', (c0, r0, c1, r1) => {
      const cx = (c0 + c1 + 1) * CS / 2, cz = (r0 + r1 + 1) * CS / 2;
      const w = (c1 - c0 + 1) * CS, d = (r1 - r0 + 1) * CS;
      const sx = w > d ? w : (w === d ? 1.3 : 0.6), sz = d > w ? d : (w === d ? 1.3 : 0.6);
      this.addBox(cx, 0.55, cz, sx, 1.1, sz, C.half, 14, { nav: false });
      this.addBox(cx, 1.12, cz, sx + 0.08, 0.06, sz + 0.08, C.accent, 0, { nav: false, solid: false, emis: 0.15 });
    });
    const containerCols = ['#b8432f', '#2f6db8', '#3f8a4a', '#d0882c', '#6c5aa8'];
    let kIdx = 0;
    this.merge('K', (c0, r0, c1, r1) => {
      const cx = (c0 + c1 + 1) * CS / 2, cz = (r0 + r1 + 1) * CS / 2;
      const w = (c1 - c0 + 1) * CS, d = (r1 - r0 + 1) * CS;
      const col = containerCols[kIdx++ % containerCols.length];
      this.addBox(cx, 1.3, cz, w - 0.1, 2.6, d - 0.1, col, 9, { nav: false, spec: 0.25 });
      this.addBox(cx, 2.62, cz, w - 0.05, 0.06, d - 0.05, '#2b2e35', 0, { nav: false, solid: false });
    });

    for (let r = 0; r < this.H; r++) {
      for (let c = 0; c < this.W; c++) {
        const ch = this.grid[r][c];
        const x = (c + 0.5) * CS, z = (r + 0.5) * CS;
        const jx = (rnd() - 0.5) * 0.2, jz = (rnd() - 0.5) * 0.2;
        switch (ch) {
          case '.': this.walk[r * this.W + c] = 1; break;
          case 'P': this.walk[r * this.W + c] = 1; this.pspawn = [x, 0, z]; this.spawns.push([x, 0, z]); break;
          case 'S': this.walk[r * this.W + c] = 1; this.spawns.push([x, 0, z]); break;
          case 'c': {
            const t = 0.85 + rnd() * 0.25;
            this.addBox(x + jx, 0.5, z + jz, 1.7, 1.0, 1.7, this.tint(C.crate, t), 2, {});
            break;
          }
          case 'C': {
            const t = 0.85 + rnd() * 0.25;
            this.addBox(x + jx, 1.0, z + jz, 1.8, 2.0, 1.8, this.tint(C.crate, t), 2, {});
            if (rnd() < 0.35) this.addBox(x + jx * 2, 2.45, z - jz, 0.9, 0.9, 0.9, this.tint(C.crate, t * 0.95), 2, {});
            break;
          }
          case 'p':
            this.addBox(x, wallH / 2, z, 1.0, wallH, 1.0, C.pillar, def.pat.wall === 16 ? 16 : 14, {});
            this.addBox(x, 0.12, z, 1.25, 0.24, 1.25, this.tint(C.pillar, 0.8), 0, { nav: false });
            break;
          case 'g':
            this.addBox(x, 0.7, z, 1.9, 1.4, 1.9, C.hedge, 11, {});
            break;
          case 'f':
            this.addBox(x, 0.3, z, 2.0, 0.6, 2.0, '#cfc6b4', 14, {});
            this.addBox(x, 0.6, z, 1.7, 0.04, 1.7, '#4fb4d8', 0, { solid: false, nav: false, emis: 0.25, spec: 1.2 });
            break;
          default: break;
        }
      }
    }
    const ctx = {
      W: this.W, H: this.H, CS, wallH, col: C, rnd,
      box: (cx, cy, cz, sx, sy, sz, col, pat, o) => this.addBox(cx, cy, cz, sx, sy, sz, col, pat, o || {}),
      cell: (c, r) => [(c + 0.5) * CS, (r + 0.5) * CS],
      grid: this.grid,
    };
    if (PROPS[def.props]) PROPS[def.props](ctx);
    // spawn pads
    for (const s of this.spawns) this.addBox(s[0], 0.015, s[2], 1.4, 0.03, 1.4, C.accent, 0, { solid: false, nav: false, emis: 0.45 });
    // invisible boundary so nobody leaves the map
    const T = 30;
    this.clips.push([-5, -5, -5, 0.2, T, Hm + 5], [Wm - 0.2, -5, -5, Wm + 5, T, Hm + 5], [-5, -5, -5, Wm + 5, T, 0.2], [-5, -5, Hm - 0.2, Wm + 5, T, Hm + 5]);
    // reachability from the player spawn
    if (!this.pspawn) this.pspawn = this.spawns[0] || [Wm / 2, 0, Hm / 2];
    this.reach = new Uint8Array(this.W * this.H);
    const start = this.cellOf(this.pspawn);
    const q = [start[1] * this.W + start[0]];
    if (this.walk[q[0]]) this.reach[q[0]] = 1;
    while (q.length) {
      const i = q.shift(), c = i % this.W, r = (i / this.W) | 0;
      for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nc = c + dc, nr = r + dr;
        if (nc < 0 || nr < 0 || nc >= this.W || nr >= this.H) continue;
        const j = nr * this.W + nc;
        if (this.walk[j] && !this.reach[j]) { this.reach[j] = 1; q.push(j); }
      }
    }
    this.reachList = [];
    for (let i = 0; i < this.reach.length; i++) if (this.reach[i]) this.reachList.push(i);
    this.spawns = this.spawns.filter(s => { const [c, r] = this.cellOf(s); return this.reach[r * this.W + c]; });
    if (this.spawns.length < 4) {
      for (let k = 0; k < 12 && this.reachList.length; k++) {
        const i = this.reachList[Math.floor(rnd() * this.reachList.length)];
        this.spawns.push([(i % this.W + 0.5) * CS, 0, (((i / this.W) | 0) + 0.5) * CS]);
      }
    }
    this.gScore = new Float32Array(this.W * this.H);
    this.came = new Int32Array(this.W * this.H);
    this.closed = new Uint8Array(this.W * this.H);
    this.radarCanvas = null;
  },

  tint(hex, t) { const c = U.hex(hex); return [c[0] * t, c[1] * t, c[2] * t]; },

  addBox(cx, cy, cz, sx, sy, sz, col, pat, o) {
    const c = Array.isArray(col) ? col : U.hex(col);
    this.inst.push([cx, cy, cz, sx, sy, sz, c[0], c[1], c[2], pat || 0, o.emis || 0, o.spec || 0, o.sec || 0]);
    const solid = o.solid !== false;
    if (solid) this.boxes.push([cx - sx / 2, cy - sy / 2, cz - sz / 2, cx + sx / 2, cy + sy / 2, cz + sz / 2]);
    const nav = o.nav !== undefined ? o.nav : (solid && cy - sy / 2 < 1.5);
    if (nav && this.walk) {
      const c0 = Math.floor((cx - sx / 2 + 0.25) / CS), c1 = Math.floor((cx + sx / 2 - 0.25) / CS);
      const r0 = Math.floor((cz - sz / 2 + 0.25) / CS), r1 = Math.floor((cz + sz / 2 - 0.25) / CS);
      for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) if (c >= 0 && r >= 0 && c < this.W && r < this.H) this.walk[r * this.W + c] = 0;
    }
  },

  // greedy rectangle merge of a tile character
  merge(ch, fn) {
    const used = new Uint8Array(this.W * this.H);
    for (let r = 0; r < this.H; r++) {
      for (let c = 0; c < this.W; c++) {
        if (used[r * this.W + c] || this.grid[r][c] !== ch) continue;
        let c1 = c;
        while (c1 + 1 < this.W && this.grid[r][c1 + 1] === ch && !used[r * this.W + c1 + 1]) c1++;
        let r1 = r;
        outer: while (r1 + 1 < this.H) {
          for (let k = c; k <= c1; k++) if (this.grid[r1 + 1][k] !== ch || used[(r1 + 1) * this.W + k]) break outer;
          r1++;
        }
        for (let rr = r; rr <= r1; rr++) for (let k = c; k <= c1; k++) used[rr * this.W + k] = 1;
        fn(c, r, c1, r1);
      }
    }
  },

  cellOf(p) {
    return [U.clamp(Math.floor(p[0] / CS), 0, this.W - 1), U.clamp(Math.floor(p[2] / CS), 0, this.H - 1)];
  },
  isReach(c, r) { return c >= 0 && r >= 0 && c < this.W && r < this.H && this.reach[r * this.W + c] === 1; },
  cellCenter(i) { return [(i % this.W + 0.5) * CS, 0, (((i / this.W) | 0) + 0.5) * CS]; },
  randomReach() { const i = this.reachList[Math.floor(Math.random() * this.reachList.length)]; return this.cellCenter(i); },
  nearestReach(c, r) {
    for (let rad = 1; rad < 8; rad++) {
      for (let dr = -rad; dr <= rad; dr++) for (let dc = -rad; dc <= rad; dc++) {
        if (Math.abs(dr) !== rad && Math.abs(dc) !== rad) continue;
        if (this.isReach(c + dc, r + dr)) return [c + dc, r + dr];
      }
    }
    const i = this.reachList[0];
    return [i % this.W, (i / this.W) | 0];
  },

  /* ---- collision ---- */
  overlaps(b, e) {
    return !(e.pos[0] + e.r <= b[0] || e.pos[0] - e.r >= b[3] || e.pos[2] + e.r <= b[2] || e.pos[2] - e.r >= b[5] || e.pos[1] + e.h <= b[1] || e.pos[1] >= b[4]);
  },
  axis(e, ax, amt) {
    if (amt === 0) return;
    e.pos[ax] += amt;
    for (let L = 0; L < 2; L++) {
      const list = L ? this.clips : this.boxes;
      for (let i = 0; i < list.length; i++) {
        const b = list[i];
        if (!this.overlaps(b, e)) continue;
        if (ax === 1) {
          if (amt < 0) { e.pos[1] = b[4]; e.onGround = true; if (e.vel[1] < 0) e.vel[1] = 0; }
          else { e.pos[1] = b[1] - e.h; if (e.vel[1] > 0) e.vel[1] = 0; }
        } else {
          if (amt > 0) e.pos[ax] = b[ax] - e.r - 1e-4; else e.pos[ax] = b[ax + 3] + e.r + 1e-4;
          e.blocked = true;
        }
      }
    }
  },
  move(e, dx, dy, dz) {
    e.onGround = false; e.blocked = false;
    const n = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dz), Math.abs(dy)) / 0.3));
    for (let i = 0; i < n; i++) {
      this.axis(e, 0, dx / n);
      this.axis(e, 2, dz / n);
      this.axis(e, 1, dy / n);
    }
    if (e.pos[1] < -20) { e.pos[1] = 2; }
  },
  fits(x, y, z, r, h) {
    const e = { pos: [x, y, z], r, h };
    for (const b of this.boxes) if (this.overlaps(b, e)) return false;
    for (const b of this.clips) if (this.overlaps(b, e)) return false;
    return true;
  },

  /* ---- raycast (solid boxes only) ---- */
  raycast(o, d, maxT) {
    let best = maxT, hitAx = -1, hitBox = null;
    const boxes = this.boxes;
    for (let k = 0; k < boxes.length; k++) {
      const b = boxes[k];
      let tmin = 0, tmax = best, ax = -1, ok = true;
      for (let i = 0; i < 3; i++) {
        const di = d[i], oi = o[i];
        if (di > -1e-9 && di < 1e-9) { if (oi < b[i] || oi > b[i + 3]) { ok = false; break; } continue; }
        const inv = 1 / di;
        let t1 = (b[i] - oi) * inv, t2 = (b[i + 3] - oi) * inv;
        if (t1 > t2) { const tt = t1; t1 = t2; t2 = tt; }
        if (t1 > tmin) { tmin = t1; ax = i; }
        if (t2 < tmax) tmax = t2;
        if (tmin > tmax) { ok = false; break; }
      }
      if (!ok || ax < 0) continue;
      if (tmin < best) { best = tmin; hitAx = ax; hitBox = b; }
    }
    if (!hitBox) return null;
    const n = [0, 0, 0]; n[hitAx] = d[hitAx] > 0 ? -1 : 1;
    return { t: best, n, box: hitBox };
  },
  los(a, b) {
    const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const len = Math.hypot(d[0], d[1], d[2]);
    if (len < 0.01) return true;
    d[0] /= len; d[1] /= len; d[2] /= len;
    return !this.raycast(a, d, len - 0.05);
  },

  /* ---- navigation (A* over layout cells) ---- */
  findPath(from, to) {
    const W = this.W;
    let [sc, sr] = this.cellOf(from), [gc, gr] = this.cellOf(to);
    if (!this.isReach(sc, sr)) [sc, sr] = this.nearestReach(sc, sr);
    if (!this.isReach(gc, gr)) [gc, gr] = this.nearestReach(gc, gr);
    const start = sr * W + sc, goal = gr * W + gc;
    if (start === goal) return [[to[0], to[2]]];
    const g = this.gScore, came = this.came, closed = this.closed;
    g.fill(1e9); came.fill(-1); closed.fill(0);
    const heap = new MinHeap();
    g[start] = 0;
    const h = (c, r) => { const dx = Math.abs(c - gc), dy = Math.abs(r - gr); return Math.max(dx, dy) + 0.414 * Math.min(dx, dy); };
    heap.push(h(sc, sr), start);
    let found = false, iter = 0;
    while (heap.size && iter++ < 4000) {
      const cur = heap.pop();
      if (cur === goal) { found = true; break; }
      if (closed[cur]) continue;
      closed[cur] = 1;
      const c = cur % W, r = (cur / W) | 0;
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        if (!dc && !dr) continue;
        const nc = c + dc, nr = r + dr;
        if (!this.isReach(nc, nr)) continue;
        if (dc && dr && (!this.isReach(c + dc, r) || !this.isReach(c, r + dr))) continue;
        const j = nr * W + nc;
        if (closed[j]) continue;
        const ng = g[cur] + (dc && dr ? 1.414 : 1);
        if (ng < g[j]) { g[j] = ng; came[j] = cur; heap.push(ng + h(nc, nr), j); }
      }
    }
    if (!found) return null;
    const cells = [];
    for (let i = goal; i !== -1 && i !== start; i = came[i]) cells.push(i);
    cells.reverse();
    const pts = cells.map(i => [(i % W + 0.5) * CS, (((i / W) | 0) + 0.5) * CS]);
    pts[pts.length - 1] = [to[0], to[2]];
    // string-pull smoothing
    const out = [];
    let ax = from[0], az = from[2], i = 0;
    while (i < pts.length) {
      let j = pts.length - 1;
      while (j > i && !this.walkLine(ax, az, pts[j][0], pts[j][1])) j--;
      out.push(pts[j]);
      ax = pts[j][0]; az = pts[j][1]; i = j + 1;
    }
    return out;
  },
  walkLine(x0, z0, x1, z1) {
    const dx = x1 - x0, dz = z1 - z0, len = Math.hypot(dx, dz);
    if (len < 0.01) return true;
    const nx = -dz / len * 0.45, nz = dx / len * 0.45;
    const steps = Math.ceil(len / 0.5);
    for (let s = 0; s <= steps; s++) {
      const t = s / steps, x = x0 + dx * t, z = z0 + dz * t;
      for (const k of [-1, 0, 1]) {
        const c = Math.floor((x + nx * k) / CS), r = Math.floor((z + nz * k) / CS);
        if (!this.isReach(c, r)) return false;
      }
    }
    return true;
  },
};

class MinHeap {
  constructor() { this.k = []; this.v = []; }
  get size() { return this.k.length; }
  push(key, val) {
    const k = this.k, v = this.v;
    let i = k.length; k.push(key); v.push(val);
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (k[p] <= key) break;
      k[i] = k[p]; v[i] = v[p]; i = p;
    }
    k[i] = key; v[i] = val;
  }
  pop() {
    const k = this.k, v = this.v;
    const top = v[0];
    const lk = k.pop(), lv = v.pop();
    if (k.length) {
      let i = 0;
      const n = k.length;
      while (true) {
        let l = i * 2 + 1, r = l + 1, m = i;
        let mk = lk;
        if (l < n && k[l] < mk) { m = l; mk = k[l]; }
        if (r < n && k[r] < mk) { m = r; mk = k[r]; }
        if (m === i) break;
        k[i] = k[m]; v[i] = v[m]; i = m;
      }
      k[i] = lk; v[i] = lv;
    }
    return top;
  }
}

/* ---------------- per-map decoration ---------------- */
const PROPS = {
  closet(x) {
    const { W, H, wallH } = x;
    for (let c = 2; c < W - 1; c += 3) {
      x.box(c * CS + 1, wallH - 0.9, CS + 0.08, 1.2, 0.18, 0.12, '#fff1d0', 0, { emis: 1, solid: false, nav: false });
      x.box(c * CS + 1, wallH - 0.9, (H - 1) * CS - 0.08, 1.2, 0.18, 0.12, '#fff1d0', 0, { emis: 1, solid: false, nav: false });
    }
    // aim-room target boards on the end walls
    for (const [zx, sgn] of [[CS + 0.06, 1], [(W - 1) * CS - 0.06, -1]]) {
      for (let k = 0; k < 3; k++) {
        const z = (H * CS) / 2 + (k - 1) * 3.2;
        x.box(zx, 2.4, z, 0.06, 1.3, 1.3, '#f4f4f4', 0, { solid: false, nav: false, emis: 0.2 });
        x.box(zx + sgn * 0.02, 2.4, z, 0.06, 0.8, 0.8, '#e0402f', 0, { solid: false, nav: false, emis: 0.25 });
        x.box(zx + sgn * 0.04, 2.4, z, 0.06, 0.3, 0.3, '#f4f4f4', 0, { solid: false, nav: false, emis: 0.3 });
      }
    }
  },
  yard(x) {
    const { W, H, wallH } = x;
    const poles = [[0.5, 0.5], [W - 0.5, 0.5], [0.5, H - 0.5], [W - 0.5, H - 0.5]];
    for (const [c, r] of poles) {
      x.box(c * CS, wallH + 2, r * CS, 0.25, 4, 0.25, '#6d6a66', 0, { solid: false, nav: false });
      x.box(c * CS, wallH + 4.1, r * CS, 1.1, 0.25, 0.5, '#fff2cc', 0, { solid: false, nav: false, emis: 1 });
    }
    // distant sheds outside the walls
    for (let i = 0; i < 7; i++) {
      const w = 8 + x.rnd() * 10, h = 5 + x.rnd() * 6;
      x.box(-12 - x.rnd() * 8, h / 2, i * (H * CS / 6), 10, h, w, '#9b8f7d', 9, { solid: false, nav: false });
      x.box(W * CS + 12 + x.rnd() * 8, h / 2, i * (H * CS / 6), 10, h, w, '#a49783', 9, { solid: false, nav: false });
    }
    // crane gantry
    x.box(W * CS / 2, wallH + 6, -6, W * CS * 0.7, 0.8, 0.8, '#e0a02b', 17, { solid: false, nav: false });
    x.box(W * CS * 0.18, wallH / 2 + 3, -6, 0.8, wallH + 6, 0.8, '#e0a02b', 0, { solid: false, nav: false });
    x.box(W * CS * 0.82, wallH / 2 + 3, -6, 0.8, wallH + 6, 0.8, '#e0a02b', 0, { solid: false, nav: false });
  },
  court(x) {
    const { W, H, wallH } = x;
    // trees beyond the walls
    for (let i = 0; i < 16; i++) {
      const side = i % 4, t = (Math.floor(i / 4) + 0.5) / 4;
      let px, pz;
      if (side === 0) { px = t * W * CS; pz = -5; } else if (side === 1) { px = t * W * CS; pz = H * CS + 5; }
      else if (side === 2) { px = -5; pz = t * H * CS; } else { px = W * CS + 5; pz = t * H * CS; }
      const h = 5 + x.rnd() * 3;
      x.box(px, h / 2, pz, 0.6, h, 0.6, '#6b4a2f', 0, { solid: false, nav: false });
      x.box(px, h + 1.2, pz, 4.2, 3.2, 4.2, '#4c8a43', 11, { solid: false, nav: false });
      x.box(px + 0.6, h + 2.6, pz - 0.4, 2.6, 2, 2.6, '#5a9a4c', 11, { solid: false, nav: false });
    }
    // wall caps
    x.box(W * CS / 2, wallH + 0.1, 0.9, W * CS, 0.2, 2.2, '#bfae8c', 0, { solid: false, nav: false });
    x.box(W * CS / 2, wallH + 0.1, H * CS - 0.9, W * CS, 0.2, 2.2, '#bfae8c', 0, { solid: false, nav: false });
    // lanterns on pillars
    let fx = 0, fz = 0, fn = 0;
    for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
      if (x.grid[r][c] === 'p') {
        const [px, pz] = x.cell(c, r);
        x.box(px, wallH + 0.25, pz, 0.5, 0.5, 0.5, '#ffd28a', 0, { solid: false, nav: false, emis: 1 });
      } else if (x.grid[r][c] === 'f') {
        const [px, pz] = x.cell(c, r); fx += px; fz += pz; fn++;
      }
    }
    if (fn) {
      fx /= fn; fz /= fn;
      x.box(fx, 0.9, fz, 0.5, 1.2, 0.5, '#d8d0c0', 14, { nav: false });
      x.box(fx, 1.6, fz, 1.1, 0.18, 1.1, '#d8d0c0', 14, { nav: false });
      x.box(fx, 1.75, fz, 0.9, 0.05, 0.9, '#4fb4d8', 0, { solid: false, nav: false, emis: 0.3, spec: 1.2 });
    }
  },
  warehouse(x) {
    const { W, H, wallH } = x;
    for (let c = 1; c < W; c += 3) {
      x.box(c * CS, wallH - 0.4, H * CS / 2, 0.4, 0.6, H * CS, '#3d4654', 0, { solid: false, nav: false });
    }
    for (let r = 2; r < H - 1; r += 3) for (let c = 3; c < W - 2; c += 5) {
      const px = c * CS, pz = r * CS;
      x.box(px, wallH - 1.6, pz, 0.04, 2.0, 0.04, '#222', 0, { solid: false, nav: false });
      x.box(px, wallH - 2.65, pz, 1.4, 0.12, 0.5, '#ffe7b8', 0, { solid: false, nav: false, emis: 1 });
    }
    // roller doors on the end walls
    for (const zz of [CS + 0.05, (H - 1) * CS - 0.05]) {
      x.box(W * CS / 2, 2.2, zz, 6, 4.4, 0.1, '#8e9aa6', 9, { solid: false, nav: false });
      x.box(W * CS / 2, 0.06, zz, 6, 0.12, 0.14, '#e8b13d', 17, { solid: false, nav: false });
    }
  },
  roofs(x) {
    const { W, H } = x;
    const cx = W * CS / 2, cz = H * CS / 2;
    // skyline
    for (let i = 0; i < 46; i++) {
      const a = i / 46 * TAU + x.rnd() * 0.08;
      const rad = 70 + x.rnd() * 60;
      const h = 10 + x.rnd() * 55, w = 10 + x.rnd() * 14;
      const tone = 0.6 + x.rnd() * 0.4;
      x.box(cx + Math.cos(a) * rad, h / 2 - 25, cz + Math.sin(a) * rad, w, h + 50, w, [0.22 * tone, 0.2 * tone, 0.3 * tone], 15, { solid: false, nav: false });
    }
    // water tower
    x.box(3, 6.5, 3, 3.6, 3.2, 3.6, '#7a5a44', 9, { solid: false, nav: false });
    x.box(3, 8.4, 3, 3.8, 0.6, 3.8, '#5a4334', 0, { solid: false, nav: false });
    for (const [ox, oz] of [[-1.4, -1.4], [1.4, -1.4], [-1.4, 1.4], [1.4, 1.4]]) x.box(3 + ox, 3.2, 3 + oz, 0.2, 3.4, 0.2, '#3a3a40', 0, { solid: false, nav: false });
    // antenna
    x.box(W * CS - 3, 7, H * CS - 3, 0.2, 10, 0.2, '#888', 0, { solid: false, nav: false });
    x.box(W * CS - 3, 12.1, H * CS - 3, 0.5, 0.5, 0.5, '#ff3b3b', 0, { solid: false, nav: false, emis: 1 });
    // roof vents on top of AC units
    for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) if (x.grid[r][c] === 'C') {
      const [px, pz] = x.cell(c, r);
      x.box(px, 2.06, pz, 1.2, 0.12, 1.2, '#2c2f36', 0, { solid: false, nav: false });
    }
  },
  colosseum(x) {
    const { W, H, wallH } = x;
    const cx = W * CS / 2, cz = H * CS / 2;
    // tiered stands
    for (let tier = 0; tier < 4; tier++) {
      const rad = 25 + tier * 3.2, n = 40;
      for (let i = 0; i < n; i++) {
        const a = i / n * TAU;
        const h = wallH + tier * 1.6;
        x.box(cx + Math.cos(a) * rad, h / 2, cz + Math.sin(a) * rad, 3.4, h, 4.3, tier % 2 ? '#8a8275' : '#9d9587', 10, { solid: false, nav: false });
        if ((i + tier) % 3 === 0) {
          const hue = (i * 0.137 + tier * 0.3) % 1;
          x.box(cx + Math.cos(a) * rad, h + 0.45, cz + Math.sin(a) * rad, 0.5, 0.9, 0.5, U.hsv(hue, 0.55, 0.85), 0, { solid: false, nav: false });
        }
      }
    }
    // torches on pillars
    for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) if (x.grid[r][c] === 'p') {
      const [px, pz] = x.cell(c, r);
      x.box(px, wallH + 0.15, pz, 0.7, 0.3, 0.7, '#3a3027', 0, { solid: false, nav: false });
      x.box(px, wallH + 0.55, pz, 0.4, 0.5, 0.4, '#ff9a3c', 0, { solid: false, nav: false, emis: 1 });
      x.box(px, wallH + 0.9, pz, 0.22, 0.3, 0.22, '#ffd36b', 0, { solid: false, nav: false, emis: 1 });
    }
    // banners
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * TAU + 0.2;
      x.box(cx + Math.cos(a) * 23.4, wallH + 2, cz + Math.sin(a) * 23.4, 1.4, 4, 1.4, i % 2 ? '#a3302b' : '#2b4ea3', 0, { solid: false, nav: false, emis: 0.15 });
    }
  },
  mega(x) {
    const { W, H, wallH } = x;
    const cx = W * CS / 2, cz = H * CS / 2;
    for (let i = 0; i < 28; i++) {
      const a = i / 28 * TAU, rad = 48 + (i % 3) * 9;
      const h = 14 + (i % 5) * 7;
      x.box(cx + Math.cos(a) * rad, h / 2, cz + Math.sin(a) * rad, 2.5, h, 2.5, '#160c2e', 16, { solid: false, nav: false });
      x.box(cx + Math.cos(a) * rad, h + 0.6, cz + Math.sin(a) * rad, 3.2, 0.4, 3.2, i % 2 ? '#ff3df0' : '#29e6ff', 0, { solid: false, nav: false, emis: 1 });
    }
    // floating cubes
    for (let i = 0; i < 18; i++) {
      const s = 1 + x.rnd() * 3;
      x.box(x.rnd() * W * CS, 14 + x.rnd() * 18, x.rnd() * H * CS, s, s, s, i % 2 ? '#ff3df0' : '#29e6ff', 0, { solid: false, nav: false, emis: 0.9 });
    }
    // wall-top neon strip
    x.box(cx, wallH + 0.05, 1, W * CS, 0.1, 0.25, '#29e6ff', 0, { solid: false, nav: false, emis: 1 });
    x.box(cx, wallH + 0.05, H * CS - 1, W * CS, 0.1, 0.25, '#29e6ff', 0, { solid: false, nav: false, emis: 1 });
    x.box(1, wallH + 0.05, cz, 0.25, 0.1, H * CS, '#ff3df0', 0, { solid: false, nav: false, emis: 1 });
    x.box(W * CS - 1, wallH + 0.05, cz, 0.25, 0.1, H * CS, '#ff3df0', 0, { solid: false, nav: false, emis: 1 });
  },
};
