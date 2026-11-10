<script lang="ts">
import type { FlowPart } from './app-number-flow';

/** The way a changed digit rolls: `1` up, `-1` down, `0` each its own shorter way. */
export type AppNumberFlowTrend = 1 | 0 | -1;

// A wheel holds 0–9 three times over and rests on the middle run, so a roll can carry on past 9
// or back past 0 onto a neighboring run, then settle back on the middle one where it looks the same.
const RUN = 10;
const CELLS = Array.from({ length: RUN * 3 }, (_, index) => index % RUN);

// What the digits read as a number, to tell which way the value moved.
function amountOf(parts: FlowPart[]): number {
  const whole = parts.filter((part) => part.key.startsWith('i')).map((part) => part.char).join('');
  const fraction = parts.filter((part) => /^f\d+$/.test(part.key)).map((part) => part.char).join('');
  return Number(`${whole || '0'}.${fraction || '0'}`);
}
</script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { toFlowParts } from './app-number-flow';

defineOptions({ name: 'AppNumberFlow' });

const props = defineProps<{
  /** The value: a number, formatted with `format` and `locale`, or text as it should read (`$1,234.56`, `Computing`). */
  value: number | string;
  /** How a number is written, as `Intl.NumberFormat` options. As `String()` writes it otherwise. */
  format?: Intl.NumberFormatOptions;
  /** The locale `format` uses. @default 'en-US' */
  locale?: Intl.LocalesArgument;
  /** Which way changed digits roll. Up when the value grows and down when it shrinks, by default. */
  trend?: AppNumberFlowTrend;
  /** Whether the first value animates in too. */
  appear?: boolean;
}>();

const parts = computed(() =>
  toFlowParts(props.value, { locale: props.locale, ...(props.format ?? { useGrouping: false, maximumFractionDigits: 20 }) })
);
const text = computed(() => parts.value.map((part) => part.char).join(''));

interface Wheel {
  /** The cell shown, of the thirty. */
  at: number;
  rolling: boolean;
}

const wheels = ref<Record<string, Wheel>>({});

function rest(): Record<string, Wheel> {
  return Object.fromEntries(
    parts.value.filter((part) => part.digit !== null).map((part) => [part.key, { at: RUN + part.digit!, rolling: false }])
  );
}

wheels.value = rest();

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

watch(parts, (next, previous) => {
  if (reducedMotion()) {
    wheels.value = rest();
    return;
  }
  const before = new Map(previous.map((part) => [part.key, part.digit]));
  const trend = props.trend ?? Math.sign(amountOf(next) - amountOf(previous));
  const moved: Record<string, Wheel> = {};

  for (const part of next) {
    if (part.digit === null) continue;
    const from = before.get(part.key);
    const to = part.digit;
    if (from === undefined || from === null || from === to) {
      moved[part.key] = { at: RUN + to, rolling: false };
      continue;
    }
    const way = trend || Math.sign(to - from);
    const steps = way > 0 ? (to - from + RUN) % RUN : -((from - to + RUN) % RUN);
    moved[part.key] = { at: RUN + from + steps, rolling: true };
  }
  wheels.value = moved;
});

// Back on the middle run once a roll ends, without a transition: the same digit, ready to roll either way.
function settle(key: string, digit: number) {
  const wheel = wheels.value[key];
  if (wheel?.rolling) wheels.value = { ...wheels.value, [key]: { at: RUN + digit, rolling: false } };
}

// A leaving character keeps its place while it fades, rather than jumping to the start.
function holdPlace(element: Element) {
  const el = element as HTMLElement;
  el.style.left = `${el.offsetLeft}px`;
  el.style.top = `${el.offsetTop}px`;
}
</script>

<template>
  <!-- Read once, whole; the characters that animate are hidden from assistive technology. -->
  <span class="app-number-flow">
    <span class="app-number-flow-text">{{ text }}</span>
    <TransitionGroup
      tag="span"
      name="app-number-flow"
      class="app-number-flow-chars"
      aria-hidden="true"
      :appear="appear"
      @before-leave="holdPlace"
    >
      <span
        v-for="(part, index) in parts"
        :key="part.key"
        class="app-number-flow-char"
        :data-digit="part.digit === null ? undefined : ''"
        :style="{ '--app-number-flow-index': index }"
      >
        <span v-if="part.digit !== null" class="app-number-flow-digit">
          <span
            class="app-number-flow-wheel"
            :data-rolling="wheels[part.key]?.rolling ? '' : undefined"
            :style="{ '--app-number-flow-at': wheels[part.key]?.at ?? RUN + part.digit }"
            @transitionend.self="settle(part.key, part.digit)"
          >
            <span v-for="(cell, at) in CELLS" :key="at" class="app-number-flow-cell">{{ cell }}</span>
          </span>
          <!-- Sizes the wheel's slot to the digit it shows. -->
          <span class="app-number-flow-sizer">{{ part.char }}</span>
        </span>
        <template v-else>{{ part.char }}</template>
      </span>
    </TransitionGroup>
  </span>
</template>
