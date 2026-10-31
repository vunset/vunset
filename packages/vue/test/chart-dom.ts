import { nextTick } from 'vue';
import type { VueWrapper } from '@vue/test-utils';

/**
 * Reading what TanStack Charts drew. It renders its SVG during setup and again
 * on mount, measuring the host through `getBoundingClientRect`, which
 * `test/layout.ts` sizes, so a chart runs for real in jsdom.
 */

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

/**
 * Keyboard focus is the one way in that needs no pointer geometry. Focus lands
 * on the first point, and the arrow moves it on to the second.
 */
export async function focusSecond(wrapper: VueWrapper<any>) {
  const svg = wrapper.find('svg');
  (svg.element as SVGElement).focus();
  await svg.trigger('focus');
  await svg.trigger('keydown', { key: 'ArrowRight' });
  await wait();
  await nextTick();
}
