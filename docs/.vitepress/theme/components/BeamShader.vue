<template>
  <canvas
    ref="canvas"
    v-bind="$attrs"
    class="pointer-events-none opacity-0 transition-opacity duration-1000"
    :class="{ 'opacity-100': running }"
    aria-hidden="true"
  />

  <ShaderPanel v-if="dev" label="Beams" :groups="GROUPS" :settings="settings" :defaults="defaults" />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { startShader, useShaderSettings, type ShaderGroup } from '../shader';
import ShaderPanel from './ShaderPanel.vue';

// two roots: the class goes on the canvas
defineOptions({ inheritAttrs: false });

// The light theme tints a white page instead of lighting a dark one.
const props = defineProps<{ light?: boolean }>();

const canvas = ref<HTMLCanvasElement | null>(null);
const running = ref(false);

const DEFAULTS = {
  beams: 12,
  widthMin: 0.015,
  widthRange: 0.04,
  swell: 0.6,
  edgeSize: 0.99,
  middleSize: 0.12,
  edgeDim: 0.17,
  sideFade: 0.21,
  tiltMin: 0.15,
  tiltRange: 0,
  fallMin: 1,
  fallRange: 2.65,
  offsetY: 0,
  minGap: 0.5,
  crowd: 3,
  speedMin: 0.021,
  speedRange: 0,
  dispersion: 0.5,
  color: 0.5,
  brightness: 0.5,
  exposure: 1.45,
  grain: 0.05,
  groups: 5,
  spread: 0.285,
  spacing: 0.22,
  scatter: 0.34
};

const LIGHT_DEFAULTS: Partial<typeof DEFAULTS> = {
  color: 1,
  grain: 0.0225
};

const GROUPS: ShaderGroup[] = [
  {
    title: 'Beams',
    controls: [
      { key: 'beams', label: 'Beams', min: 1, max: 12, step: 1 },
      { key: 'widthMin', label: 'Thinnest', min: 0.005, max: 0.3, step: 0.005 },
      { key: 'widthRange', label: 'Width range', min: 0, max: 0.5, step: 0.005 },
      { key: 'tiltMin', label: 'Lean', min: -0.5, max: 0.5, step: 0.01 },
      { key: 'tiltRange', label: 'Lean range', min: 0, max: 0.5, step: 0.01 },
      { key: 'fallMin', label: 'Fade', min: 0, max: 5, step: 0.05 },
      { key: 'fallRange', label: 'Fade range', min: 0, max: 5, step: 0.05 },
      { key: 'offsetY', label: 'Y offset', min: -0.5, max: 1, step: 0.01 }
    ]
  },
  {
    title: 'Spacing',
    controls: [
      { key: 'minGap', label: 'Smallest gap', min: 0, max: 1, step: 0.01 },
      { key: 'crowd', label: 'Crowding', min: 0.5, max: 6, step: 0.1 }
    ]
  },
  {
    title: 'Middle',
    controls: [
      { key: 'swell', label: 'Swell', min: 0, max: 3, step: 0.05 },
      { key: 'edgeSize', label: 'Edge size', min: 0.05, max: 1, step: 0.01 },
      { key: 'middleSize', label: 'Middle width', min: 0.05, max: 1, step: 0.01 },
      { key: 'edgeDim', label: 'Edge brightness', min: 0, max: 1, step: 0.01 },
      { key: 'sideFade', label: 'Side fade', min: 0, max: 0.5, step: 0.01 }
    ]
  },
  {
    title: 'Motion',
    controls: [
      { key: 'speedMin', label: 'Speed', min: 0, max: 0.1, step: 0.001 },
      { key: 'speedRange', label: 'Speed range', min: 0, max: 0.1, step: 0.001 }
    ]
  },
  {
    title: 'Color',
    controls: [
      { key: 'dispersion', label: 'Rainbow width', min: 0, max: 1, step: 0.01 },
      { key: 'color', label: 'Rainbow amount', min: 0, max: 1, step: 0.01 },
      { key: 'brightness', label: 'Brightness', min: 0, max: 1.5, step: 0.05 },
      { key: 'exposure', label: 'Exposure', min: 0.1, max: 4, step: 0.05 },
      { key: 'grain', label: 'Grain', min: 0, max: 0.15, step: 0.005 }
    ]
  }
];

// A few soft beams falling from the top, drifting right to left and swelling
// as they cross the middle. Same palette as PrismRays.
const FRAGMENT = `
precision highp float;
uniform vec2 resolution;
uniform float time;
uniform float lightTheme;
uniform float background;
${Object.keys(DEFAULTS)
  .map((key) => `uniform float ${key};`)
  .join('\n')}

const int MAX_BEAMS = 12;
const vec3 SPECTRUM_SUM = vec3(3.75, 2.9, 2.4);

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 hue(int k) {
  if (k == 0) return vec3(1.0, 0.1, 0.1);
  if (k == 1) return vec3(1.0, 0.5, 0.0);
  if (k == 2) return vec3(1.0, 0.9, 0.0);
  if (k == 3) return vec3(0.1, 0.9, 0.3);
  if (k == 4) return vec3(0.1, 0.4, 1.0);
  return vec3(0.55, 0.1, 1.0);
}

float beam(float x, float width) {
  return exp(-x * x / (2.0 * width * width));
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  // below the top by offsetY; above that start the beams fade out quickly
  float depth = 1.0 - uv.y - offsetY;
  float start = depth < 0.0 ? exp(depth * 12.0) : 1.0;
  depth = max(depth, 0.0);
  vec3 light = vec3(0.0);

  // Random gaps, mostly small with now and then a wide one: bunches and loners.
  float total = 0.0;
  for (int i = 0; i < MAX_BEAMS; i++) {
    if (float(i) >= beams) break;
    total += mix(minGap, 1.0, pow(hash(vec2(float(i), 8.9)), crowd));
  }
  float along = 0.0;

  for (int i = 0; i < MAX_BEAMS; i++) {
    float f = float(i);
    if (f >= beams) break;

    // One after another around the loop; at one speed the gaps hold.
    along += mix(minGap, 1.0, pow(hash(vec2(f, 8.9)), crowd));
    float speed = speedMin + speedRange * (hash(vec2(f, 1.1)) - 0.5);
    // Wraps just off-screen: from past the right edge to past the left one.
    float pos = mix(1.25, -0.25, fract(along / total + time * speed));
    float middle = exp(-pow((pos - 0.5) / middleSize, 2.0));

    // Thin to broad; small coming in from the right, full in the middle, small again leaving.
    float width = (widthMin + widthRange * hash(vec2(f, 3.7))) * mix(edgeSize, 1.0 + swell, middle);
    float strength = (0.45 + 0.55 * hash(vec2(f, 5.3))) * mix(edgeDim, 1.0, middle);
    strength *= 1.0 - smoothstep(0.6, 0.75, abs(pos - 0.5));

    // Leaning a little, and fading as they fall.
    float x = uv.x - pos + depth * (tiltMin + tiltRange * hash(vec2(f, 4.1)));
    float fall = exp(-depth * (fallMin + fallRange * hash(vec2(f, 6.7))));
    float split = width * dispersion;

    vec3 band;
    if (lightTheme > 0.5) {
      band = vec3(0.0);
      for (int k = 0; k < 6; k++) band += hue(k) * beam(x + (float(k) - 2.5) * split, width);
      band /= SPECTRUM_SUM / 3.0;
    } else {
      band = vec3(beam(x - split, width), beam(x, width), beam(x + split, width));
    }
    band = mix(vec3(band.g), band, color);

    // Screen blend: overlaps brighten, but the sum never washes out past brightness.
    vec3 lit = clamp(band * strength * fall * start * brightness, 0.0, 1.0);
    light += lit * (1.0 - light);
  }

  // Gone by the screen's left and right edges.
  light *= smoothstep(0.0, max(sideFade, 0.001), uv.x) * smoothstep(0.0, max(sideFade, 0.001), 1.0 - uv.x);
  float noise = (hash(gl_FragCoord.xy + fract(time) * 91.0) - 0.5) * grain;

  if (lightTheme > 0.5) {
    vec3 ink = 1.0 - exp(-light * exposure);
    float amount = max(ink.r, max(ink.g, ink.b));
    vec3 tint = ink / max(amount, 0.001);
    vec3 paper = mix(vec3(1.0), tint, amount * 0.5) * (1.0 - amount * 0.08);
    gl_FragColor = vec4(paper + noise, 1.0);
    return;
  }

  // Slightly cool, compressed so overlapping beams never clip; lit over the page color.
  light *= vec3(0.94, 0.97, 1.04);
  light = 1.0 - exp(-light * exposure);
  gl_FragColor = vec4(background + (1.0 - background) * light + noise, 1.0);
}
`;

const dev = import.meta.env.DEV;
const defaults = props.light ? { ...DEFAULTS, ...LIGHT_DEFAULTS } : DEFAULTS;
const settings = useShaderSettings(defaults, props.light ? 'beam-shader-light' : 'beam-shader');

let stop = () => {};

onMounted(() => {
  // #111, the dark page, so the canvas fades into it
  const shader =
    canvas.value &&
    startShader(canvas.value, FRAGMENT, () => ({ ...settings, lightTheme: props.light ? 1 : 0, background: 0.067 }));
  if (!shader) return;

  // the panel's changes show at once, even on a still page
  const unwatch = watch(settings, shader.redraw);
  running.value = true;

  stop = () => {
    unwatch();
    shader.stop();
  };
});

onUnmounted(() => stop());
</script>
