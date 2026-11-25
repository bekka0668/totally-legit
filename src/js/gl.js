'use strict';
/* =========================================================================
   WebGL2 renderer: everything is an instanced box with a procedural material
   instance layout (24 floats): mat4 (16) | rgba (4) | pattern, emissive, specular, packed secondary rgb
   ========================================================================= */
const VS_MAIN = `#version 300 es
layout(location=0) in vec3 aPos;
layout(location=1) in vec3 aNrm;
layout(location=2) in vec4 iM0;
layout(location=3) in vec4 iM1;
layout(location=4) in vec4 iM2;
layout(location=5) in vec4 iM3;
layout(location=6) in vec4 iCol;
layout(location=7) in vec4 iPar;
uniform mat4 uVP;
out vec3 vW; out vec3 vN; out vec4 vC; out vec4 vP; out vec3 vL; out vec3 vHS; out vec3 vLN;
void main(){
  mat4 m = mat4(iM0, iM1, iM2, iM3);
  vec4 w = m * vec4(aPos, 1.0);
  vec3 s = max(vec3(length(iM0.xyz), length(iM1.xyz), length(iM2.xyz)), vec3(1e-4));
  vW = w.xyz;
  vN = normalize(mat3(m) * (aNrm / (s * s)));
  vC = iCol; vP = iPar;
  vL = aPos * s; vHS = s * 0.5; vLN = aNrm;
  gl_Position = uVP * w;
}`;

const FS_MAIN = `#version 300 es
precision highp float;
in vec3 vW; in vec3 vN; in vec4 vC; in vec4 vP; in vec3 vL; in vec3 vHS; in vec3 vLN;
uniform vec3 uCam, uSunDir, uSunCol, uSky, uGnd, uFog;
uniform float uFogDen, uTime, uFlash, uAO;
uniform vec4 uFlat;
out vec4 oC;
float h31(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float vnoise(vec3 p){
  vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(h31(i), h31(i + vec3(1,0,0)), f.x), mix(h31(i + vec3(0,1,0)), h31(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(h31(i + vec3(0,0,1)), h31(i + vec3(1,0,1)), f.x), mix(h31(i + vec3(0,1,1)), h31(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float gridLine(vec2 uv, float th){
  vec2 d = abs(fract(uv + 0.5) - 0.5);
  vec2 w = fwidth(uv) * 1.25;
  vec2 l = 1.0 - smoothstep(vec2(th), vec2(th) + w, d);
  float fade = 1.0 - smoothstep(0.2, 0.55, max(w.x, w.y));
  return max(l.x, l.y) * fade;
}
vec3 hsv2rgb(vec3 c){ vec3 p = abs(fract(c.xxx + vec3(1.0, 2.0/3.0, 1.0/3.0)) * 6.0 - 3.0); return c.z * mix(vec3(1.0), clamp(p - 1.0, 0.0, 1.0), c.y); }
vec3 unpackRGB(float f){ float r = floor(f / 65536.0); float g = floor((f - r * 65536.0) / 256.0); float b = f - r * 65536.0 - g * 256.0; return vec3(r, g, b) / 255.0; }
void main(){
  if (uFlat.a > 0.0) { oC = uFlat; return; }
  vec3 n = normalize(vN);
  vec3 base = vC.rgb;
  float pat = floor(vP.x + 0.5);
  float emis = vP.y;
  float spec = vP.z;
  vec3 sec = unpackRGB(vP.w);
  vec3 an = abs(n);
  vec2 wuv = an.x > 0.5 ? vW.zy : (an.y > 0.5 ? vW.xz : vW.xy);
  vec3 aln = abs(vLN);
  vec2 luv = aln.x > 0.5 ? vL.zy : (aln.y > 0.5 ? vL.xz : vL.xy);
  vec2 lhs = aln.x > 0.5 ? vHS.zy : (aln.y > 0.5 ? vHS.xz : vHS.xy);
  if (pat == 1.0) {            // prototype grid
    base *= 1.0 - 0.07 * gridLine(wuv * 2.0, 0.025) - 0.16 * gridLine(wuv * 0.5, 0.014);
  } else if (pat == 2.0) {     // crate
    vec2 e = lhs - abs(luv);
    float border = 1.0 - step(0.09, min(e.x, e.y));
    float diag = 1.0 - step(0.055, abs(luv.x / lhs.x - luv.y / lhs.y) * min(lhs.x, lhs.y));
    base *= 1.0 - 0.06 * step(0.5, fract(luv.y * 3.0));
    base = mix(base, base * 0.6, max(border, diag));
  } else if (pat == 3.0) {     // stripes (skins)
    base = mix(base, sec, step(0.5, fract((vL.x + vL.y * 0.6 + vL.z) * 9.0)));
  } else if (pat == 4.0) {     // camo (skins)
    float c = vnoise(vL * 14.0) + 0.5 * vnoise(vL * 31.0);
    base = mix(base, mix(base, sec, 0.5), step(0.62, c));
    base = mix(base, sec, step(0.86, c));
  } else if (pat == 5.0) {     // RGB
    base = hsv2rgb(vec3(fract(uTime * 0.25 + dot(vL, vec3(2.0, 1.0, 1.5))), 0.75, 1.0));
    emis = max(emis, 0.35);
  } else if (pat == 6.0) {     // glitch
    float r = h31(floor(vL * vec3(18.0, 18.0, 10.0)) + floor(uTime * 7.0));
    base = r > 0.7 ? sec : (r > 0.45 ? base : base * 0.35);
    emis = max(emis, r > 0.7 ? 0.6 : 0.0);
  } else if (pat == 7.0) {     // carbon
    vec2 q = floor(luv * 55.0);
    base = mix(base, sec, mod(q.x + q.y, 2.0));
  } else if (pat == 8.0) {     // tiles
    vec2 q = floor(wuv);
    base *= mix(1.0, 0.87, mod(q.x + q.y, 2.0));
    base *= 1.0 - 0.18 * gridLine(wuv, 0.015);
  } else if (pat == 9.0) {     // corrugated metal
    float coord = an.x > 0.5 ? vW.z : vW.x;
    base *= 0.84 + 0.16 * sin(coord * 13.0);
  } else if (pat == 10.0) {    // brick
    vec2 b = vec2(wuv.x * 2.0, wuv.y * 4.0);
    b.x += mod(floor(b.y), 2.0) * 0.5;
    vec2 f = fract(b);
    float mortar = max(1.0 - step(0.05, f.x), 1.0 - step(0.09, f.y));
    base *= 0.86 + 0.18 * h31(vec3(floor(b), 3.0));
    base = mix(base, vec3(0.8, 0.77, 0.72) * 0.75, mortar * 0.65);
  } else if (pat == 11.0) {    // foliage
    float c = vnoise(vW * 5.0) * 0.6 + vnoise(vW * 13.0) * 0.4;
    base *= 0.7 + 0.55 * c;
  } else if (pat == 12.0) {    // neon floor
    float g = gridLine(wuv * 0.5, 0.03);
    float g2 = gridLine(wuv * 2.0, 0.015) * 0.22;
    base += vec3(0.2, 0.95, 1.0) * (g + g2) * 1.2;
    emis = max(emis, g * 0.9);
  } else if (pat == 13.0) {    // salt crystal
    float r = h31(floor(vL * 40.0));
    float tw = pow(max(0.0, sin(uTime * 3.0 + r * 40.0)), 16.0);
    base = mix(base, sec, step(0.6, r) * 0.6) + tw * 0.6;
  } else if (pat == 14.0) {    // concrete
    float c = vnoise(vW * 2.5) * 0.6 + vnoise(vW * 9.0) * 0.4;
    base *= 0.86 + 0.2 * c;
    base *= 1.0 - 0.12 * gridLine(wuv * 0.5, 0.008);
  } else if (pat == 15.0) {    // lit windows
    vec2 q = wuv * vec2(1.2, 0.8);
    vec2 f = fract(q);
    float win = step(0.25, f.x) * step(f.x, 0.75) * step(0.3, f.y) * step(f.y, 0.8);
    float lit = step(0.5, h31(vec3(floor(q), 7.0)));
    if (an.y < 0.5) { base = mix(base * 0.8, vec3(1.0, 0.82, 0.5), win * lit); emis = max(emis, win * lit * 0.95); }
  } else if (pat == 16.0) {    // neon wall band
    float band = 1.0 - smoothstep(0.03, 0.07, abs(vW.y - 0.4));
    float band2 = 1.0 - smoothstep(0.015, 0.035, abs(fract(vW.y * 0.5) - 0.5));
    base += vec3(1.0, 0.25, 0.95) * (band * 1.3 + band2 * 0.18);
    emis = max(emis, band);
  } else if (pat == 17.0) {    // hazard
    base = mix(base, vec3(0.07), step(0.5, fract((vW.x + vW.z + vW.y) * 1.4)) * 0.85);
  }
  vec3 L = -uSunDir;
  float dif = max(dot(n, L), 0.0);
  vec3 amb = mix(uGnd, uSky, n.y * 0.5 + 0.5);
  vec3 V = normalize(uCam - vW);
  vec3 H = normalize(L + V);
  float sp = pow(max(dot(n, H), 0.0), 40.0) * spec;
  float ao = 1.0;
  if (an.y < 0.5) ao = mix(1.0 - 0.38 * uAO, 1.0, smoothstep(0.0, 1.1, vW.y));
  vec3 col = base * (amb * 0.9 + uSunCol * dif * 0.85) * ao + uSunCol * sp;
  col += base * uFlash;
  col = mix(col, base, clamp(emis, 0.0, 1.0));
  float d = length(vW - uCam);
  float fog = 1.0 - exp(-pow(d * uFogDen, 1.6));
  col = mix(col, uFog, fog * (1.0 - emis * 0.6));
  oC = vec4(col, vC.a);
}`;

const VS_SKY = `#version 300 es
out vec2 vUV;
void main(){
  vec2 p = vec2(gl_VertexID == 1 ? 3.0 : -1.0, gl_VertexID == 2 ? 3.0 : -1.0);
  vUV = p;
  gl_Position = vec4(p, 0.0, 1.0);
}`;

const FS_SKY = `#version 300 es
precision highp float;
in vec2 vUV;
uniform vec3 uF, uR, uU, uZen, uHor, uGround, uSunDir, uSunCol;
uniform float uTanX, uTanY, uStars, uClouds, uTime;
out vec4 oC;
float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vn2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1,0)), f.x), mix(h21(i + vec2(0,1)), h21(i + vec2(1,1)), f.x), f.y); }
void main(){
  vec3 d = normalize(uF + vUV.x * uTanX * uR + vUV.y * uTanY * uU);
  float y = d.y;
  vec3 col = y > 0.0 ? mix(uHor, uZen, pow(y, 0.55)) : mix(uHor, uGround, pow(min(-y * 3.0, 1.0), 0.6));
  float sd = max(dot(d, -uSunDir), 0.0);
  col += uSunCol * (pow(sd, 500.0) * 1.4 + pow(sd, 10.0) * 0.22);
  if (uStars > 0.0 && y > 0.0) {
    vec2 sp = d.xz / (d.y + 0.25) * 60.0;
    vec2 cell = floor(sp);
    float r = h21(cell);
    vec2 fp = fract(sp) - 0.5;
    float star = step(0.986, r) * smoothstep(0.12, 0.0, length(fp)) * (0.6 + 0.4 * sin(uTime * 2.0 + r * 50.0));
    col += vec3(star) * uStars * smoothstep(0.0, 0.25, y);
  }
  if (uClouds > 0.0 && y > 0.0) {
    vec2 cp = d.xz / (d.y + 0.15) * 2.0 + vec2(uTime * 0.02, 0.0);
    float c = vn2(cp) * 0.55 + vn2(cp * 2.3) * 0.3 + vn2(cp * 5.1) * 0.15;
    c = smoothstep(0.55, 0.85, c) * uClouds * smoothstep(0.0, 0.3, y);
    col = mix(col, mix(uHor, vec3(1.0), 0.55), c * 0.6);
  }
  oC = vec4(col, 1.0);
}`;

const GFX = {
  gl: null, canvas: null, prog: null, skyProg: null, u: {}, su: {}, skyVAO: null,
  b: {}, quality: 1, W: 1, H: 1, cssW: 1, cssH: 1, dpr: 1,
  view: M4.create(), proj: M4.create(), vp: M4.create(), vmProj: M4.create(), vmVP: M4.create(), camWorld: M4.create(),
  eye: [0, 0, 0], fwd: [0, 0, -1], right: [1, 0, 0], up: [0, 1, 0], fovy: 1.2, vmFovy: 55 * DEG, aspect: 1,
  env: null, time: 0, flash: 0, chams: null,

  init(canvas) {
    this.canvas = canvas;
    let gl = null;
    try { gl = canvas.getContext('webgl2', { antialias: true, alpha: false, powerPreference: 'high-performance' }); } catch (e) { gl = null; }
    if (!gl) return false;
    this.gl = gl;
    this.prog = this.program(VS_MAIN, FS_MAIN);
    this.skyProg = this.program(VS_SKY, FS_SKY);
    if (!this.prog || !this.skyProg) return false;
    for (const n of ['uVP', 'uCam', 'uSunDir', 'uSunCol', 'uSky', 'uGnd', 'uFog', 'uFogDen', 'uTime', 'uFlash', 'uFlat', 'uAO'])
      this.u[n] = gl.getUniformLocation(this.prog, n);
    for (const n of ['uF', 'uR', 'uU', 'uZen', 'uHor', 'uGround', 'uSunDir', 'uSunCol', 'uTanX', 'uTanY', 'uStars', 'uClouds', 'uTime'])
      this.su[n] = gl.getUniformLocation(this.skyProg, n);
    // unit cube
    const faces = [
      [[1, 0, 0], [0, 0, -1], [0, 1, 0]], [[-1, 0, 0], [0, 0, 1], [0, 1, 0]],
      [[0, 1, 0], [1, 0, 0], [0, 0, -1]], [[0, -1, 0], [1, 0, 0], [0, 0, 1]],
      [[0, 0, 1], [1, 0, 0], [0, 1, 0]], [[0, 0, -1], [-1, 0, 0], [0, 1, 0]],
    ];
    const vtx = [], idx = [];
    faces.forEach(([n, u, v], f) => {
      for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        vtx.push(n[0] * 0.5 + u[0] * 0.5 * a + v[0] * 0.5 * b, n[1] * 0.5 + u[1] * 0.5 * a + v[1] * 0.5 * b, n[2] * 0.5 + u[2] * 0.5 * a + v[2] * 0.5 * b, n[0], n[1], n[2]);
      }
      const o = f * 4; idx.push(o, o + 1, o + 2, o, o + 2, o + 3);
    });
    this.cubeVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vtx), gl.STATIC_DRAW);
    this.cubeIBO = gl.createBuffer();
    this.skyVAO = gl.createVertexArray();
    this.b.world = this.makeBatch(1600, true);
    this.b.bots = this.makeBatch(1200);
    this.b.dyn = this.makeBatch(2600);
    this.b.trans = this.makeBatch(800);
    this.b.view = this.makeBatch(120);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    // index buffer is bound per VAO inside makeBatch
    this._idx = new Uint16Array(idx);
    for (const k in this.b) this.bindIndex(this.b[k]);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); }, false);
    return true;
  },
  program(vs, fs) {
    const gl = this.gl;
    const mk = (type, src) => {
      const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(s)); return null; }
      return s;
    };
    const v = mk(gl.VERTEX_SHADER, vs), f = mk(gl.FRAGMENT_SHADER, fs);
    if (!v || !f) return null;
    const p = gl.createProgram(); gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { console.error(gl.getProgramInfoLog(p)); return null; }
    return p;
  },
  makeBatch(cap, isStatic) {
    const gl = this.gl;
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVBO);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, cap * 96, isStatic ? gl.STATIC_DRAW : gl.DYNAMIC_DRAW);
    for (let i = 0; i < 6; i++) {
      gl.enableVertexAttribArray(2 + i);
      gl.vertexAttribPointer(2 + i, 4, gl.FLOAT, false, 96, i * 16);
      gl.vertexAttribDivisor(2 + i, 1);
    }
    gl.bindVertexArray(null);
    return { vao, buf, cap, data: new Float32Array(cap * 24), count: 0, uploaded: 0, isStatic: !!isStatic };
  },
  bindIndex(b) {
    const gl = this.gl;
    gl.bindVertexArray(b.vao);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.cubeIBO);
    if (!this._idxUploaded) { gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._idx, gl.STATIC_DRAW); this._idxUploaded = true; }
    gl.bindVertexArray(null);
  },

  /* ---- instance writers ---- */
  push(b, m, sx, sy, sz, r, g, bl, a, p0, p1, p2, p3) {
    if (b.count >= b.cap) return;
    const d = b.data, o = b.count * 24;
    d[o] = m[0] * sx; d[o + 1] = m[1] * sx; d[o + 2] = m[2] * sx; d[o + 3] = 0;
    d[o + 4] = m[4] * sy; d[o + 5] = m[5] * sy; d[o + 6] = m[6] * sy; d[o + 7] = 0;
    d[o + 8] = m[8] * sz; d[o + 9] = m[9] * sz; d[o + 10] = m[10] * sz; d[o + 11] = 0;
    d[o + 12] = m[12]; d[o + 13] = m[13]; d[o + 14] = m[14]; d[o + 15] = 1;
    d[o + 16] = r; d[o + 17] = g; d[o + 18] = bl; d[o + 19] = a;
    d[o + 20] = p0 || 0; d[o + 21] = p1 || 0; d[o + 22] = p2 || 0; d[o + 23] = p3 || 0;
    b.count++;
  },
  pushAA(b, cx, cy, cz, sx, sy, sz, r, g, bl, a, p0, p1, p2, p3) {
    if (b.count >= b.cap) return;
    const d = b.data, o = b.count * 24;
    d[o] = sx; d[o + 1] = 0; d[o + 2] = 0; d[o + 3] = 0;
    d[o + 4] = 0; d[o + 5] = sy; d[o + 6] = 0; d[o + 7] = 0;
    d[o + 8] = 0; d[o + 9] = 0; d[o + 10] = sz; d[o + 11] = 0;
    d[o + 12] = cx; d[o + 13] = cy; d[o + 14] = cz; d[o + 15] = 1;
    d[o + 16] = r; d[o + 17] = g; d[o + 18] = bl; d[o + 19] = a;
    d[o + 20] = p0 || 0; d[o + 21] = p1 || 0; d[o + 22] = p2 || 0; d[o + 23] = p3 || 0;
    b.count++;
  },
  setStatic(list) {
    // list: arrays of [cx,cy,cz,sx,sy,sz,r,g,b,pattern,emissive,spec,secondary]
    const b = this.b.world; b.count = 0;
    for (const i of list) this.pushAA(b, i[0], i[1], i[2], i[3], i[4], i[5], i[6], i[7], i[8], 1, i[9], i[10], i[11], i[12]);
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, b.buf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, b.data, 0, b.count * 24);
    b.uploaded = b.count;
  },
  upload(b) {
    if (!b.count) return;
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, b.buf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, b.data, 0, b.count * 24);
  },
  draw(b) {
    if (!b.count) return;
    const gl = this.gl;
    gl.bindVertexArray(b.vao);
    gl.drawElementsInstanced(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0, b.count);
  },
  clearDynamic() { this.b.bots.count = 0; this.b.dyn.count = 0; this.b.trans.count = 0; this.b.view.count = 0; },

  setEnv(e) {
    const c = h => U.hex(h);
    const sd = V.norm([], e.sun);
    this.env = {
      zen: c(e.zenith), hor: c(e.horizon), ground: c(e.gnd), sunDir: sd, sunCol: c(e.sunCol), sky: c(e.sky), gnd: c(e.gnd),
      fog: c(e.fog), fogDen: e.fogDen, stars: e.stars || 0, clouds: e.clouds || 0, ao: e.ao == null ? 1 : e.ao,
    };
  },

  resize() {
    const c = this.canvas;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = c.clientWidth || window.innerWidth, ch = c.clientHeight || window.innerHeight;
    const w = Math.max(1, Math.floor(cw * dpr * this.quality)), h = Math.max(1, Math.floor(ch * dpr * this.quality));
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    this.W = w; this.H = h; this.cssW = cw; this.cssH = ch; this.dpr = dpr;
    this.aspect = w / h;
  },

  // cam: {eye, yaw, pitch, roll, fovy}
  setCamera(cam) {
    const m = this.camWorld;
    M4.ident(m);
    M4.translate(m, m, cam.eye[0], cam.eye[1], cam.eye[2]);
    M4.rotY(m, m, cam.yaw);
    M4.rotX(m, m, cam.pitch);
    if (cam.roll) M4.rotZ(m, m, cam.roll);
    M4.invertRigid(this.view, m);
    this.fovy = cam.fovy;
    M4.perspective(this.proj, cam.fovy, this.aspect, 0.05, 420);
    M4.mul(this.vp, this.proj, this.view);
    M4.perspective(this.vmProj, this.vmFovy, this.aspect, 0.01, 10);
    M4.mul(this.vmVP, this.vmProj, this.view);
    V.copy(this.eye, cam.eye);
    V.set(this.right, m[0], m[1], m[2]);
    V.set(this.up, m[4], m[5], m[6]);
    V.set(this.fwd, -m[8], -m[9], -m[10]);
  },

  // world point -> css pixel coords; returns null when behind camera
  project(p, out) {
    const m = this.vp;
    const x = p[0], y = p[1], z = p[2];
    const cx = m[0] * x + m[4] * y + m[8] * z + m[12];
    const cy = m[1] * x + m[5] * y + m[9] * z + m[13];
    const cw = m[3] * x + m[7] * y + m[11] * z + m[15];
    if (cw <= 0.05) return null;
    out = out || [0, 0, 0];
    out[0] = (cx / cw * 0.5 + 0.5) * this.cssW;
    out[1] = (1 - (cy / cw * 0.5 + 0.5)) * this.cssH;
    out[2] = cw;
    return out;
  },

  render(opts = {}) {
    const gl = this.gl, e = this.env;
    if (!gl || !e) return;
    gl.viewport(0, 0, this.W, this.H);
    gl.clearColor(e.fog[0], e.fog[1], e.fog[2], 1);
    gl.depthMask(true);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // sky
    gl.disable(gl.DEPTH_TEST); gl.depthMask(false);
    gl.useProgram(this.skyProg);
    const su = this.su, ty = Math.tan(this.fovy / 2);
    gl.uniform3fv(su.uF, this.fwd); gl.uniform3fv(su.uR, this.right); gl.uniform3fv(su.uU, this.up);
    gl.uniform1f(su.uTanY, ty); gl.uniform1f(su.uTanX, ty * this.aspect);
    gl.uniform3fv(su.uZen, e.zen); gl.uniform3fv(su.uHor, e.hor); gl.uniform3fv(su.uGround, e.ground);
    gl.uniform3fv(su.uSunDir, e.sunDir); gl.uniform3fv(su.uSunCol, e.sunCol);
    gl.uniform1f(su.uStars, e.stars); gl.uniform1f(su.uClouds, e.clouds); gl.uniform1f(su.uTime, this.time);
    gl.bindVertexArray(this.skyVAO);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // scene
    gl.enable(gl.DEPTH_TEST); gl.depthMask(true); gl.depthFunc(gl.LEQUAL);
    gl.useProgram(this.prog);
    const u = this.u;
    gl.uniformMatrix4fv(u.uVP, false, this.vp);
    gl.uniform3fv(u.uCam, this.eye);
    gl.uniform3fv(u.uSunDir, e.sunDir); gl.uniform3fv(u.uSunCol, e.sunCol);
    gl.uniform3fv(u.uSky, e.sky); gl.uniform3fv(u.uGnd, e.gnd); gl.uniform3fv(u.uFog, e.fog);
    gl.uniform1f(u.uFogDen, e.fogDen); gl.uniform1f(u.uTime, this.time); gl.uniform1f(u.uFlash, this.flash);
    gl.uniform1f(u.uAO, e.ao);
    gl.uniform4f(u.uFlat, 0, 0, 0, 0);
    this.upload(this.b.bots); this.upload(this.b.dyn); this.upload(this.b.trans); this.upload(this.b.view);
    this.draw(this.b.world);
    this.draw(this.b.bots);
    this.draw(this.b.dyn);
    // chams: only the hidden parts of bots, drawn as a flat glow
    if (this.chams && this.b.bots.count) {
      gl.depthFunc(gl.GREATER); gl.depthMask(false);
      gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.uniform4fv(u.uFlat, this.chams);
      this.draw(this.b.bots);
      gl.uniform4f(u.uFlat, 0, 0, 0, 0);
      gl.depthFunc(gl.LEQUAL); gl.depthMask(true); gl.disable(gl.BLEND);
    }
    // transparent effects
    if (this.b.trans.count) {
      gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
      this.draw(this.b.trans);
      gl.depthMask(true); gl.disable(gl.BLEND);
    }
    // first-person weapon on top
    if (this.b.view.count && !opts.noView) {
      gl.clear(gl.DEPTH_BUFFER_BIT);
      gl.uniformMatrix4fv(u.uVP, false, this.vmVP);
      gl.uniform1f(u.uFogDen, 0);
      gl.uniform1f(u.uAO, 0);
      this.draw(this.b.view);
    }
    gl.bindVertexArray(null);
  },
};
