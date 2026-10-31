import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { ChartDonut, ChartLegend } from '../src/chart';
import { resetLayout, setLayout } from './layout';
import { fills, marks, wait } from './chart-dom';

const SLICES = [
  { source: 'Search', total: 60 },
  { source: 'Social', total: 30 },
  { source: 'Direct', total: 10 },
];

beforeEach(() => setLayout({ width: 600, height: 300 }));
afterEach(() => resetLayout());

async function mountDonut(props: Record<string, any> = {}, options: Record<string, any> = {}) {
  const wrapper = mount(ChartDonut as any, {
    props: { data: SLICES, categoryKey: 'source', valueKey: 'total', ...props },
    attachTo: document.body,
    ...options,
  });
  // The middle is placed over the plot once the chart has measured it.
  await wait();
  return wrapper;
}

const arcs = (wrapper: VueWrapper<any>) => marks(wrapper, 'arc');
const middle = (wrapper: VueWrapper<any>) => ({
  label: wrapper.find('[data-part="chart-center-label"]'),
  sub: wrapper.find('[data-part="chart-center-sub-label"]'),
});

/** Keyboard focus, which needs no pointer geometry. It lands on Social, the second slice. */
async function focusFirst(wrapper: VueWrapper<any>) {
  const svg = wrapper.find('svg');
  (svg.element as SVGElement).focus();
  await svg.trigger('focus');
  await wait();
  await nextTick();
}

describe('the donut', () => {
  it('says what it is, and takes the caller’s attributes', async () => {
    const chart = (await mountDonut({}, { attrs: { class: 'mine' } })).find('[data-part="chart"]');

    expect(chart.attributes('data-chart')).toBe('donut');
    expect(chart.classes()).toContain('mine');
  });

  it('draws a slice per row, in custom-property colors', async () => {
    const wrapper = await mountDonut();

    expect(arcs(wrapper)).toHaveLength(3);
    expect(fills(wrapper, 'arc')).toEqual(['var(--chart-color-0, currentColor)', 'var(--chart-color-1, currentColor)', 'var(--chart-color-2, currentColor)']);
  });

  it('sizes the slices by the value key', async () => {
    // A slice's arc length grows with its share; the path's extent is a fair proxy.
    const extent = (d: string) => {
      const numbers = [...d.matchAll(/-?[\d.]+/g)].map((match) => Number(match[0]));
      return Math.max(...numbers) - Math.min(...numbers);
    };
    const [search, , direct] = arcs(await mountDonut()).map((arc) => extent(arc.attributes('d')!));

    expect(search).toBeGreaterThan(direct!);
  });

  it('is named for assistive technology by its slices, or by `label`', async () => {
    expect((await mountDonut()).find('svg').attributes('aria-label')).toBe('Search, Social, Direct');
    expect((await mountDonut({ label: 'Sources' })).find('svg').attributes('aria-label')).toBe('Sources');
  });

  it('puts the total of what is showing in the middle', async () => {
    const { label, sub } = middle(await mountDonut());

    expect(label.text()).toBe('100');
    expect(sub.text()).toBe('Total');
  });

  it('takes a label of its own, and an empty one for none', async () => {
    expect(middle(await mountDonut({ centralLabel: 'Q3' })).label.text()).toBe('Q3');
    expect(middle(await mountDonut({ centralSubLabel: '' })).sub.exists()).toBe(false);
    expect(
      (await mountDonut({ centralLabel: '', centralSubLabel: '' })).find('[data-part="chart-center"]').exists(),
    ).toBe(false);
  });

  it('runs the total through the formatter', async () => {
    expect(middle(await mountDonut({ valueFormat: (value: number) => `${value}%` })).label.text()).toBe('100%');
  });

  it('lays the middle over the plot', async () => {
    const center = (await mountDonut()).find('[data-part="chart-center"]').element as HTMLElement;

    expect(center.style.position).toBe('absolute');
    expect(center.style.top).toMatch(/px$/);
  });

  it('cuts the middle out of a ring, and fills it in for a pie', async () => {
    // A ring's slice is drawn out and back, so its path has two arcs; a pie's
    // runs to the center and has one.
    const arcCommands = (wrapper: VueWrapper<any>) => (arcs(wrapper)[0]!.attributes('d')!.match(/A/g) ?? []).length;

    expect(arcCommands(await mountDonut({ cornerRadius: 0 }))).toBe(2);
    expect(arcCommands(await mountDonut({ cornerRadius: 0, arcWidth: 0 }))).toBe(1);
  });
});

describe('the donut’s legend', () => {
  const withLegend = (props: Record<string, any> = {}, legend: Record<string, any> = {}) =>
    mountDonut(props, { slots: { default: () => h(ChartLegend as any, legend) } });

  it('drops a slice, and re-totals', async () => {
    const wrapper = await withLegend();

    expect(wrapper.findAll('[data-part="legend-item"]').map((n) => n.text())).toEqual(['Search', 'Social', 'Direct']);

    await wrapper.findAll('[data-part="legend-item"]')[0]!.trigger('click');
    await wait();

    expect(arcs(wrapper)).toHaveLength(2);
    expect(middle(wrapper).label.text()).toBe('40');
    expect(wrapper.emitted('update:hidden')![0]).toEqual([['Search']]);
  });

  it('keeps the remaining slices the color they had', async () => {
    const wrapper = await withLegend({ colors: ['#f00', '#0f0', '#00f'] });
    await wrapper.findAll('[data-part="legend-item"]')[0]!.trigger('click');

    expect(fills(wrapper, 'arc')).toEqual(['#0f0', '#00f']);
  });
});

describe('the donut’s tooltip', () => {
  it('shows the slice in focus', async () => {
    const wrapper = await mountDonut();
    await focusFirst(wrapper);

    expect(wrapper.findAll('[data-part="tooltip-row"]')).toHaveLength(1);
    expect(wrapper.find('[data-part="tooltip-label"]').text()).toBe('Social');
    expect(wrapper.find('[data-part="tooltip-value"]').text()).toBe('30');
  });

  it('renames a slice and formats its size', async () => {
    const wrapper = await mountDonut({
      labelFormat: (category: string) => category.toUpperCase(),
      valueFormat: (value: number) => `${value}%`,
    });
    await focusFirst(wrapper);

    expect(wrapper.find('[data-part="tooltip-label"]').text()).toBe('SOCIAL');
    expect(wrapper.find('[data-part="tooltip-value"]').text()).toBe('30%');
  });

  it('hands the slice to a tooltip of the caller’s own', async () => {
    const wrapper = await mountDonut(
      {},
      { slots: { tooltip: '<template #tooltip="{ slice }"><b class="mine">{{ slice.category }}:{{ slice.value }}</b></template>' } },
    );
    await focusFirst(wrapper);

    expect(wrapper.find('.mine').text()).toBe('Social:30');
  });

  it('puts `tooltipClass` on its box, and is gone when turned off', async () => {
    const classed = await mountDonut({ tooltipClass: 'tip' });
    await focusFirst(classed);
    expect(classed.find('[data-part="chart-tooltip"]').classes()).toContain('tip');

    const off = await mountDonut({ tooltip: false });
    await focusFirst(off);
    expect(off.find('[data-part="chart-tooltip"]').exists()).toBe(false);
  });
});
