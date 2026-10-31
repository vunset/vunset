import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { ChartArea, ChartAxis, ChartBar, ChartGrid, ChartLegend, ChartLine, ChartRoot, ChartTooltip } from '../src/chart';
import { resetLayout, setLayout } from './layout';
import { focusSecond, marks, strokes, ticks } from './chart-dom';

// Two series in different units, each against an axis of its own.
const ROWS = [
  { month: 'Jan', revenue: 42000, rate: 3.1 },
  { month: 'Feb', revenue: 51000, rate: 4.4 },
  { month: 'Mar', revenue: 48000, rate: 2.8 }
];

beforeEach(() => setLayout({ width: 600, height: 300 }));
afterEach(() => resetLayout());

function mountDual(series: Record<string, any>[] = [{}, {}], axes: Record<string, any>[] = [{}, {}]) {
  return mount(ChartRoot as any, {
    props: { data: ROWS, xKey: 'month' },
    slots: {
      default: () => [
        h(ChartLegend),
        h(ChartAxis, { type: 'x' }),
        h(ChartAxis, { type: 'y', ...axes[0] }),
        h(ChartAxis, { type: 'y', scale: 'right', ...axes[1] }),
        h(ChartGrid),
        h(ChartLine, { yKey: 'revenue', ...series[0] }),
        h(ChartLine, { yKey: 'rate', scale: 'right', ...series[1] }),
        h(ChartTooltip)
      ]
    },
    attachTo: document.body
  });
}

const tickFills = (wrapper: VueWrapper<any>, scale: string) =>
  new Set(wrapper.findAll(`text[data-ts-key^="${scale}-tick-label"]`).map((label) => label.attributes('fill')));

const entries = (wrapper: VueWrapper<any>) => wrapper.findAll('[data-part="legend-item"]');

describe('a second value axis', () => {
  it('sits on the far side, in the same drawing', () => {
    const wrapper = mountDual();

    expect(wrapper.findAll('svg')).toHaveLength(1);
    expect(ticks(wrapper, 'y').length).toBeGreaterThan(0);
    expect(ticks(wrapper, 'right').length).toBeGreaterThan(0);
  });

  it('puts each series on its own scale', () => {
    // Revenue in the tens of thousands, the rate under five: on one scale the
    // rate would be a flat line along the bottom.
    const top = (scale: string) => Number(ticks(mountDual(), scale).at(-1)!.replace(/,/g, ''));

    expect(top('y')).toBeGreaterThanOrEqual(51000);
    expect(top('right')).toBeGreaterThanOrEqual(4.4);
    expect(top('right')).toBeLessThan(10);
  });

  it('reads each axis in its series’ color', () => {
    const wrapper = mountDual([{ color: '#f00' }, { color: '#0f0' }]);

    expect(tickFills(wrapper, 'y')).toEqual(new Set(['#f00']));
    expect(tickFills(wrapper, 'right')).toEqual(new Set(['#0f0']));
  });

  it('leaves the axis color alone with only one scale drawn', () => {
    const wrapper = mount(ChartRoot as any, {
      props: { data: ROWS, xKey: 'month' },
      slots: { default: () => [h(ChartAxis, { type: 'y' }), h(ChartLine, { yKey: 'revenue', color: '#f00' })] },
      attachTo: document.body
    });

    expect(tickFills(wrapper, 'y')).not.toContain('#f00');
  });

  it('formats each axis, and each series in the tooltip, by its own formatter', async () => {
    const wrapper = mountDual([{}, {}], [{ format: (value: number) => `$${value}` }, { format: (value: number) => `${value}%` }]);

    expect(ticks(wrapper, 'y').every((label) => label.startsWith('$'))).toBe(true);
    expect(ticks(wrapper, 'right').every((label) => label.endsWith('%'))).toBe(true);

    await focusSecond(wrapper);
    expect(wrapper.find('[data-part="tooltip-heading"]').text()).toBe('Feb');
    expect(wrapper.findAll('[data-part="tooltip-value"]').map((n) => n.text())).toEqual(['$51000', '4.4%']);
  });

  it('takes the side it is given', () => {
    const wrapper = mountDual([{}, {}], [{ side: 'right' }, { side: 'left' }]);
    const x = (scale: string) => Number(wrapper.find(`text[data-ts-key^="${scale}-tick-label"]`).attributes('x'));

    expect(x('y')).toBeGreaterThan(x('right'));
  });
});

describe('hiding a series on its own axis', () => {
  it('takes the axis away with it, keeping the other its color', async () => {
    const wrapper = mountDual();
    await nextTick();
    await entries(wrapper)[0]!.trigger('click');

    expect(strokes(wrapper)).toEqual(['var(--chart-color-1, currentColor)']);
    // An axis left behind would read 0 to 1 over nothing.
    expect(ticks(wrapper, 'y')).toEqual([]);
    expect(ticks(wrapper, 'right').length).toBeGreaterThan(0);
  });

  it('moves the grid onto the axis still drawn', async () => {
    const wrapper = mountDual();
    await nextTick();
    // A line per tick of the scale it follows, at that tick's height.
    const heights = (selector: string) =>
      wrapper.findAll(selector).map((node) => Math.round(Number(node.attributes('y1') ?? node.attributes('y'))));
    const grid = () => heights('.ts-chart__grid line');
    const ticksOf = (scale: string) => heights(`text[data-ts-key^="${scale}-tick-label"]`);

    expect(grid().length).toBeGreaterThan(0);

    await entries(wrapper)[0]!.trigger('click');
    expect(grid()).toEqual(ticksOf('right'));
  });

  it('drops the series from the tooltip', async () => {
    const wrapper = mountDual();
    await nextTick();
    await entries(wrapper)[1]!.trigger('click');
    await focusSecond(wrapper);

    expect(wrapper.findAll('[data-part="tooltip-label"]').map((n) => n.text())).toEqual(['revenue']);
    expect(ticks(wrapper, 'right')).toEqual([]);
  });
});

describe('series of different kinds', () => {
  it('draws bars, a band and a line together', () => {
    const wrapper = mount(ChartRoot as any, {
      props: { data: ROWS, xKey: 'month' },
      slots: {
        default: () => [
          h(ChartBar, { yKey: 'revenue' }),
          h(ChartArea, { yKey: 'rate', scale: 'right' }),
          h(ChartLine, { yKey: 'revenue', label: 'Revenue trend' })
        ]
      },
      attachTo: document.body
    });

    expect(marks(wrapper, 'bar')).toHaveLength(3);
    expect(marks(wrapper, 'area')).toHaveLength(1);
    expect(marks(wrapper, 'line')).toHaveLength(2);
  });

  it('centers a line on its bars’ rows', () => {
    const wrapper = mount(ChartRoot as any, {
      props: { data: ROWS, xKey: 'month' },
      slots: { default: () => [h(ChartBar, { yKey: 'revenue', roundedCorners: 0 }), h(ChartLine, { yKey: 'revenue', curve: 'linear' })] },
      attachTo: document.body
    });
    const bar = marks(wrapper, 'bar')[0]!.attributes('d')!;
    const xs = [...bar.matchAll(/[MH]([\d.-]+)/g)].map((match) => Number(match[1]));
    const middle = (Math.min(...xs) + Math.max(...xs)) / 2;
    const start = Number(/M([\d.-]+)/.exec(marks(wrapper, 'line')[0]!.attributes('d')!)![1]);

    expect(Math.abs(start - middle)).toBeLessThan(1);
  });

  it('shares one color and one legend entry for a key drawn twice', async () => {
    const wrapper = mount(ChartRoot as any, {
      props: { data: ROWS, xKey: 'month' },
      slots: { default: () => [h(ChartLegend), h(ChartBar, { yKey: 'revenue' }), h(ChartLine, { yKey: 'revenue' })] },
      attachTo: document.body
    });
    await nextTick();

    expect(entries(wrapper)).toHaveLength(1);
    expect(strokes(wrapper)).toEqual(['var(--chart-color-0, currentColor)']);

    await entries(wrapper)[0]!.trigger('click');
    expect(marks(wrapper, 'bar')).toHaveLength(0);
    expect(marks(wrapper, 'line')).toHaveLength(0);
  });

  it('lays bars and lines across, with the rows down the side', () => {
    const wrapper = mount(ChartRoot as any, {
      props: { data: ROWS, xKey: 'month', orientation: 'horizontal' },
      slots: {
        default: () => [h(ChartAxis, { type: 'x' }), h(ChartBar, { yKey: 'revenue' }), h(ChartLine, { yKey: 'revenue' })]
      },
      attachTo: document.body
    });

    expect(ticks(wrapper, 'y')).toEqual(['Jan', 'Feb', 'Mar']);
    expect(marks(wrapper, 'line')).toHaveLength(1);
  });
});
