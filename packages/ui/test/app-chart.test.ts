import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { ChartLine } from '@vunset/vue/chart';
import { AppChartArea, AppChartBar, AppChartDonut, AppChartLine } from '../src/chart';
import { resetLayout, setLayout } from '../../vue/test/layout';
import { focusSecond, marks, ticks } from '../../vue/test/chart-dom';

const DATA = [
  { date: 'Mon', visits: 10, signups: 4 },
  { date: 'Tue', visits: 20, signups: 9 },
  { date: 'Wed', visits: 15, signups: 6 }
];

let wrapper: VueWrapper<any> | undefined;

beforeEach(() => setLayout({ width: 600, height: 300 }));
afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
  resetLayout();
});

async function mountChart(component: any, props: Record<string, unknown> = {}, options: Record<string, any> = {}) {
  wrapper = mount(component, {
    props: { data: DATA, categories: ['visits', 'signups'], xKey: 'date', ...props },
    attachTo: document.body,
    ...options
  });
  await nextTick();
  return wrapper;
}

const legendItems = (chart: VueWrapper<any>) => chart.findAll('[data-part="legend-item"]');

describe('the cartesian charts', () => {
  it.each([
    ['AppChartArea', AppChartArea, 'area', 2],
    ['AppChartLine', AppChartLine, 'line', 2],
    ['AppChartBar', AppChartBar, 'bar', 6]
  ])('%s draws its series with axes, grid and legend', async (_, component, kind, count) => {
    const chart = await mountChart(component);

    expect(marks(chart, kind as any)).toHaveLength(count);
    expect(ticks(chart, 'x')).toEqual(['Mon', 'Tue', 'Wed']);
    expect(ticks(chart, 'y').length).toBeGreaterThan(0);
    expect(chart.findAll('.ts-chart__grid line').length).toBeGreaterThan(0);
    expect(legendItems(chart)).toHaveLength(2);
  });

  it('shows the legend for more than one series, unless told otherwise', async () => {
    expect(legendItems(await mountChart(AppChartArea, { categories: ['visits'] }))).toHaveLength(0);
    expect(legendItems(await mountChart(AppChartArea, { categories: ['visits'], legend: true }))).toHaveLength(1);
    expect(legendItems(await mountChart(AppChartArea, { legend: false }))).toHaveLength(0);
  });

  it('leaves out what it is told to', async () => {
    const chart = await mountChart(AppChartLine, { xAxis: false, yAxis: false, grid: false });

    expect(ticks(chart, 'x')).toEqual([]);
    expect(ticks(chart, 'y')).toEqual([]);
    expect(chart.findAll('.ts-chart__grid line')).toHaveLength(0);
  });

  it('names each series by `label-format`, in the legend and the tooltip', async () => {
    const chart = await mountChart(AppChartArea, { labelFormat: (key: string) => key.toUpperCase() });

    expect(legendItems(chart).map((item) => item.text())).toEqual(['VISITS', 'SIGNUPS']);
    await focusSecond(chart);
    expect(chart.findAll('[data-part="tooltip-label"]').map((n) => n.text())).toEqual(['VISITS', 'SIGNUPS']);
  });

  it('formats both axes and the tooltip', async () => {
    const chart = await mountChart(AppChartBar, {
      xFormat: (value: string) => value.toUpperCase(),
      yFormat: (value: number) => `${value}!`
    });

    expect(ticks(chart, 'x')).toEqual(['MON', 'TUE', 'WED']);
    expect(ticks(chart, 'y').every((label) => label.endsWith('!'))).toBe(true);
    await focusSecond(chart);
    expect(chart.find('[data-part="tooltip-heading"]').text()).toBe('TUE');
    expect(chart.find('[data-part="tooltip-value"]').text()).toBe('20!');
  });

  it('puts its class on the chart and leaves its own props off it', async () => {
    const chart = await mountChart(AppChartArea, {}, { attrs: { class: 'mine' } });
    const root = chart.find('[data-part="chart"]');

    expect(root.classes()).toContain('mine');
    expect(root.attributes('categories')).toBeUndefined();
    expect(root.attributes('colors')).toBeUndefined();
  });

  it('keeps its own hidden list without `v-model:hidden`', async () => {
    const chart = await mountChart(AppChartBar);
    await legendItems(chart)[0]!.trigger('click');

    expect(marks(chart, 'bar')).toHaveLength(3);
    expect(chart.emitted('update:hidden')![0]).toEqual([['visits']]);
  });

  it('follows `v-model:hidden` when bound', async () => {
    const chart = await mountChart(AppChartBar, { hidden: ['visits'] });
    expect(marks(chart, 'bar')).toHaveLength(3);

    await legendItems(chart)[1]!.trigger('click');
    // Controlled: the click asks, and the parent has not answered.
    expect(marks(chart, 'bar')).toHaveLength(3);

    await chart.setProps({ hidden: [] });
    expect(marks(chart, 'bar')).toHaveLength(6);
  });

  it('takes more parts in its slot', async () => {
    const chart = await mountChart(AppChartBar, { categories: ['visits'], legend: true }, { slots: { default: () => h(ChartLine, { yKey: 'signups' }) } });

    expect(marks(chart, 'bar')).toHaveLength(3);
    expect(marks(chart, 'line')).toHaveLength(1);
    expect(legendItems(chart)).toHaveLength(2);
  });

  it('hands the tooltip slot on', async () => {
    const chart = await mountChart(
      AppChartArea,
      {},
      { slots: { tooltip: ({ heading }: any) => h('p', { class: 'mine' }, heading) } }
    );
    await focusSecond(chart);

    expect(chart.find('.mine').text()).toBe('Tue');
  });

  it('lays bars across with the rows down the side', async () => {
    const chart = await mountChart(AppChartBar, { orientation: 'horizontal' });

    expect(ticks(chart, 'y')).toEqual(['Mon', 'Tue', 'Wed']);
  });
});

describe('AppChartDonut', () => {
  const SOURCES = [
    { source: 'Search', total: 50 },
    { source: 'Direct', total: 30 }
  ];

  it('draws a slice per row, with a legend when asked', async () => {
    wrapper = mount(AppChartDonut as any, {
      props: { data: SOURCES, categoryKey: 'source', valueKey: 'total', legend: true },
      attachTo: document.body
    });
    await nextTick();

    expect(marks(wrapper, 'arc')).toHaveLength(2);
    expect(legendItems(wrapper).map((item) => item.text())).toEqual(['Search', 'Direct']);

    await legendItems(wrapper)[0]!.trigger('click');
    expect(marks(wrapper, 'arc')).toHaveLength(1);
  });

  it('leaves the legend out unless asked', async () => {
    wrapper = mount(AppChartDonut as any, {
      props: { data: SOURCES, categoryKey: 'source', valueKey: 'total' },
      attachTo: document.body
    });

    expect(legendItems(wrapper)).toHaveLength(0);
  });
});
