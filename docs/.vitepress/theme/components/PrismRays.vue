<template>
  <canvas
    ref="canvas"
    class="fixed pointer-events-none -z-1 inset-0 size-full opacity-0 transition-opacity duration-1000"
    :class="{ 'opacity-100': running }"
    aria-hidden="true"
  />

  <div v-if="dev" class="fixed right-4 bottom-4 z-50 w-84 text-xs text-surface">
    <div
      v-if="panelOpen"
      class="mb-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-edge-subtle bg-canvas/90 p-4 backdrop-blur"
    >
      <div v-for="group in GROUPS" :key="group.title" class="mb-4 last:mb-0">
        <div class="mb-2 font-medium text-muted">{{ group.title }}</div>

        <label
          v-for="control in group.controls"
          :key="control.key"
          class="mb-1.5 grid grid-cols-[6.5rem_1fr_3.25rem] items-center gap-2"
        >
          <span class="truncate">{{ control.label }}</span>
          <input
            v-model.number="settings[control.key]"
            type="range"
            :min="control.min"
            :max="control.max"
            :step="control.step"
            class="accent-accent"
          />
          <span class="text-right font-mono text-muted">{{ settings[control.key] }}</span>
        </label>
      </div>

      <div class="mt-4 flex gap-2">
        <button type="button" class="flex-1 rounded-full bg-accent px-3 py-1.5 font-medium text-canvas" @click="copy">
          {{ copied ? 'Copied' : 'Copy values' }}
        </button>
        <button type="button" class="rounded-full border border-edge-subtle px-3 py-1.5" @click="reset">Reset</button>
      </div>
    </div>

    <button
      type="button"
      class="ml-auto block rounded-full border border-edge-subtle bg-canvas/90 px-3 py-1.5 backdrop-blur"
      @click="panelOpen = !panelOpen"
    >
      {{ panelOpen ? 'Hide rays panel' : 'Rays panel' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue';

const canvas = ref<HTMLCanvasElement | null>(null);
const running = ref(false);

const DEFAULTS = {
  originX: 0.85,
  originY: -0.3,
  fanLeft: -1.32,
  fanRight: 0.62,
  rays: 12,
  bend: 0.07,
  widthMin: 0.07,
  widthRange: 0.15,
  broadDim: 0.5,
  reachMin: 1.1,
  reachRange: 1.8,
  dispersion: 0.2,
  color: 0.835,
  pulseSpeed: 3,
  pulseSpacing: 5,
  pulseFloor: 0.4,
  sway: 1,
  brightness: 0.95,
  exposure: 1.15,
  hazeX: 0.12,
  hazeY: -0.15,
  hazeStrength: 0.3,
  corner: 0.35,
  grain: 0.035

  // originX: 0.49,
  // originY: 0.29,
  // fanLeft: -1.56,
  // fanRight: 1.88,
  // rays: 6,
  // bend: 1,
  // widthMin: 0.115,
  // widthRange: 0.195,
  // broadDim: 0.6,
  // reachMin: 1.2,
  // reachRange: 3.05,
  // dispersion: 0.23,
  // color: 0.695,
  // pulseSpeed: 2.6,
  // pulseSpacing: 11,
  // pulseFloor: 0.25,
  // sway: 2.7,
  // brightness: 0.6,
  // exposure: 1.4,
  // hazeX: 0.7,
  // hazeY: 0.04,
  // hazeStrength: 0.07,
  // corner: 1,
  // grain: 0.04
};

type Key = keyof typeof DEFAULTS;
type Control = { key: Key; label: string; min: number; max: number; step: number };

const GROUPS: { title: string; controls: Control[] }[] = [
  {
    title: 'Origin and fan',
    controls: [
      { key: 'originX', label: 'Origin x', min: -0.2, max: 1.2, step: 0.01 },
      { key: 'originY', label: 'Origin y', min: -1, max: 1, step: 0.01 },
      { key: 'fanLeft', label: 'Fan left', min: -3.14, max: 0, step: 0.01 },
      { key: 'fanRight', label: 'Fan right', min: 0, max: 3.14, step: 0.01 },
      { key: 'rays', label: 'Rays', min: 1, max: 24, step: 1 },
      { key: 'bend', label: 'Bend', min: 0, max: 1, step: 0.01 }
    ]
  },
  {
    title: 'Size',
    controls: [
      { key: 'widthMin', label: 'Thinnest', min: 0.005, max: 0.3, step: 0.005 },
      { key: 'widthRange', label: 'Width range', min: 0, max: 0.5, step: 0.005 },
      { key: 'broadDim', label: 'Broad brightness', min: 0, max: 1.5, step: 0.05 },
      { key: 'reachMin', label: 'Fade', min: 0.2, max: 5, step: 0.05 },
      { key: 'reachRange', label: 'Fade range', min: 0, max: 5, step: 0.05 }
    ]
  },
  {
    title: 'Color',
    controls: [
      { key: 'dispersion', label: 'Rainbow width', min: 0, max: 1, step: 0.01 },
      { key: 'color', label: 'Rainbow amount', min: 0, max: 1.5, step: 0.005 },
      { key: 'brightness', label: 'Brightness', min: 0, max: 3, step: 0.05 },
      { key: 'exposure', label: 'Exposure', min: 0.1, max: 4, step: 0.05 },
      { key: 'grain', label: 'Grain', min: 0, max: 0.15, step: 0.005 }
    ]
  },
  {
    title: 'Motion',
    controls: [
      { key: 'pulseSpeed', label: 'Pulse speed', min: 0, max: 12, step: 0.1 },
      { key: 'pulseSpacing', label: 'Pulse spacing', min: 0, max: 20, step: 0.5 },
      { key: 'pulseFloor', label: 'Pulse floor', min: 0, max: 1, step: 0.05 },
      { key: 'sway', label: 'Sway', min: 0, max: 4, step: 0.05 }
    ]
  },
  {
    title: 'Background',
    controls: [
      { key: 'hazeX', label: 'Haze x', min: -0.2, max: 1.2, step: 0.01 },
      { key: 'hazeY', label: 'Haze y', min: -1, max: 1, step: 0.01 },
      { key: 'hazeStrength', label: 'Haze', min: 0, max: 1, step: 0.01 },
      { key: 'corner', label: 'Dark corner', min: 0, max: 1, step: 0.01 }
    ]
  }
];

const dev = import.meta.env.DEV;
const STORAGE_KEY = 'prism-rays';
const settings = reactive({ ...DEFAULTS, ...(dev ? stored() : {}) });
const panelOpen = ref(false);
const copied = ref(false);

function stored(): Partial<typeof DEFAULTS> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

if (dev) {
  watch(settings, (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {}
  });
}

function reset() {
  Object.assign(settings, DEFAULTS);
}

async function copy() {
  await navigator.clipboard.writeText(JSON.stringify(settings, null, 2));
  copied.value = true;
  setTimeout(() => (copied.value = false), 1500);
}

const VERTEX = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

// Soft rays fanning out from a point below the screen, each split into its
// red, green and blue a little apart, which is what gives the edges their rainbow.
const FRAGMENT = `
precision highp float;
uniform vec2 resolution;
uniform float time;
${Object.keys(DEFAULTS)
  .map((key) => `uniform float ${key};`)
  .join('\n')}

const int MAX_RAYS = 24;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

// One ray's light at angle a: a soft body with a brighter, narrower core.
float ray(float a, float width) {
  float body = exp(-a * a / (2.0 * width * width));
  float core = exp(-a * a / (0.18 * width * width));
  return body * 0.55 + core * 0.45;
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  float aspect = resolution.x / resolution.y;
  vec2 p = vec2(uv.x * aspect, uv.y) - vec2(originX * aspect, originY);
  float r = length(p);
  // 0 straight up, negative to the left
  float angle = atan(p.x, p.y);

  vec3 light = vec3(0.0);

  for (int i = 0; i < MAX_RAYS; i++) {
    float f = float(i);
    if (f >= rays) break;

    float spread = mix(fanLeft, fanRight, f / max(rays - 1.0, 1.0));
    float swing = sway * (0.035 * sin(time * 0.11 + f * 1.7) + 0.02 * sin(time * 0.07 + f * 2.9));

    // From thin streaks to broad glows; the broad ones dimmer, so they don't wash out.
    float size = hash(vec2(f, 3.1));
    float width = widthMin + widthRange * size * size;
    float strength = (0.35 + 0.65 * hash(vec2(f, 7.7))) * mix(1.25, broadDim, size);
    strength *= 0.75 + 0.25 * sin(time * 0.17 + f * 2.3);

    // How far it reaches before fading: some stop short, some reach the top.
    float reach = reachMin + reachRange * hash(vec2(f, 9.4));

    // Rays bend a little as they leave the origin.
    float curve = bend * (hash(vec2(f, 1.3)) - 0.5) * r * r;
    float a = angle - spread - swing - curve;
    float split = width * dispersion;
    vec3 band = vec3(ray(a - split, width), ray(a, width), ray(a + split, width));

    // Dispersion shows on the strong rays; the faint ones stay gray.
    float tint = color + 0.65 * smoothstep(0.55, 0.95, strength);
    vec3 gray = vec3(band.g);

    // Soft pulses traveling outward along the ray, each ray at its own pace.
    float speed = 0.35 + 0.3 * hash(vec2(f, 5.3));
    float wave = 0.5 + 0.5 * sin(r * pulseSpacing - time * speed * pulseSpeed + f * 2.1);
    float pulse = mix(pulseFloor, 1.0, wave * wave);

    light += mix(gray, band, tint) * strength * pulse * exp(-r * reach);
  }

  // Faded in just above where they come from; each ray fades out by its own reach.
  light *= smoothstep(0.0, 0.3, r) * brightness;

  // The gray haze.
  vec2 haze = vec2(uv.x * aspect, uv.y) - vec2(hazeX * aspect, hazeY);
  light += vec3(0.42, 0.43, 0.45) * exp(-dot(haze, haze) * 3.5) * hazeStrength;

  // Darkest in the top-left, where the heading sits.
  light *= mix(corner, 1.0, smoothstep(0.1, 0.95, uv.x * 0.6 + (1.0 - uv.y) * 0.6));

  // Slightly cool, compressed so bright rays never clip.
  light *= vec3(0.94, 0.97, 1.04);
  light = 1.0 - exp(-light * exposure);

  float noise = (hash(gl_FragCoord.xy + fract(time) * 91.0) - 0.5) * grain;
  gl_FragColor = vec4(light + vec3(0.012) + noise, 1.0);
}
`;

let stop = () => {};

onMounted(() => {
  const el = canvas.value;
  const gl = el?.getContext('webgl', { antialias: false, premultipliedAlpha: false });
  if (!el || !gl) return;

  const program = createProgram(gl);
  if (!program) return;

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const resolution = gl.getUniformLocation(program, 'resolution');
  const time = gl.getUniformLocation(program, 'time');
  const uniforms = (Object.keys(DEFAULTS) as Key[]).map((key) => [key, gl.getUniformLocation(program, key)] as const);

  const resize = () => {
    const scale = Math.min(window.devicePixelRatio, 1.5);
    el.width = Math.round(el.clientWidth * scale);
    el.height = Math.round(el.clientHeight * scale);
    gl.viewport(0, 0, el.width, el.height);
    gl.uniform2f(resolution, el.width, el.height);
  };

  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const start = performance.now();
  let frame = 0;

  const observer = new ResizeObserver(() => {
    resize();
    if (still) draw(performance.now());
  });
  observer.observe(el);
  resize();

  function draw(now: number) {
    for (const [key, location] of uniforms) gl!.uniform1f(location, settings[key]);
    gl!.uniform1f(time, (now - start) / 1000 + 40);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
  }

  function loop(now: number) {
    draw(now);
    frame = requestAnimationFrame(loop);
  }

  // A still page redraws only when a setting changes.
  const unwatch = still ? watch(settings, () => draw(performance.now())) : () => {};

  if (still) draw(start);
  else frame = requestAnimationFrame(loop);
  running.value = true;

  stop = () => {
    cancelAnimationFrame(frame);
    unwatch();
    observer.disconnect();
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
});

onUnmounted(() => stop());

function createProgram(gl: WebGLRenderingContext): WebGLProgram | null {
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
    console.warn(gl.getShaderInfoLog(shader));
    return null;
  };

  const vertex = compile(gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT);
  if (!vertex || !fragment) return null;

  const program = gl.createProgram()!;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);
  return program;
}
</script>
