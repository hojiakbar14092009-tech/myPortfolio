// The Chapter Field shaders (see components/Field.tsx for the system overview).

export const VERT = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';

export const FRAG = `
precision highp float;
uniform vec2 R; uniform float T; uniform vec2 M; uniform float V;
uniform vec3 BG; uniform vec3 FG; uniform vec3 AC; uniform float DARK;
uniform sampler2D TA; uniform sampler2D TB;
uniform float IA; uniform float IB; uniform float ARA; uniform float ARB;
uniform float SA; uniform float SB; uniform float MA; uniform float MB; uniform float GA; uniform float GB;
uniform float P; uniform float K;

float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float ln(float d, float w){ return 1.0 - smoothstep(w, w + 1.6 / R.y, abs(d)); }
float box(vec2 p, vec2 b){ vec2 q = abs(p) - b; return abs(length(max(q, 0.0)) + min(max(q.x, q.y), 0.0)); }
float gridd(float x, float s){ return abs(fract(x * s + 0.5) - 0.5) / s; }

vec3 photo(sampler2D tx, float ar, vec2 uv, float age){
  float sar = R.x / R.y;
  vec2 st = uv - 0.5;
  if (sar > ar) st.y *= ar / sar; else st.x *= sar / ar;
  // Ken Burns: a slow breathing zoom and drift, nudged by the cursor and scroll speed.
  st /= 1.09 + 0.05 * sin(age * 0.06) + min(abs(V) * 0.002, 0.03);
  st += vec2(sin(age * 0.031), cos(age * 0.027)) * 0.018 - (M - 0.5) * 0.02;
  return texture2D(tx, vec2(st.x + 0.5, 0.5 - st.y)).rgb; // bitmap rows run top-down
}

float particles(vec2 p, float t){
  float acc = 0.0;
  for (int l = 0; l < 2; l++){
    float fl = float(l);
    float s = 9.0 + fl * 8.0;
    vec2 q = p * s + vec2(t * 0.05 * (1.0 + fl), -t * 0.1 * (1.0 + fl * 0.6));
    vec2 id = floor(q);
    float h = h21(id + fl * 17.0);
    vec2 o = vec2(sin(t * 0.3 + h * 6.283), cos(t * 0.25 + h * 12.0)) * 0.3;
    float d = length(fract(q) - 0.5 - o);
    float r = 0.03 + h * 0.035;
    acc += (1.0 - smoothstep(r * 0.25, r, d)) * step(0.6, h) * (0.35 + 0.65 * h);
  }
  return acc;
}

// x: light lines, y: shade, z: accent
vec3 motif(float id, vec2 p, float t){
  vec3 o = vec3(0.0);
  float sar = R.x / R.y;
  if (id < 0.5) return o;
  if (id < 1.5) { // intro: drifting field grid + ripples from the centre
    vec2 q = p + vec2(t * 0.006, t * 0.004);
    float g = max(ln(gridd(q.x, 7.0), 0.0004), ln(gridd(q.y, 7.0), 0.0004));
    float r = length(p);
    float ring = pow(0.5 + 0.5 * sin(r * 34.0 - t * 1.1), 26.0) * smoothstep(0.9, 0.05, r);
    o.x = g * 0.3 + ring * 0.4;
    o.y = smoothstep(0.35, 1.0, r) * 0.4;
  } else if (id < 2.5) { // chess: board lines slide, squares flip, a piece shadow drifts
    vec2 q = p * 5.5 + vec2(t * 0.02, t * 0.012);
    vec2 cell = floor(q);
    float checker = mod(cell.x + cell.y, 2.0);
    float flip = 0.5 + 0.5 * sin(t * 0.5 + h21(cell) * 6.283);
    float g = max(ln(gridd(q.x, 1.0) / 5.5, 0.0005), ln(gridd(q.y, 1.0) / 5.5, 0.0005));
    o.x = g * 0.4 + checker * flip * flip * 0.12;
    vec2 c = vec2(sin(t * 0.07) * 0.5 * sar, cos(t * 0.05) * 0.25);
    o.y = exp(-dot(p - c, p - c) * 6.0) * 0.6;
  } else if (id < 3.5) { // football: pitch lines redraw, a ball traces an arc
    vec2 a = vec2(0.66, 0.38);
    float d = box(p, a);
    d = min(d, abs(p.x) + max(abs(p.y) - a.y, 0.0) * 10.0);
    d = min(d, abs(length(p) - 0.11));
    d = min(d, box(vec2(abs(p.x) - (a.x - 0.08), p.y), vec2(0.08, 0.17)));
    float ang = atan(p.y, p.x) / 6.2832 + 0.5;
    float cyc = fract(t * 0.045);
    float drawn = step(ang, smoothstep(0.0, 0.55, cyc) * 1.001) * (1.0 - smoothstep(0.86, 1.0, cyc));
    o.x = ln(d, 0.0007) * 0.5 * drawn;
    float s = fract(t * 0.18);
    for (int i = 0; i < 12; i++){
      float si = s - float(i) * 0.014;
      if (si < 0.0) break;
      vec2 b = vec2(mix(-0.5, 0.45, si) * min(sar, 1.6), -0.22 + 1.6 * si * (1.0 - si) * 0.42);
      float k = 1.0 - float(i) / 12.0;
      o.x += (1.0 - smoothstep(0.003, 0.009, length(p - b))) * k * 0.6;
      if (i == 0) o.z += (1.0 - smoothstep(0.006, 0.014, length(p - b)));
    }
  } else if (id < 4.5) { // swimming: water caustics + rippling lane lines
    vec2 q = p * 5.0 + 20.0;
    vec2 i = q;
    float c = 1.0;
    for (int n = 0; n < 3; n++){
      float tt = t * 0.3 * (1.0 - 3.5 / float(n + 1));
      i = q + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
      c += 1.0 / length(vec2(q.x / (sin(i.x + tt) / 0.012), q.y / (cos(i.y + tt) / 0.012)));
    }
    c /= 3.0;
    c = 1.17 - pow(c, 1.4);
    o.x = pow(abs(c), 7.0) * 0.35;
    float ly = p.y + sin(p.x * 6.0 + t * 0.9) * 0.006;
    o.x += ln(gridd(ly, 6.0), 0.0005) * 0.22;
  } else if (id < 5.5) { // combat: diagonal light slashes and impact flashes
    float dg = p.x * 0.42 + p.y;
    for (int k = 0; k < 3; k++){
      float ph = fract(t * 0.11 + float(k) * 0.37);
      float pos = ph * 2.8 - 1.4;
      float env = sin(ph * 3.1416);
      o.x += ln(dg - pos, 0.0006) * env * 0.7 + exp(-abs(dg - pos) * 40.0) * env * 0.07;
    }
    float cyc = fract(t / 3.2);
    float idn = floor(t / 3.2);
    vec2 c = (vec2(h21(vec2(idn, 1.0)), h21(vec2(idn, 7.0))) - 0.5) * vec2(sar * 0.8, 0.7);
    float r = length(p - c);
    float flash = exp(-r * 16.0) * exp(-cyc * 7.0) * 0.7;
    o.x += flash + ln(r - cyc * 0.5, 0.001) * (1.0 - cyc) * 0.5;
    o.z += flash * 0.4;
  } else if (id < 6.5) { // boxing: the bell rings out, the ropes shiver
    vec2 c = vec2(sar * 0.24, 0.06);
    float cyc = fract(t / 3.0);
    float r = length(p - c);
    for (int k = 0; k < 3; k++){
      float a = cyc - float(k) * 0.12;
      if (a > 0.0) o.x += ln(r - a * 0.6, 0.0009) * (1.0 - a) * 0.55;
    }
    o.z += exp(-r * 11.0) * (1.0 - cyc) * 0.5;
    for (int k = 0; k < 3; k++){
      float yk = -0.2 - float(k) * 0.075 - 0.03 * cos(p.x * 1.4) + sin(p.x * 22.0 - t * 9.0) * 0.004 * exp(-cyc * 5.0);
      o.x += ln(p.y - yk, 0.0006) * 0.35;
    }
  } else if (id < 7.5) { // learning: ruled paper drifting, margin line, paper grain
    float ly = p.y + t * 0.004;
    o.x = ln(gridd(ly, 22.0), 0.0003) * 0.2;
    o.z = ln(p.x + sar * 0.34, 0.0006) * 0.5;
    o.x += (h21(floor((p + t * 0.01) * R.y / 2.0)) - 0.5) * 0.05;
  } else if (id < 8.5) { // IT: faint lines of code scroll by, one cursor blinks
    float rh = 0.034;
    vec2 q = p + vec2(0.0, t * 0.012);
    float row = floor(q.y / rh);
    float fy = fract(q.y / rh);
    float x0 = -sar * 0.44 + floor(h21(vec2(row, 5.0)) * 4.0) * 0.03;
    float sx = (q.x - x0) / 0.05;
    float seg = floor(sx);
    float len = floor(h21(vec2(row, 3.0)) * 14.0);
    float on = step(0.0, sx) * step(seg, len) * step(0.3, h21(vec2(row, seg))) * step(0.12, fract(sx)) * step(fract(sx), 0.9);
    float bar = on * step(0.36, fy) * step(fy, 0.64) * step(0.3, h21(vec2(row, 9.0)));
    o.x = bar * 0.18 * smoothstep(0.0, -0.1 * sar, p.x - 0.1 * sar);
    float crow = floor(t * 0.25);
    float cur = step(abs(row - (floor(h21(vec2(crow, 2.0)) * 12.0) - 6.0 + floor(t * 0.012 / rh))), 0.5);
    float cx = x0 + (len + 1.2) * 0.05;
    o.z = cur * step(abs(q.x - cx), 0.008) * step(0.25, fy) * step(fy, 0.75) * step(0.5, fract(t * 1.1));
  } else if (id < 9.5) { // climax: slow rays and light converging to the centre
    float r = length(p);
    float a = atan(p.y, p.x);
    o.x = pow(0.5 + 0.5 * sin(a * 18.0 + t * 0.15), 40.0) * smoothstep(1.0, 0.1, r) * 0.35;
    vec2 lp = vec2(a / 6.2832 * 28.0, log(r + 0.001) * 6.0 + t * 0.6);
    vec2 cell = floor(lp);
    o.x += (1.0 - smoothstep(0.05, 0.14, length(fract(lp) - 0.5))) * step(0.62, h21(cell)) * 0.5 * smoothstep(0.02, 0.2, r);
    o.z = exp(-r * 5.0) * 0.18;
  } else if (id < 10.5) { // contact: horizon ripples rising from below
    vec2 c = vec2(0.0, -0.66);
    float r = length((p - c) * vec2(0.55, 1.0));
    float ring = pow(0.5 + 0.5 * sin(r * 30.0 - t * 0.8), 30.0) * smoothstep(1.3, 0.3, r);
    o.x = ring * 0.35;
    o.z = ring * 0.12;
  } else { // no risk: a breathing dark vignette
    float r = length(p);
    o.y = smoothstep(0.15, 0.9, r) * (0.55 + 0.15 * sin(t * 0.5));
    o.x = exp(-r * 3.0) * 0.04;
  }
  return o;
}

// x: how much of slot B shows, y: transition light (negative darkens)
vec2 trans(vec2 uv, float t, float k){
  if (t >= 1.0) return vec2(1.0, 0.0);
  if (t <= 0.0) return vec2(0.0, 0.0);
  float sar = R.x / R.y;
  float bell = sin(t * 3.1416);
  if (k < 0.5) { // chess: board tiles flip over, diagonal stagger
    vec2 n = vec2(floor(8.0 * sar + 0.5), 8.0);
    vec2 c = floor(uv * n);
    float th = (c.x + n.y - 1.0 - c.y) / (n.x + n.y) * 0.65 + h21(c) * 0.35;
    float l = clamp((t * 1.3 - th) / 0.3, 0.0, 1.0);
    float w = abs(cos(l * 3.1416));
    float inside = step(abs(fract(uv.x * n.x) - 0.5), 0.5 * w);
    float gap = (1.0 - inside) * step(0.001, l) * step(l, 0.999);
    return vec2(step(0.5, l), l * (1.0 - l) * 0.8 - gap * 0.6);
  }
  if (k < 1.5) { // football: a line sweeps across the pitch
    float e = t * 1.2 - 0.1;
    return vec2(1.0 - smoothstep(e - 0.02, e, uv.x), exp(-abs(uv.x - e) * 140.0) * bell * 0.9);
  }
  if (k < 2.5) { // swimming: a ripple wave spreads from the centre
    float r = length((uv - 0.5) * vec2(sar, 1.0));
    float e = t * (0.5 * length(vec2(sar, 1.0)) + 0.15);
    float w = sin(r * 45.0 - t * 14.0) * 0.012;
    return vec2(1.0 - smoothstep(e - 0.05, e, r + w), exp(-abs(r + w - e) * 60.0) * bell * 0.4);
  }
  if (k < 3.5) { // combat: one diagonal slice
    float d = (uv.x * sar + 1.0 - uv.y) / (sar + 1.0);
    float e = t * 1.2 - 0.1;
    return vec2(smoothstep(e + 0.003, e - 0.003, d), (exp(-abs(d - e) * 300.0) * 0.9 + exp(-abs(d - e) * 30.0) * 0.15) * bell);
  }
  if (k < 4.5) { // boxing: the bell flash
    float r = length((uv - 0.5) * vec2(sar, 1.0));
    return vec2(smoothstep(0.3, 0.7, t), exp(-pow((t - 0.42) * 6.0, 2.0)) * 0.35 + ln(r - t * 1.2, 0.004) * 0.4 * (1.0 - t));
  }
  if (k < 5.5) { // learning: a page turns from the right
    float e = 1.08 - t * 1.2 + 0.08 * sin(uv.y * 3.1416) * bell;
    float shadow = step(uv.x, e) * exp(-(e - uv.x) * 25.0) * 0.35 * bell;
    return vec2(smoothstep(e - 0.004, e + 0.004, uv.x), exp(-abs(uv.x - e) * 200.0) * 0.5 * bell - shadow);
  }
  float n = h21(floor(gl_FragCoord.xy / 3.0)); // grain dissolve
  return vec2(smoothstep(0.0, 1.0, clamp(t * 1.3 - n * 0.3, 0.0, 1.0)), 0.0);
}

float lum(vec3 c){ return dot(c, vec3(0.299, 0.587, 0.114)); }

void main(){
  vec2 uv = gl_FragCoord.xy / R;
  float sar = R.x / R.y;
  vec2 p = (gl_FragCoord.xy - 0.5 * R) / R.y;
  vec2 m = (M - 0.5) * vec2(sar, 1.0);
  vec2 dm = p - m;
  float md = length(dm) + 1e-4;
  // The cursor sends a faint ripple through the photo and pushes particles and lines aside.
  vec2 ruv = uv + (dm / md) * sin(md * 55.0 - T * 3.0) * 0.0025 * exp(-md * 7.0) / vec2(sar, 1.0);
  vec2 pp = p + (dm / md) * 0.035 * exp(-md * md * 40.0);

  vec2 tr = trans(uv, P, K);
  vec3 ma = motif(MA, pp, T);
  vec3 mb = tr.x > 0.0 ? motif(MB, pp, T) : vec3(0.0);

  float la = 0.0;
  float lb = 0.0;
  if (IA > 0.5) { float l = lum(photo(TA, ARA, ruv, GA)); la = DARK > 0.5 ? pow(l, 1.25) : pow(1.0 - l, 1.5) * 0.3; }
  if (IB > 0.5 && tr.x > 0.0) { float l = lum(photo(TB, ARB, ruv, GB)); lb = DARK > 0.5 ? pow(l, 1.25) : pow(1.0 - l, 1.5) * 0.3; }

  float light = mix(la * SA + ma.x * 0.12, lb * SB + mb.x * 0.12, tr.x) + particles(pp, T) * 0.07 + tr.y * 0.22;
  float shade = mix(ma.y, mb.y, tr.x);
  float acc = mix(ma.z, mb.z, tr.x) * 0.28;
  if (DARK < 0.5) light *= 0.6;

  vec3 col = BG + (FG - BG) * clamp(light, 0.0, 1.0);
  col = mix(col, BG * (1.0 - 0.6 * DARK), shade * 0.5);
  col = mix(col, AC, clamp(acc, 0.0, 1.0));
  col += (h21(gl_FragCoord.xy + fract(T * 7.13) * 100.0) - 0.5) * (2.0 / 255.0);
  gl_FragColor = vec4(col, 1.0);
}`;
