<template>
  <canvas
    ref="canvas"
    class="pointer-events-none opacity-0 transition-opacity duration-1000"
    :class="{ 'opacity-100': running }"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { startShader } from '../shader';

// The light theme tints a white page instead of lighting a dark one.
const props = defineProps<{ light?: boolean }>();

const canvas = ref<HTMLCanvasElement | null>(null);
const running = ref(false);

const FRAGMENT = `
precision highp float;
uniform vec2 resolution;
uniform float time;
uniform float lightTheme;
uniform float background;

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

// Crest height at x; sin(kx + wt) moves left as t grows.
float wave(float x, float t, float seed) {
  return 0.07 * sin(x * 1.9 + t * 0.42 + seed)
       + 0.04 * sin(x * 3.3 + t * 0.61 + seed * 2.3)
       + 0.02 * sin(x * 5.9 + t * 0.93 + seed * 4.1);
}

// Brightest along the crest, trailing down in fine streaks that lean with the slope.
float curtain(float x, float y, float t, float crest, float seed) {
  float d = crest + wave(x, t, seed) - y;
  float glow = d > 0.0 ? exp(-d * 4.5) : exp(d * 30.0);
  float slope = (wave(x + 0.01, t, seed) - wave(x - 0.01, t, seed)) * 50.0;
  float sx = x + slope * max(d, 0.0) * 0.6 + seed;
  float streaks = 0.2
    + 0.5 * pow(0.5 + 0.5 * sin(sx * 41.0), 6.0)
    + 0.35 * pow(0.5 + 0.5 * sin(sx * 97.0 + 1.3), 10.0);
  glow = glow * streaks + exp(-abs(d) * 60.0) * 0.35;
  float swell = 0.55 + 0.45 * sin(x * 1.1 + t * 0.3 + seed * 1.7);
  return glow * swell;
}

float field(float x, float y, float t) {
  return curtain(x, y, t, 0.74, 0.0) * 0.8
       + curtain(x * 1.3, y, t * 0.8, 0.6, 3.7) * 0.45
       + curtain(x * 0.8, y, t * 1.15, 0.88, 7.1) * 0.3;
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  float x = uv.x * resolution.x / resolution.y;
  float split = 0.006;
  vec3 light;

  if (lightTheme > 0.5) {
    light = vec3(0.0);
    for (int k = 0; k < 6; k++) {
      light += hue(k) * field(x + (float(k) - 2.5) * split * 1.6, uv.y, time);
    }
    light /= SPECTRUM_SUM / 3.0;
  } else {
    vec3 band = vec3(field(x - split, uv.y, time), field(x, uv.y, time), field(x + split, uv.y, time));
    light = mix(vec3(band.g), band, 0.8);
  }

  light *= mix(0.35, 1.0, exp(-pow((uv.x - 0.5) * 2.2, 2.0))) * 0.5;
  float noise = (hash(gl_FragCoord.xy + fract(time) * 91.0) - 0.5) * 0.03;

  if (lightTheme > 0.5) {
    vec3 ink = 1.0 - exp(-light * 1.4);
    float amount = max(ink.r, max(ink.g, ink.b));
    vec3 tint = ink / max(amount, 0.001);
    vec3 paper = mix(vec3(1.0), tint, amount * 0.55) * (1.0 - amount * 0.06);
    gl_FragColor = vec4(paper + noise, 1.0);
    return;
  }

  // Slightly cool, compressed so the crests never clip; lit over the page color.
  light *= vec3(0.94, 0.97, 1.04);
  light = 1.0 - exp(-light * 1.15);
  gl_FragColor = vec4(background + (1.0 - background) * light + noise, 1.0);
}
`;

let stop = () => {};

onMounted(() => {
  // #111, the dark page, so the canvas fades into it
  const shader = canvas.value && startShader(canvas.value, FRAGMENT, () => ({ lightTheme: props.light ? 1 : 0, background: 0.067 }));
  if (!shader) return;
  running.value = true;
  stop = shader.stop;
});

onUnmounted(() => stop());
</script>
