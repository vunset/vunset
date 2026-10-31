<script lang="ts">
// Each pattern: which keyframes its dots run, for how long, and when each of
// the 25 starts, row by row; `null` sits a dot out, dimmer, so a shape reads.
// The delays sit on the dots themselves, so the stylesheet holds only the keyframes.
interface Pattern {
  keyframes: 'pulse' | 'blink' | 'wave' | 'dna' | 'beat';
  duration: number;
  easing: string;
  delays: (number | null)[];
}

const ms = (seconds: number) => Math.round(seconds * 1000) / 1000;

/** Delays that send one lit dot round `path` once per `duration`, already under way. */
function around(path: number[], duration: number, delays: (number | null)[]) {
  const step = duration / path.length;
  path.forEach((dot, index) => (delays[dot] = ms(index * step - duration)));
  return delays;
}

const OUTER_RING = [0, 1, 2, 3, 4, 9, 14, 19, 24, 23, 22, 21, 20, 15, 10, 5];
// The ring inside it, the other way round.
const INNER_RING = [6, 11, 16, 17, 18, 13, 8, 7];

const HEART = [1, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 22];

const PATTERNS = {
  spiral: {
    keyframes: 'pulse',
    duration: 2,
    easing: 'ease',
    delays: [
      0, 0.07, 0.14, 0.21, 0.28, 1.05, 1.12, 1.19, 1.26, 0.35, 0.98, 1.61, 1.68, 1.33, 0.42, 0.91, 1.54, 1.47, 1.4,
      0.49, 0.84, 0.77, 0.7, 0.63, 0.56
    ]
  },
  columns: {
    keyframes: 'blink',
    duration: 0.58,
    easing: 'ease-in-out',
    delays: [
      -0.28, 0, -0.28, 0, -0.28, -0.21, -0.07, -0.21, -0.07, -0.21, -0.14, -0.14, -0.14, -0.14, -0.14, -0.07, -0.21,
      -0.07, -0.21, -0.07, 0, -0.28, 0, -0.28, 0
    ]
  },
  waves: {
    keyframes: 'wave',
    duration: 0.65,
    easing: 'ease-in-out',
    delays: [
      -0.35, -0.28, -0.21, -0.28, -0.35, -0.28, -0.14, -0.07, -0.14, -0.28, -0.21, -0.07, 0, -0.07, -0.21, -0.28,
      -0.14, -0.07, -0.14, -0.28, -0.35, -0.28, -0.21, -0.28, -0.35
    ]
  },
  helix: {
    keyframes: 'pulse',
    duration: 2,
    easing: 'ease',
    delays: [
      0.28, 0.98, 1.68, 1.05, 1.75, 0.21, 0.91, 1.61, 1.12, 1.82, 0.14, 0.84, 1.54, 1.19, 1.89, 0.07, 0.77, 1.47, 1.26,
      1.96, 0, 0.7, 1.4, 1.33, 2.03
    ]
  },
  chaotic: {
    keyframes: 'pulse',
    duration: 0.5,
    easing: 'ease-in-out',
    delays: [
      0.77, 0.07, 1.05, 0.63, 0.7, 0.21, 1.19, 1.61, 0.42, 1.12, 0.56, 1.47, 0.35, 0.14, 1.26, 0.49, 0.84, 0.28, 1.54,
      1.4, 1.68, 0.98, 0.91, 1.33, 0
    ]
  },
  // Each row a beat behind the one above; which column lights follows the
  // animated `--app-dot-matrix-t`, in the stylesheet.
  dna: {
    keyframes: 'dna',
    duration: 1,
    easing: 'ease-in-out',
    delays: Array.from({ length: 25 }, (_, index) => Math.floor(index / 5) * 0.12)
  },
  romb: {
    keyframes: 'blink',
    duration: 0.5,
    easing: 'steps(1, end)',
    delays: [
      0, -0.07, -0.14, -0.07, 0, -0.07, -0.14, -0.21, -0.14, -0.07, -0.14, -0.21, -0.28, -0.21, -0.14, -0.07, -0.14,
      -0.21, -0.14, -0.07, 0, -0.07, -0.14, -0.07, 0
    ]
  },
  cascade: {
    keyframes: 'wave',
    duration: 0.74,
    easing: 'ease-in-out',
    delays: [
      -0.44, -0.4, -0.36, -0.32, -0.28, -0.37, -0.33, -0.29, -0.25, -0.21, -0.3, -0.26, -0.22, -0.18, -0.14, -0.23,
      -0.19, -0.15, -0.11, -0.07, -0.16, -0.12, -0.08, -0.04, 0
    ]
  },
  // Two rings turning against each other round a still center.
  orbit: {
    keyframes: 'pulse',
    duration: 1.6,
    easing: 'ease-out',
    delays: around(INNER_RING, 1.6, around(OUTER_RING, 1.6, Array<number | null>(25).fill(null)))
  },
  // A heart that beats twice, from its middle out; the dots around it sit out.
  heart: {
    keyframes: 'beat',
    duration: 1.2,
    easing: 'ease-out',
    delays: Array.from({ length: 25 }, (_, index) =>
      HEART.includes(index) ? ms((Math.abs((index % 5) - 2) + Math.abs(Math.floor(index / 5) - 1.5)) * 0.03) : null
    )
  }
} satisfies Record<string, Pattern>;

/** A pattern AppDotMatrix draws. */
export type AppDotMatrixVariant = keyof typeof PATTERNS;

export const APP_DOT_MATRIX_VARIANTS = Object.keys(PATTERNS) as AppDotMatrixVariant[];
</script>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

defineOptions({ name: 'AppDotMatrix' });

const props = withDefaults(
  defineProps<{
    /** The pattern; `random` picks one once mounted, so a server render and the page agree. */
    variant?: AppDotMatrixVariant | 'random';
    /** The dots' shape. */
    shape?: 'circle' | 'square';
    /** Names it for assistive technology. Without it, it is decoration beside text that says what is loading. */
    label?: string;
  }>(),
  { variant: 'random', shape: 'circle' }
);

const picked = ref<AppDotMatrixVariant>('spiral');
onMounted(() => {
  picked.value = APP_DOT_MATRIX_VARIANTS[Math.floor(Math.random() * APP_DOT_MATRIX_VARIANTS.length)]!;
});

const variant = computed(() => (props.variant === 'random' ? picked.value : props.variant));
const pattern = computed<Pattern>(() => PATTERNS[variant.value]);

const rootStyle = computed(() => ({
  '--app-dot-matrix-keyframes': `app-dot-matrix-${pattern.value.keyframes}`,
  '--app-dot-matrix-duration': `${pattern.value.duration}s`,
  '--app-dot-matrix-easing': pattern.value.easing
}));

const delayOf = (index: number) => pattern.value.delays[index] ?? null;

const dotStyle = (index: number) => {
  const delay = delayOf(index);
  if (delay === null) return undefined;
  return {
    animationDelay: `${delay}s`,
    ...(pattern.value.keyframes === 'dna' ? { '--app-dot-matrix-phase': (index % 5) / 4 } : null)
  };
};
</script>

<template>
  <span
    class="app-dot-matrix"
    :data-variant="variant"
    :data-shape="shape"
    :style="rootStyle"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : true"
  >
    <span
      v-for="index in 25"
      :key="index"
      :style="dotStyle(index - 1)"
      :data-rest="delayOf(index - 1) === null || undefined"
    />
  </span>
</template>
