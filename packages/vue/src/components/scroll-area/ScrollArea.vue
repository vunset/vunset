<script lang="ts">
export type ScrollAreaFade = boolean | 'x' | 'y' | 'both';

export type ScrollAreaAxis = 'x' | 'y' | 'both';

export const OVERFLOW_X_START_VAR = '--scroll-area-overflow-x-start';
export const OVERFLOW_X_END_VAR = '--scroll-area-overflow-x-end';
export const OVERFLOW_Y_START_VAR = '--scroll-area-overflow-y-start';
export const OVERFLOW_Y_END_VAR = '--scroll-area-overflow-y-end';

export const FADE_SIZE_VAR = '--scroll-area-fade-size';

const DEFAULT_FADE_SIZE = '40px';

const EDGE_TOLERANCE = 1;

export interface ScrollAreaState {
  /**
   * Whether the content is wider than the area.
   * @attribute `data-has-overflow-x` while true
   */
  hasOverflowX: boolean;
  /**
   * Whether the content is taller than the area.
   * @attribute `data-has-overflow-y` while true
   */
  hasOverflowY: boolean;
  /**
   * Whether there is content hidden past the start edge.
   * @attribute `data-overflow-x-start` while true
   */
  overflowXStart: boolean;
  /**
   * Whether there is content hidden past the end edge.
   * @attribute `data-overflow-x-end` while true
   */
  overflowXEnd: boolean;
  /**
   * Whether there is content hidden above.
   * @attribute `data-overflow-y-start` while true
   */
  overflowYStart: boolean;
  /**
   * Whether there is content hidden below.
   * @attribute `data-overflow-y-end` while true
   */
  overflowYEnd: boolean;
}

function fadeGradient(direction: 'to right' | 'to left' | 'to bottom', startVar: string, endVar: string): string {
  const size = `var(${FADE_SIZE_VAR}, ${DEFAULT_FADE_SIZE})`;

  return (
    `linear-gradient(${direction}, ` +
    `transparent 0, ` +
    `#000 min(${size}, var(${startVar}, 0px)), ` +
    `#000 calc(100% - min(${size}, var(${endVar}, 0px))), ` +
    `transparent 100%)`
  );
}

/**
 * How far one axis's content runs past its start and end edges, in px. A
 * fractional position left by zoom or smooth scrolling that lands within
 * {@link EDGE_TOLERANCE} of an edge counts as sitting on it.
 */
function overflowPast(position: number, content: number, box: number): [start: number, end: number] {
  const hidden = Math.max(0, content - box);
  let start = Math.min(Math.max(position, 0), hidden);

  if (start <= EDGE_TOLERANCE) start = 0;
  else if (hidden - start <= EDGE_TOLERANCE) start = hidden;

  return [start, hidden - start];
}

function hasChanged(previous: ScrollAreaState, next: ScrollAreaState): boolean {
  let key: keyof ScrollAreaState;

  for (key in next) {
    if (previous[key] !== next[key]) return true;
  }

  return false;
}
</script>

<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed, onScopeDispose, ref, useAttrs, watch } from 'vue';
import { mergeProps } from '../../shared/merge-props';
import { dataAttrs } from '../../shared/data-attrs';

defineOptions({ name: 'ScrollArea', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Which axes scroll; the other is clipped. */
    axis?: ScrollAreaAxis;
    /** Fades the content out towards the edges it continues past: `true` on both axes, or `'x'` or `'y'` on one. */
    fade?: ScrollAreaFade;
    /** How far the fade reaches once fully scrolled. A number means pixels. @default '40px' */
    fadeSize?: string | number;
    /** Pixels from an edge still counted as sitting at it, so the state and the fade hold off until the content has moved. */
    overflowThreshold?: number;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { axis: 'both', fade: false, overflowThreshold: 0, as: 'div' }
);

defineSlots<{
  default(props: ScrollAreaState): unknown;
}>();

const viewport = ref<HTMLElement | null>(null);

const state = ref<ScrollAreaState>({
  hasOverflowX: false,
  hasOverflowY: false,
  overflowXStart: false,
  overflowXEnd: false,
  overflowYStart: false,
  overflowYEnd: false
});

function measure(): void {
  const element = viewport.value;
  if (!element) return;

  // `scrollLeft` runs negative in RTL; its magnitude is still the distance from the start.
  const [xStart, xEnd] = overflowPast(Math.abs(element.scrollLeft), element.scrollWidth, element.clientWidth);
  const [yStart, yEnd] = overflowPast(element.scrollTop, element.scrollHeight, element.clientHeight);

  element.style.setProperty(OVERFLOW_X_START_VAR, `${xStart}px`);
  element.style.setProperty(OVERFLOW_X_END_VAR, `${xEnd}px`);
  element.style.setProperty(OVERFLOW_Y_START_VAR, `${yStart}px`);
  element.style.setProperty(OVERFLOW_Y_END_VAR, `${yEnd}px`);

  const threshold = Math.max(0, props.overflowThreshold);

  const next: ScrollAreaState = {
    hasOverflowX: xStart + xEnd > 0,
    hasOverflowY: yStart + yEnd > 0,
    overflowXStart: xStart > threshold,
    overflowXEnd: xEnd > threshold,
    overflowYStart: yStart > threshold,
    overflowYEnd: yEnd > threshold
  };

  if (hasChanged(state.value, next)) {
    state.value = next;
  }
}

const rtl = ref(false);

function readDirection(element: HTMLElement): void {
  rtl.value = getComputedStyle(element).direction === 'rtl';
}

let resizeObserver: ResizeObserver | null = null;
let mutationObserver: MutationObserver | null = null;

function observeContent(element: HTMLElement): void {
  if (!resizeObserver) return;

  resizeObserver.disconnect();
  resizeObserver.observe(element);
  for (const child of Array.from(element.children)) {
    resizeObserver.observe(child);
  }
}

function disconnect(): void {
  resizeObserver?.disconnect();
  resizeObserver = null;
  mutationObserver?.disconnect();
  mutationObserver = null;
}

watch(
  viewport,
  (element) => {
    disconnect();
    if (!element) return;

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        readDirection(element);
        measure();
      });
      observeContent(element);
    }

    if (typeof MutationObserver !== 'undefined') {
      mutationObserver = new MutationObserver(() => {
        observeContent(element);
        measure();
      });
      mutationObserver.observe(element, { childList: true });
    }

    readDirection(element);
    measure();
  },
  { flush: 'post' }
);

watch(() => props.overflowThreshold, measure);

onScopeDispose(disconnect);

const hooks = computed(() =>
  dataAttrs(state.value, {
    hasOverflowX: (on) => (on ? { 'data-has-overflow-x': '' } : null),
    hasOverflowY: (on) => (on ? { 'data-has-overflow-y': '' } : null),
    overflowXStart: (on) => (on ? { 'data-overflow-x-start': '' } : null),
    overflowXEnd: (on) => (on ? { 'data-overflow-x-end': '' } : null),
    overflowYStart: (on) => (on ? { 'data-overflow-y-start': '' } : null),
    overflowYEnd: (on) => (on ? { 'data-overflow-y-end': '' } : null)
  })
);

const fadeAxes = computed<'x' | 'y' | 'both' | null>(() => {
  if (!props.fade) return null;

  return props.fade === true ? 'both' : props.fade;
});

const style = computed<Record<string, string>>(() => {
  const declarations: Record<string, string> = {
    overflowX: props.axis === 'y' ? 'hidden' : 'auto',
    overflowY: props.axis === 'x' ? 'hidden' : 'auto'
  };

  if (props.fadeSize !== undefined) {
    declarations[FADE_SIZE_VAR] = typeof props.fadeSize === 'number' ? `${props.fadeSize}px` : props.fadeSize;
  }

  const axes = fadeAxes.value;
  if (!axes) return declarations;

  const layers: string[] = [];
  if (axes !== 'y') {
    layers.push(fadeGradient(rtl.value ? 'to left' : 'to right', OVERFLOW_X_START_VAR, OVERFLOW_X_END_VAR));
  }
  if (axes !== 'x') {
    layers.push(fadeGradient('to bottom', OVERFLOW_Y_START_VAR, OVERFLOW_Y_END_VAR));
  }

  const image = layers.join(', ');
  declarations.maskImage = image;
  declarations.WebkitMaskImage = image;
  declarations.maskRepeat = 'no-repeat';
  declarations.WebkitMaskRepeat = 'no-repeat';

  if (layers.length === 2) {
    declarations.maskComposite = 'intersect';
    declarations.WebkitMaskComposite = 'source-in';
  }

  return declarations;
});

defineExpose({ state, viewport, measure });

const attrs = useAttrs();

const rootProps = computed(() =>
  mergeProps(
    {
      ...hooks.value,
      'data-part': 'scroll-area',
      ref: (element: unknown) => {
        viewport.value = (element as HTMLElement) ?? null;
      },
      // scrollable from the keyboard only while there is something to scroll
      tabindex: state.value.hasOverflowX || state.value.hasOverflowY ? 0 : -1,
      style: style.value,
      onScroll: measure
    },
    attrs
  )
);
</script>

<template>
  <Part :as="props.as" v-bind="rootProps">
    <slot v-bind="state" />
  </Part>
</template>
