import { nextTick } from 'vue';
import type { VueWrapper } from '@vue/test-utils';

// Charts measure the host via `getBoundingClientRect`, which `layout.ts` sizes, so they render for real in jsdom.

// Redraws tween over frames unless motion is reduced; the tests read the end state.
export function reduceMotion(reduce = true) {
  window.matchMedia = ((query: string) => ({
    matches: reduce && query === '(prefers-reduced-motion: reduce)',
    media: query,
    addEventListener() {},
    removeEventListener() {}
  })) as any;
}
reduceMotion();

export const marks = (wrapper: VueWrapper<any>, kind: 'bar' | 'area' | 'line' | 'arc') =>
  wrapper.findAll(`.ts-chart__${kind} path`);

export const fills = (wrapper: VueWrapper<any>, kind: 'bar' | 'area' | 'line' | 'arc') =>
  marks(wrapper, kind).map((mark) => mark.attributes('fill'));

export const strokes = (wrapper: VueWrapper<any>) => marks(wrapper, 'line').map((line) => line.attributes('stroke'));

export const gradients = (wrapper: VueWrapper<any>) => wrapper.findAll('linearGradient');

/** The labels along one scale's axis: `x`, `y`, or a named one such as `right`. */
export const ticks = (wrapper: VueWrapper<any>, scale: string) =>
  wrapper.findAll(`text[data-ts-key^="${scale}-tick-label"]`).map((label) => label.text());

export const wait = (ms = 20) => new Promise((resolve) => setTimeout(resolve, ms));

// Keyboard focus needs no pointer geometry: focus lands on the first point, the arrow moves to the second.
export async function focusSecond(wrapper: VueWrapper<any>) {
  const svg = wrapper.find('svg');
  (svg.element as SVGElement).focus();
  await svg.trigger('focus');
  await svg.trigger('keydown', { key: 'ArrowRight' });
  await wait();
  await nextTick();
}
