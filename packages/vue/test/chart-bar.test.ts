import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import { ChartAxis, ChartBar, ChartGrid, ChartLegend, ChartLine, ChartRoot, ChartTooltip } from '../src/chart';
import { resetLayout, setLayout } from './layout';
import { fills as fillsOf, focusSecond, gradients, marks, ticks, wait } from './chart-dom';

const DATA = [
  { date: 'Mon', visits: 10, signups: 4 },
  { date: 'Tue', visits: 20, signups: 9 },
  { date: 'Wed', visits: 15, signups: 6 },
];

beforeEach(() => setLayout({ width: 600, height: 300 }));
afterEach(() => resetLayout());

const ROOT_PROPS = ['data', 'xKey', 'stacked', 'orientation', 'hidden', 'label', 'height'];

/**
 * A bar per key in `categories`, with both axes, a grid and a tooltip. The
 * props go where they belong: the root's to the root, `x*`/`y*` to the axes,
 * the rest to every bar.
 */
function mountBar(props: Record<string, any> = {}) {
  const { categories = ['visits', 'signups'], xFormat, yFormat, numTicks, trimLabels, xAxis = true, yAxis = true, colors, legend, ...rest } = props;
  const root = Object.fromEntries(Object.entries(rest).filter(([key]) => ROOT_PROPS.includes(key)));
  const bar = Object.fromEntries(Object.entries(rest).filter(([key]) => !ROOT_PROPS.includes(key)));
  return mount(ChartRoot as any, {
    props: { data: DATA, xKey: 'date', ...root },
    slots: {
      default: () => [
        legend ? h(ChartLegend) : null,
        xAxis ? h(ChartAxis, { type: 'x', format: xFormat, numTicks, trimLabels }) : null,
        yAxis ? h(ChartAxis, { type: 'y', format: yFormat }) : null,
        h(ChartGrid),
        ...categories.map((key: string, index: number) => h(ChartBar, { yKey: key, color: colors?.[index], ...bar })),
        h(ChartTooltip),
      ],
    },
    attachTo: document.body,
  });
}

const bars = (wrapper: VueWrapper<any>) => marks(wrapper, 'bar');
const fills = (wrapper: VueWrapper<any>) => fillsOf(wrapper, 'bar');

/** The horizontal extent of a bar, from the x coordinates of its outline. */
function span(d: string): [number, number] {
  const xs = [...d.matchAll(/[MH]([\d.-]+)/g)].map((match) => Number(match[1]));
  return [Math.min(...xs), Math.max(...xs)];
}

describe('the chart itself', () => {
  it('draws a bar per row and category', () => {
    expect(bars(mountBar())).toHaveLength(6);
    expect(bars(mountBar({ categories: ['visits'] }))).toHaveLength(3);
  });

  it('leaves a gap for a missing value rather than a bar of zero', () => {
    const data = [...DATA.slice(0, 2), { date: 'Wed', visits: 15 }];
    expect(bars(mountBar({ data }))).toHaveLength(5);
  });

});

describe('grouping and stacking', () => {
  it('sets a row’s bars side by side', () => {
    const [first, second] = bars(mountBar()).map((bar) => span(bar.attributes('d')!));

    expect(first![1]).toBeLessThanOrEqual(second![0]);
  });

  it('piles them into one when stacked', () => {
    const [first, second] = bars(mountBar({ stacked: true, roundedCorners: 0 })).map((bar) =>
      span(bar.attributes('d')!),
    );

    expect(first).toEqual(second);
  });

  it('rounds the bar ends, and only a stack’s outer one', () => {
    // Every corner is drawn as an arc; a square one has a radius of zero.
    const arcs = (wrapper: VueWrapper<any>) =>
      bars(wrapper).filter((bar) => /A[1-9]/.test(bar.attributes('d')!));

    expect(arcs(mountBar())).toHaveLength(6);
    expect(arcs(mountBar({ roundedCorners: 0 }))).toHaveLength(0);
    // Two categories stacked: only the top one of each row is rounded.
    expect(arcs(mountBar({ stacked: true }))).toHaveLength(3);
  });
});

describe('colors and gradients', () => {
  it('takes flat colors from custom properties, one per category', () => {
    expect(new Set(fills(mountBar()))).toEqual(
      new Set(['var(--chart-color-0, currentColor)', 'var(--chart-color-1, currentColor)']),
    );
    expect(new Set(fills(mountBar({ colors: ['#f00', '#0f0'] })))).toEqual(
      new Set(['#f00', '#0f0']),
    );
  });

  it('stays flat unless told to fade each bar towards its foot', () => {
    expect(gradients(mountBar())).toHaveLength(0);

    const faded = gradients(mountBar({ gradient: true }));
    expect(faded).toHaveLength(2);
    expect(faded[0]!.findAll('stop')[1]!.attributes('stop-opacity')).toBe('0.2');
  });

  it('paints each bar with a gradient of its own chart', () => {
    const wrapper = mountBar({ gradient: true });
    const ids = gradients(wrapper).map((gradient) => `url(#${gradient.attributes('id')})`);

    expect(fills(wrapper).every((fill) => ids.includes(fill!))).toBe(true);
  });

  it('fades a bar from its tip back to the axis, whichever way it grows', () => {
    const direction = (wrapper: VueWrapper<any>) => {
      const gradient = gradients(wrapper).at(0)!;
      return ['x1', 'y1', 'x2', 'y2'].map((name) => gradient.attributes(name));
    };

    expect(direction(mountBar({ gradient: true }))).toEqual(['0%', '0%', '0%', '100%']);
    expect(direction(mountBar({ gradient: true, orientation: 'horizontal' }))).toEqual(['100%', '0%', '0%', '0%']);
  });

  it('gives two bar charts on one page gradient ids of their own', () => {
    const chart = () => h(ChartRoot as any, { data: DATA, xKey: 'date' }, () => [h(ChartBar, { yKey: 'visits', gradient: true })]);
    const Host = defineComponent({ setup: () => () => [chart(), chart()] });
    const ids = mount(Host, { attachTo: document.body })
      .findAll('linearGradient')
      .map((node) => node.attributes('id'));

    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
  });
});

describe('the axes', () => {
  it('labels the rows from `xKey`, and the values with a grouped number', () => {
    const wrapper = mountBar({ data: [{ date: 'Mon', visits: 1200, signups: 400 }] });

    expect(ticks(wrapper, 'x')).toEqual(['Mon']);
    expect(ticks(wrapper, 'y')).toContain('1,200');
  });

  it('runs each axis through its own formatter', () => {
    const wrapper = mountBar({
      xFormat: (value: string) => value.toUpperCase(),
      yFormat: (value: number) => `${value}!`,
    });

    expect(ticks(wrapper, 'x')).toEqual(['MON', 'TUE', 'WED']);
    expect(ticks(wrapper, 'y').every((label) => label.endsWith('!'))).toBe(true);
  });

  it('moves the row labels to the side when it lies down', () => {
    const wrapper = mountBar({ orientation: 'horizontal', yFormat: (value: number) => `${value}!` });

    expect(ticks(wrapper, 'y')).toEqual(['Mon', 'Tue', 'Wed']);
    expect(ticks(wrapper, 'x').every((label) => label.endsWith('!'))).toBe(true);
  });

  it('keeps an evenly spaced few row labels for `numTicks`', () => {
    expect(ticks(mountBar({ numTicks: 2 }), 'x')).toEqual(['Mon', 'Wed']);
  });

  it('leaves out an axis it is not given', () => {
    expect(ticks(mountBar({ xAxis: false }), 'x')).toEqual([]);
    expect(ticks(mountBar({ yAxis: false }), 'y')).toEqual([]);
    expect(ticks(mountBar({ xAxis: false }), 'y')).not.toEqual([]);
  });

  it('cuts long labels to their row’s width only when asked', async () => {
    // Ten rows across 600 pixels leave each label room for about nine characters.
    const data = Array.from({ length: 10 }, (_, index) => ({ date: `A long label, number ${index}`, visits: index + 1 }));

    const cut = mountBar({ data, categories: ['visits'], trimLabels: true });
    await wait();
    expect(ticks(cut, 'x').length).toBeGreaterThan(0);
    expect(ticks(cut, 'x').every((label) => label.endsWith('…'))).toBe(true);

    const whole = mountBar({ data, categories: ['visits'] });
    await wait();
    expect(ticks(whole, 'x').some((label) => label.endsWith('…'))).toBe(false);
  });
});

describe('the tooltip', () => {
  it('reads out the focused row, every category of it', async () => {
    const wrapper = mountBar({ yFormat: (value: number) => `${value} hits` });
    await focusSecond(wrapper);

    expect(wrapper.find('[data-part="tooltip-heading"]').text()).toBe('Tue');
    expect(wrapper.findAll('[data-part="tooltip-label"]').map((n) => n.text())).toEqual(['visits', 'signups']);
    expect(wrapper.findAll('[data-part="tooltip-value"]').map((n) => n.text())).toEqual(['20 hits', '9 hits']);
  });

  it('reads out the whole row lying down too', async () => {
    const wrapper = mountBar({ orientation: 'horizontal' });
    await focusSecond(wrapper);

    expect(wrapper.findAll('[data-part="tooltip-value"]')).toHaveLength(2);
  });

  it('reads out a bar series beside a line', async () => {
    const wrapper = mount(ChartRoot as any, {
      props: { data: DATA, xKey: 'date' },
      slots: { default: () => [h(ChartBar, { yKey: 'visits' }), h(ChartLine, { yKey: 'signups' }), h(ChartTooltip)] },
      attachTo: document.body,
    });
    await focusSecond(wrapper);

    expect(wrapper.findAll('[data-part="tooltip-value"]').map((n) => n.text())).toEqual(['20', '9']);
  });
});

describe('with a legend', () => {
  const mountWithLegend = async (props: Record<string, any> = {}) => {
    const wrapper = mountBar({ ...props, legend: true });
    await nextTick();
    return wrapper;
  };

  it('takes a category out, keeping the others their color', async () => {
    const wrapper = await mountWithLegend({ colors: ['#f00', '#0f0'] });
    await wrapper.findAll('[data-part="legend-item"]')[0]!.trigger('click');

    expect(bars(wrapper)).toHaveLength(3);
    expect(new Set(fills(wrapper))).toEqual(new Set(['#0f0']));
  });

  it('drops the category from the tooltip too', async () => {
    const wrapper = await mountWithLegend();
    await wrapper.findAll('[data-part="legend-item"]')[0]!.trigger('click');
    await focusSecond(wrapper);

    expect(wrapper.findAll('[data-part="tooltip-label"]').map((n) => n.text())).toEqual(['signups']);
  });

  it('follows `v-model:hidden`', async () => {
    const wrapper = mountBar({ hidden: ['visits'] });
    expect(bars(wrapper)).toHaveLength(3);

    await wrapper.setProps({ hidden: [] });
    expect(bars(wrapper)).toHaveLength(6);
  });
});
