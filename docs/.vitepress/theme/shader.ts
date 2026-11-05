import { reactive, watch } from 'vue';

export type ShaderGroup = {
  title: string;
  controls: { key: string; label: string; min: number; max: number; step: number }[];
};

/** A shader's tunable uniforms; in dev, the panel's edits survive a reload. */
export function useShaderSettings<T extends Record<string, number>>(defaults: T, storageKey: string): T {
  const dev = import.meta.env.DEV;
  const settings = reactive({ ...defaults, ...(dev ? stored(storageKey) : {}) }) as T;
  if (dev) {
    watch(settings, (value) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(value));
      } catch {}
    });
  }
  return settings;
}

function stored(key: string): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '{}');
  } catch {
    return {};
  }
}

const VERTEX = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

export interface Shader {
  redraw: () => void;
  stop: () => void;
}

// Uniforms: `resolution`, `time` in seconds, and a float per key of `uniforms()`. Reduced motion draws one frame.
export function startShader(
  canvas: HTMLCanvasElement,
  fragment: string,
  uniforms: () => Record<string, number>
): Shader | null {
  const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false });
  const program = gl && createProgram(gl, fragment);
  if (!gl || !program) return null;

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const resolution = gl.getUniformLocation(program, 'resolution');
  const time = gl.getUniformLocation(program, 'time');
  const locations = new Map<string, WebGLUniformLocation | null>();

  const resize = () => {
    const scale = Math.min(window.devicePixelRatio, 1.5);
    canvas.width = Math.round(canvas.clientWidth * scale);
    canvas.height = Math.round(canvas.clientHeight * scale);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(resolution, canvas.width, canvas.height);
  };

  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const start = performance.now();
  let frame = 0;

  function draw(now: number) {
    for (const [key, value] of Object.entries(uniforms())) {
      if (!locations.has(key)) locations.set(key, gl!.getUniformLocation(program!, key));
      gl!.uniform1f(locations.get(key)!, value);
    }
    gl!.uniform1f(time, (now - start) / 1000 + 40);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
  }

  function loop(now: number) {
    draw(now);
    frame = requestAnimationFrame(loop);
  }

  // resizing clears the canvas, so a still one draws again
  const observer = new ResizeObserver(() => {
    resize();
    if (still) draw(performance.now());
  });
  observer.observe(canvas);
  resize();

  if (still) draw(start);
  else frame = requestAnimationFrame(loop);

  return {
    redraw: () => draw(performance.now()),
    stop() {
      cancelAnimationFrame(frame);
      observer.disconnect();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
  };
}

function createProgram(gl: WebGLRenderingContext, fragment: string): WebGLProgram | null {
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
    console.warn(gl.getShaderInfoLog(shader));
    return null;
  };

  const vertex = compile(gl.VERTEX_SHADER, VERTEX);
  const shader = compile(gl.FRAGMENT_SHADER, fragment);
  if (!vertex || !shader) return null;

  const program = gl.createProgram()!;
  gl.attachShader(program, vertex);
  gl.attachShader(program, shader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);
  return program;
}
