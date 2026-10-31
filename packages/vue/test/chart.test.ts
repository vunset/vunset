import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref, type VNode } from 'vue';
import {
  ChartArea,
  ChartAxis,
  ChartBar,
  ChartCrosshair,
  ChartGrid,
  ChartLegend,
  ChartLine,
  ChartRoot,
  ChartTooltip
} from '../src/chart';
import { resetLayout, setLayout } from './layout';
import { fills, focusSecond, gradients, marks, strokes, ticks, wait } from './chart-dom';

const DATA = [
  { date: 'Mon', visits: 10, signups: 4 },
  { date: 'Tue', visits: 20, signups: 9 },
  { date: 'Wed', visits: 15, signups: 6 }
];

beforeEach(() => setLayout({ width: 600, height: 300 }));
afterEach(() => resetLayout());

/** A chart of `parts`, by default two areas with both axes, a grid and a tooltip. */
function mountChart(
  props: Record<string, any> = {},
  parts: () => VNode[] = () => [
    h(ChartAxis, { type: 'x' }),
    h(ChartAxis, { type: 'y' }),
    h(ChartGrid),
    h(ChartArea, { yKey: 'visits' }),
    h(ChartArea, { yKey: 'signups' }),
    h(ChartTooltip)
  ],
  options: Record<string, any> = {}
) {
  return mount(ChartRoot as any, {
    props: { data: DATA, xKey: 'date', ...props },
    slots: { default: parts },
    attachTo: document.body,
    ...options
  });
}

const gridLines = (wrapper: VueWrapper<any>) => wrapper.findAll('.ts-chart__grid line, .ts-chart__grid path');

describe('the root', () => {
  it('draws nothing but what its parts ask for', () => {
    const wrapper = mountChart({}, () => [h(ChartLine, { yKey: 'visits' })]);

    expect(marks(wrapper, 'line')).toHaveLength(1);
    expect(marks(wrapper, 'area')).toHaveLength(0);
    expect(ticks(wrapper, 'x')).toEqual([]);
    expect(ticks(wrapper, 'y')).toEqual([]);
    expect(gridLines(wrapper)).toHaveLength(0);
  });

  it('takes the caller’s attributes, and says which way it lies', () => {
    const chart = mountChart({}, undefined, { attrs: { class: 'mine' } }).find('[data-part="chart"]');

    expect(chart.classes()).toContain('mine');
    expect(chart.attributes('data-orientation')).toBe('vertical');
  });

  it('is named for assistive technology by its series’ labels, or by `label`', () => {
    const parts = () => [h(ChartLine, { yKey: 'visits', label: 'Visits' }), h(ChartLine, { yKey: 'signups' })];

    expect(mountChart({}, parts).find('svg').attributes('aria-label')).toBe('Visits, signups');
    expect(mountChart({ label: 'Traffic' }, parts).find('svg').attributes('aria-label')).toBe('Traffic');
  });

  it('sizes its drawing to `height`, a number meaning pixels', () => {
    const host = (wrapper: VueWrapper<any>) => (wrapper.find('.ts-chart-host').element as HTMLElement).style.height;

    expect(host(mountChart())).toBe('20rem');
    expect(host(mountChart({ height: 200 }))).toBe('200px');
  });

  it('paints its series in template order, the later on top', () => {
    const wrapper = mountChart({}, () => [
      h(ChartLine, { yKey: 'visits', color: '#f00' }),
      h(ChartLine, { yKey: 'signups', color: '#0f0' })
    ]);

    expect(strokes(wrapper)).toEqual(['#f00', '#0f0']);
  });

  it('keeps a series shown later in its place in the template', async () => {
    const first = ref(false);
    const Host = defineComponent({
      setup: () => () =>
        h(ChartRoot as any, { data: DATA, xKey: 'date' }, () => [
          first.value ? h(ChartLine, { yKey: 'visits', color: '#f00' }) : null,
          h(ChartLine, { yKey: 'signups', color: '#0f0' })
        ])
    });
    const wrapper = mount(Host, { attachTo: document.body });
    expect(strokes(wrapper)).toEqual(['#0f0']);

    first.value = true;
    await nextTick();
    await nextTick();

    // Registered last, but drawn first: it comes first in the template.
    expect(strokes(wrapper)).toEqual(['#f00', '#0f0']);
  });

  it('lets a series go when it unmounts', async () => {
    const shown = ref(true);
    const Host = defineComponent({
      setup: () => () =>
        h(ChartRoot as any, { data: DATA, xKey: 'date' }, () => [
          h(ChartLine, { yKey: 'visits' }),
          shown.value ? h(ChartLine, { yKey: 'signups' }) : null
        ])
    });
    const wrapper = mount(Host, { attachTo: document.body });
    expect(marks(wrapper, 'line')).toHaveLength(2);

    shown.value = false;
    await nextTick();
    expect(marks(wrapper, 'line')).toHaveLength(1);
  });
});

describe('the area', () => {
  it('draws a band and a line per series', () => {
    expect(marks(mountChart(), 'area')).toHaveLength(2);
    expect(marks(mountChart(), 'line')).toHaveLength(2);
  });

  it('bends its line smoothly unless told to run it straight', () => {
    const curved = (wrapper: VueWrapper<any>, kind: 'area' | 'line') =>
      marks(wrapper, kind).every((mark) => mark.attributes('d')!.includes('C'));

    expect(curved(mountChart(), 'line')).toBe(true);
    expect(curved(mountChart(), 'area')).toBe(true);

    const straight = mountChart({}, () => [h(ChartArea, { yKey: 'visits', curve: 'linear' })]);
    expect(marks(straight, 'line').some((mark) => mark.attributes('d')!.includes('C'))).toBe(false);
  });

  it('marks each row with a dot when asked', () => {
    expect(mountChart().findAll('.ts-chart__line circle')).toHaveLength(0);
    expect(mountChart({}, () => [h(ChartArea, { yKey: 'visits', points: true })]).findAll('.ts-chart__line circle')).toHaveLength(3);
  });

  it('fades each band out towards the bottom, with a gradient of its own chart', () => {
    const wrapper = mountChart();
    const stops = gradients(wrapper).at(0)!.findAll('stop');
    const ids = gradients(wrapper).map((gradient) => `url(#${gradient.attributes('id')})`);

    expect(stops[0]!.attributes('stop-opacity')).toBe('0.25');
    expect(stops[1]!.attributes('stop-opacity')).toBe('0');
    expect(fills(wrapper, 'area')).toEqual(ids);
  });

  it('gives two charts on one page ids of their own', () => {
    const chart = () => h(ChartRoot as any, { data: DATA, xKey: 'date' }, () => [h(ChartArea, { yKey: 'visits' })]);
    const Host = defineComponent({ setup: () => () => [chart(), chart()] });
    const ids = mount(Host, { attachTo: document.body })
      .findAll('linearGradient')
      .map((node) => node.attributes('id'));

    // A shared id would have the second chart repaint the first.
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
  });
});

describe('the line', () => {
  it('draws a line with no band under it', () => {
    const wrapper = mountChart({}, () => [h(ChartLine, { yKey: 'visits' })]);

    expect(marks(wrapper, 'line')).toHaveLength(1);
    expect(marks(wrapper, 'area')).toHaveLength(0);
    expect(gradients(wrapper)).toHaveLength(0);
  });

  it('lays over an area, both on one scale', () => {
    const wrapper = mountChart({}, () => [h(ChartArea, { yKey: 'visits' }), h(ChartLine, { yKey: 'signups' })]);

    expect(marks(wrapper, 'area')).toHaveLength(1);
    expect(marks(wrapper, 'line')).toHaveLength(2);
  });
});

describe('colors', () => {
  it('takes them from custom properties, one per series', () => {
    expect(strokes(mountChart())).toEqual(['var(--chart-color-0, currentColor)', 'var(--chart-color-1, currentColor)']);

    const stops = gradients(mountChart()).map((node) => node.find('stop').attributes('stop-color'));
    expect(stops).toEqual(['var(--chart-color-0, currentColor)', 'var(--chart-color-1, currentColor)']);
  });

  it('takes a literal when a series is given one', () => {
    const wrapper = mountChart({}, () => [h(ChartLine, { yKey: 'visits' }), h(ChartLine, { yKey: 'signups', color: '#0f0' })]);

    expect(strokes(wrapper)).toEqual(['var(--chart-color-0, currentColor)', '#0f0']);
  });
});

describe('the axes and grid', () => {
  it('labels the x axis from the row, and the y axis with a grouped number', () => {
    const wrapper = mountChart({ data: [{ date: 'Mon', visits: 1200 }, { date: 'Tue', visits: 1400 }] });

    expect(ticks(wrapper, 'x')).toEqual(['Mon', 'Tue']);
    expect(ticks(wrapper, 'y')).toContain('1,200');
  });

  it('runs each axis through its formatter', () => {
    const wrapper = mountChart({}, () => [
      h(ChartAxis, { type: 'x', format: (value: string) => value.toUpperCase() }),
      h(ChartAxis, { type: 'y', format: (value: number) => `${value}%` }),
      h(ChartLine, { yKey: 'visits' })
    ]);

    expect(ticks(wrapper, 'x')).toEqual(['MON', 'TUE', 'WED']);
    expect(ticks(wrapper, 'y').every((label) => label.endsWith('%'))).toBe(true);
  });

  it('keeps an evenly spaced few row labels for `numTicks`', () => {
    const wrapper = mountChart({}, () => [h(ChartAxis, { type: 'x', numTicks: 2 }), h(ChartLine, { yKey: 'visits' })]);

    expect(ticks(wrapper, 'x')).toEqual(['Mon', 'Wed']);
  });

  it('draws the grid only when asked', () => {
    expect(gridLines(mountChart())).not.toHaveLength(0);
    expect(gridLines(mountChart({}, () => [h(ChartAxis, { type: 'y' }), h(ChartLine, { yKey: 'visits' })]))).toHaveLength(0);
  });
});

describe('the crosshair', () => {
  it('follows the focus only when asked', async () => {
    const plain = mountChart();
    await focusSecond(plain);
    const lines = (wrapper: VueWrapper<any>) => wrapper.findAll('[data-ts-key*="crosshair"]');
    expect(lines(plain)).toHaveLength(0);

    const crossed = mountChart({}, () => [h(ChartLine, { yKey: 'visits' }), h(ChartCrosshair), h(ChartTooltip)]);
    await focusSecond(crossed);
    expect(lines(crossed).length).toBeGreaterThan(0);
  });
});

describe('the tooltip', () => {
  it('is there only when asked', async () => {
    const wrapper = mountChart({}, () => [h(ChartLine, { yKey: 'visits' })]);
    await focusSecond(wrapper);

    expect(wrapper.find('[data-part="chart-tooltip"]').exists()).toBe(false);
  });

  it('names the row and reads out every series', async () => {
    const wrapper = mountChart();
    await focusSecond(wrapper);

    expect(wrapper.find('[data-part="tooltip-heading"]').text()).toBe('Tue');
    expect(wrapper.findAll('[data-part="tooltip-label"]').map((n) => n.text())).toEqual(['visits', 'signups']);
    expect(wrapper.findAll('[data-part="tooltip-value"]').map((n) => n.text())).toEqual(['20', '9']);
  });

  it('colors each swatch to match its series', async () => {
    const wrapper = mountChart({}, () => [
      h(ChartLine, { yKey: 'visits', color: '#f00' }),
      h(ChartLine, { yKey: 'signups', color: '#0f0' }),
      h(ChartTooltip)
    ]);
    await focusSecond(wrapper);

    expect(wrapper.findAll('[data-part="tooltip-swatch"]').map((n) => n.attributes('style'))).toEqual([
      'background: rgb(255, 0, 0);',
      'background: rgb(0, 255, 0);'
    ]);
  });

  it('formats the heading by the x axis, and each value by its series or its axis', async () => {
    const wrapper = mountChart({}, () => [
      h(ChartAxis, { type: 'x', format: (value: string) => `on ${value}` }),
      h(ChartAxis, { type: 'y', format: (value: number) => `${value} hits` }),
      h(ChartLine, { yKey: 'visits', label: 'Visits' }),
      h(ChartLine, { yKey: 'signups', format: (value: number) => `${value} new` }),
      h(ChartTooltip)
    ]);
    await focusSecond(wrapper);

    expect(wrapper.find('[data-part="tooltip-heading"]').text()).toBe('on Tue');
    expect(wrapper.findAll('[data-part="tooltip-value"]').map((n) => n.text())).toEqual(['20 hits', '9 new']);
    expect(wrapper.find('[data-part="tooltip-label"]').text()).toBe('Visits');
  });

  it('reads a missing value as zero rather than as nothing', async () => {
    const wrapper = mountChart({ data: [DATA[0], { date: 'Thu', visits: 5 }] });
    await focusSecond(wrapper);

    expect(wrapper.findAll('[data-part="tooltip-value"]').map((n) => n.text())).toEqual(['5', '0']);
  });

  it('reads the same row out to assistive technology', async () => {
    const wrapper = mountChart();
    await focusSecond(wrapper);

    const label = wrapper.find('[role="status"]').attributes('aria-label')!;
    expect(label).toContain('Tue');
    expect(label).toContain('visits: 20');
  });

  it('puts its attributes on the box', async () => {
    const wrapper = mountChart({}, () => [
      h(ChartLine, { yKey: 'visits' }),
      h(ChartTooltip, { class: ['tip', { wide: true, narrow: false }], 'data-mine': '' })
    ]);
    await focusSecond(wrapper);

    const box = wrapper.find('[data-part="chart-tooltip"]');
    expect(box.classes()).toEqual(['tip', 'wide']);
    expect(box.attributes('data-mine')).toBe('');
  });

  it('hands the row, its heading and its series to content of the caller’s own', async () => {
    const wrapper = mountChart({}, () => [
      h(ChartLine, { yKey: 'visits' }),
      h(ChartTooltip, null, {
        default: ({ row, heading, series }: any) =>
          h('p', { class: 'mine' }, `${row.date}|${heading}|${series.map((entry: any) => entry.text).join('+')}`)
      })
    ]);
    await focusSecond(wrapper);

    expect(wrapper.find('.mine').text()).toBe('Tue|Tue|20');
    expect(wrapper.find('[data-part="tooltip-heading"]').exists()).toBe(false);
  });
});

describe('the legend', () => {
  const withLegend = (legend: Record<string, any> = {}, series: Record<string, any>[] = [{}, {}]) =>
    mountChart({}, () => [
      h(ChartLegend, legend),
      h(ChartLine, { yKey: 'visits', ...series[0] }),
      h(ChartLine, { yKey: 'signups', ...series[1] }),
      h(ChartTooltip)
    ]);

  const entries = (wrapper: VueWrapper<any>) => wrapper.findAll('[data-part="legend-item"]');

  it('names every series by its label, in its color', async () => {
    const wrapper = withLegend({}, [{ label: 'Visits', color: '#f00' }, { color: '#0f0' }]);
    await nextTick();

    expect(entries(wrapper).map((n) => n.text())).toEqual(['Visits', 'signups']);
    expect(entries(wrapper).map((n) => n.find('[data-part="legend-swatch"]').attributes('style'))).toEqual([
      'background: rgb(255, 0, 0);',
      'background: rgb(0, 255, 0);'
    ]);
  });

  it('takes a series out of the chart, and puts it back', async () => {
    const wrapper = withLegend();
    await nextTick();
    expect(marks(wrapper, 'line')).toHaveLength(2);

    await entries(wrapper)[0]!.trigger('click');

    expect(marks(wrapper, 'line')).toHaveLength(1);
    expect(entries(wrapper)[0]!.attributes('data-hidden')).toBe('');
    expect(entries(wrapper)[0]!.attributes('aria-pressed')).toBe('false');

    await entries(wrapper)[0]!.trigger('click');
    expect(marks(wrapper, 'line')).toHaveLength(2);
  });

  it('leaves the remaining series the color they had', async () => {
    const wrapper = withLegend();
    await nextTick();
    await entries(wrapper)[0]!.trigger('click');

    // Hiding the first must not slide the second onto the first color.
    expect(strokes(wrapper)).toEqual(['var(--chart-color-1, currentColor)']);
  });

  it('drops the series from the tooltip too', async () => {
    const wrapper = withLegend();
    await nextTick();
    await entries(wrapper)[0]!.trigger('click');
    await focusSecond(wrapper);

    expect(wrapper.findAll('[data-part="tooltip-label"]').map((n) => n.text())).toEqual(['signups']);
  });

  it('follows `v-model:hidden` on the root', async () => {
    const wrapper = mountChart({ hidden: ['visits'] });
    expect(marks(wrapper, 'area')).toHaveLength(1);

    await wrapper.setProps({ hidden: [] });
    expect(marks(wrapper, 'area')).toHaveLength(2);
  });

  it('renames a series without renaming the key', async () => {
    const wrapper = withLegend({ labelFormat: (c: string) => c.toUpperCase() });
    await nextTick();

    expect(entries(wrapper).map((n) => n.text())).toEqual(['VISITS', 'SIGNUPS']);
  });

  it('stands on its own beside a chart, with a list of its own', async () => {
    const wrapper = mount(ChartLegend as any, {
      props: { categories: ['a', 'b'], colors: ['#f00', '#0f0'] },
      attachTo: document.body
    });

    await wrapper.findAll('[data-part="legend-item"]')[1]!.trigger('click');

    expect(wrapper.emitted('update:modelValue')![0]).toEqual([['b']]);
  });

  it('defers to its own value over the chart when given one', async () => {
    const wrapper = withLegend({ modelValue: ['visits'] });
    await nextTick();

    // The legend was told what is hidden; the chart it sits in was not.
    expect(entries(wrapper)[0]!.attributes('data-hidden')).toBe('');
    expect(marks(wrapper, 'line')).toHaveLength(2);
  });

  it('hands the items to a legend of the caller’s own', async () => {
    const wrapper = mountChart({}, () => [
      h(ChartLegend, null, {
        default: ({ items }: any) => items.map((item: any) => h('b', { class: 'mine' }, item.label))
      }),
      h(ChartLine, { yKey: 'visits', label: 'Visits' })
    ]);
    await nextTick();

    expect(wrapper.findAll('.mine').map((n) => n.text())).toEqual(['Visits']);
    expect(wrapper.find('[data-part="legend-item"]').exists()).toBe(false);
  });
});

describe('the tick labels', () => {
  // jsdom resolves no `var()`, so the probe's computed size is what a stylesheet would give.
  function withTickSize(size: string) {
    const real = window.getComputedStyle;
    return vi.spyOn(window, 'getComputedStyle').mockImplementation((element, pseudo) => {
      const style = real(element, pseudo);
      return (element as HTMLElement).style?.fontSize?.includes('--chart-tick-font-size')
        ? ({ ...style, fontSize: size } as CSSStyleDeclaration)
        : style;
    });
  }

  const sizes = (wrapper: VueWrapper<any>) =>
    [...new Set(wrapper.findAll('text[data-ts-key*="-tick-label"]').map((label) => label.attributes('font-size')))];

  afterEach(() => vi.restoreAllMocks());

  it('draws them at --chart-tick-font-size on every axis', async () => {
    withTickSize('14px');
    const wrapper = mountChart({}, () => [
      h(ChartAxis, { type: 'x' }),
      h(ChartAxis, { type: 'y' }),
      h(ChartAxis, { type: 'y', scale: 'right' }),
      h(ChartBar, { yKey: 'visits' }),
      h(ChartLine, { yKey: 'signups', scale: 'right' })
    ]);
    await wait();

    expect(sizes(wrapper)).toEqual(['14']);
    wrapper.unmount();
  });

  it('keeps the library size while the variable is unset', async () => {
    const wrapper = mountChart();
    await wait();
    expect(sizes(wrapper)).toEqual(['11']);
    wrapper.unmount();
  });
});
