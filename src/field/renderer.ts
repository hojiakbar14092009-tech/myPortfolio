import { cfgOf, type Colors, type In, type Out } from './config';
import { FRAG, VERT } from './shaders';

/*
  The field renderer. Runs inside a worker on an OffscreenCanvas (so context creation, shader compile and
  every frame stay off the main thread), or on the main thread where OffscreenCanvas isn't available.
  Two photo slots, double-buffered: the outgoing chapter stays until the incoming texture is decoded and
  its transition has fully covered it.
*/

type Slot = { key: string; tex: WebGLTexture | null; ar: number; born: number; str: number };
type Tex = { tex: WebGLTexture; ar: number } | 'loading' | 'error';
type Canvas = HTMLCanvasElement | OffscreenCanvas;

const raf: (f: (t: number) => void) => number =
  typeof requestAnimationFrame === 'function' ? requestAnimationFrame.bind(globalThis) : (f) => setTimeout(() => f(performance.now()), 16) as unknown as number;
const caf: (id: number) => void = typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame.bind(globalThis) : clearTimeout;

export function createRenderer(canvas: Canvas, init: { w: number; h: number; touch: boolean; colors: Colors }, emit: (o: Out) => void) {
  const fail = () => { emit({ type: 'fail' }); return () => {}; };
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power', failIfMajorPerformanceCaveat: true }) as WebGLRenderingContext | null;
  if (!gl) return fail();
  // A software rasteriser draws a full-screen shader on the CPU every frame: the static field is better.
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
  if (/swiftshader|llvmpipe|software|basic render/i.test(renderer)) {
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return fail();
  }

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram()!;
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn('Field shader failed:', gl.getShaderInfoLog(fs));
    return fail();
  }
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aLoc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(aLoc);
  gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);
  const locs: Record<string, WebGLUniformLocation | null> = {};
  const U = (k: string) => (k in locs ? locs[k] : (locs[k] = gl.getUniformLocation(prog, k)));
  gl.uniform1i(U('TA'), 0);
  gl.uniform1i(U('TB'), 1);

  const size = (w: number, h: number) => {
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
  };
  size(init.w, init.h);

  let colors = init.colors;
  let hidden = false;
  let vel = 0;
  const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  let target = { key: 'none', url: undefined as string | undefined, str: 0 };

  /* Textures: fetched and decoded off-thread, uploaded once, cached by URL. */
  const texs = new Map<string, Tex>();
  const load = (url: string) => {
    if (texs.has(url)) return;
    texs.set(url, 'loading');
    fetch(url)
      .then((r) => r.blob())
      .then((b) => createImageBitmap(b))
      .then((bmp) => {
        const tex = gl.createTexture()!;
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, bmp);
        texs.set(url, { tex, ar: bmp.width / bmp.height });
        bmp.close();
      })
      .catch(() => texs.set(url, 'error'));
  };

  const slot = (now: number): Slot | null => {
    const { key, url, str } = target;
    if (!url) return { key, tex: null, ar: 1, born: now, str };
    load(url);
    const t = texs.get(url);
    if (t === 'loading') return null; // keep the old chapter on screen until this one can cover it
    if (t === 'error' || !t) return { key, tex: null, ar: 1, born: now, str: 0 };
    return { key, tex: t.tex, ar: t.ar, born: now, str };
  };

  let A: Slot = { key: 'none', tex: null, ar: 1, born: 0, str: 0 };
  let B: Slot | null = null;
  let t = 0;
  let last = performance.now();
  let id = 0;
  let frame = 0;
  let drawn = 0;
  const t0 = last;

  const loop = (now: number) => {
    id = raf(loop);
    const gap = now - last;
    const dt = Math.min(gap / 1000, 0.1);
    last = now;
    if (hidden) return;
    if (gap > 500 && B) { A = B; B = null; t = 0; } // back from a hidden tab: don't replay a stale transition
    if (init.touch && ++frame % 2) return; // phones: 30fps is plenty for a background

    if (B) {
      const hurry = target.key !== B.key ? 2.5 : 1; // scrolling fast: finish quickly, then follow
      t = Math.min(1, t + (dt * hurry) / cfgOf(B.key).dur);
      if (t >= 1) { A = B; B = null; t = 0; }
    } else if (target.key !== A.key) {
      const next = slot(now / 1000);
      if (next) { B = next; t = 0; }
    }
    if (!B && A.key === 'cover' && drawn > 2) return; // covered: nothing to paint

    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    const time = (now - t0) / 1000;
    const cb = cfgOf(B?.key ?? 'none');
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, A.tex);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, B?.tex ?? null);
    gl.uniform2f(U('R'), canvas.width, canvas.height);
    gl.uniform1f(U('T'), time);
    gl.uniform2f(U('M'), mouse.x, mouse.y);
    gl.uniform1f(U('V'), vel);
    gl.uniform3fv(U('BG'), colors.bg);
    gl.uniform3fv(U('FG'), colors.fg);
    gl.uniform3fv(U('AC'), colors.ac);
    gl.uniform1f(U('DARK'), colors.dark ? 1 : 0);
    gl.uniform1f(U('IA'), A.tex ? 1 : 0);
    gl.uniform1f(U('IB'), B?.tex ? 1 : 0);
    gl.uniform1f(U('ARA'), A.ar);
    gl.uniform1f(U('ARB'), B?.ar ?? 1);
    gl.uniform1f(U('SA'), A.str);
    gl.uniform1f(U('SB'), B?.str ?? 0);
    gl.uniform1f(U('MA'), cfgOf(A.key).motif);
    gl.uniform1f(U('MB'), cb.motif);
    gl.uniform1f(U('GA'), time - A.born + 40);
    gl.uniform1f(U('GB'), B ? time - B.born + 40 : 0);
    gl.uniform1f(U('P'), B ? t : 0);
    gl.uniform1f(U('K'), cb.trans);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (++drawn === 2) emit({ type: 'ready' });
    if (A.key !== 'cover' || B) drawn = Math.min(drawn, 2);
  };
  id = raf(loop);

  const handle = (m: In) => {
    switch (m.type) {
      case 'target': target = { key: m.key, url: m.url, str: m.str }; break;
      case 'prefetch': load(m.url); break;
      case 'mouse': mouse.tx = m.x; mouse.ty = m.y; break;
      case 'vel': vel = m.v; break;
      case 'resize': size(m.w, m.h); break;
      case 'colors': colors = m.colors; break;
      case 'hidden': hidden = m.hidden; break;
      case 'stop': caf(id); gl.getExtension('WEBGL_lose_context')?.loseContext(); break;
    }
  };
  return handle;
}
