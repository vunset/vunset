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

  it('titles its axes, and hands the tooltip its mode', async () => {
    const chart = await mountChart(AppChartLine, { xLabel: 'Day', yLabel: 'Visits', tooltipMode: 'point' });
    const texts = chart.findAll('svg text').map((text) => text.text());

    expect(texts).toEqual(expect.arrayContaining(['Day', 'Visits']));
    await focusSecond(chart);
    expect(chart.findAll('[data-part="tooltip-row"]')).toHaveLength(1);
  });

  it('places the rows by value on a `linear` x axis', async () => {
    const chart = await mountChart(AppChartArea, {
      data: [
        { at: 0, visits: 1 },
        { at: 1, visits: 2 },
        { at: 10, visits: 3 }
      ],
      categories: ['visits'],
      xKey: 'at',
      xScale: 'linear'
    });

    expect(ticks(chart, 'x')).not.toEqual(['0', '1', '10']);
  });

  it('draws solid bands without a line when asked', async () => {
    const chart = await mountChart(AppChartArea, { line: false, gradient: false });

    expect(marks(chart, 'line')).toHaveLength(0);
    expect(marks(chart, 'area').map((band) => band.attributes('fill'))).toEqual([
      'var(--chart-color-0, currentColor)',
      'var(--chart-color-1, currentColor)'
    ]);
  });

  it('cycles its colors at `palette-size`', async () => {
    const chart = await mountChart(AppChartLine, { paletteSize: 1 });

    expect(marks(chart, 'line').map((line) => line.attributes('stroke'))).toEqual([
      'var(--chart-color-0, currentColor)',
      'var(--chart-color-0, currentColor)'
    ]);
  });

  it('puts its legend below the drawing when asked', async () => {
    const chart = await mountChart(AppChartArea, { legendPlacement: 'bottom' });
    const legend = chart.find('[data-part="legend"]').element;
    const plot = chart.find('[data-part="chart-plot"]').element;

    expect(plot.compareDocumentPosition(legend) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('shows only the clicked series with `legend-isolate`', async () => {
    const chart = await mountChart(AppChartLine, { legendIsolate: true });
    await legendItems(chart)[0]!.trigger('click');

    expect(legendItems(chart).map((item) => item.attributes('aria-pressed'))).toEqual(['true', 'false']);
  });

  it('puts its legend classes on the legend and each button', async () => {
    const chart = await mountChart(AppChartLine, { legendClass: 'keys', legendItemClass: 'chip' });

    expect(chart.find('[data-part="legend"]').classes()).toContain('keys');
    expect(legendItems(chart).every((item) => item.classes('chip'))).toBe(true);

    wrapper?.unmount();
    wrapper = mount(AppChartDonut as any, {
      props: {
        data: [
          { s: 'a', n: 1 },
          { s: 'b', n: 2 }
        ],
        categoryKey: 's',
        valueKey: 'n',
        legend: true,
        legendItemClass: 'chip'
      },
      attachTo: document.body
    });
    await nextTick();
    expect(legendItems(wrapper).map((item) => item.classes('chip'))).toEqual([true, true]);
  });

  it('hands its legend slots on', async () => {
    const chart = await mountChart(
      AppChartArea,
      {},
      {
        slots: { 'legend-item': ({ label, index }: any) => h('em', { class: 'mine' }, `${index}-${label}`) }
      }
    );
    expect(chart.findAll('.mine').map((node) => node.text())).toEqual(['0-visits', '1-signups']);
    expect(legendItems(chart)).toHaveLength(2);

    const replaced = await mountChart(
      AppChartBar,
      {},
      {
        slots: {
          legend: ({ items }: any) => h('p', { class: 'whole' }, items.map((item: any) => item.label).join('+'))
        }
      }
    );
    expect(replaced.find('.whole').text()).toBe('visits+signups');
    expect(legendItems(replaced)).toHaveLength(0);
  });

  it('draws the axes’ own lines when asked', async () => {
    const chart = await mountChart(AppChartLine, { xAxisLine: true });

    expect(chart.findAll('.ts-chart__axes line[data-ts-key^="x-axis"]')).toHaveLength(1);
    expect(chart.findAll('.ts-chart__axes line[data-ts-key^="y-axis"]')).toHaveLength(0);
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
    const chart = await mountChart(
      AppChartBar,
      { categories: ['visits'], legend: true },
      { slots: { default: () => h(ChartLine, { yKey: 'signups' }) } }
    );

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

  it('hands the legend’s item slot on to its own legend', async () => {
    wrapper = mount(AppChartDonut as any, {
      props: { data: SOURCES, categoryKey: 'source', valueKey: 'total', legend: true },
      slots: { 'legend-item': ({ category }: any) => h('em', { class: 'mine' }, category) },
      attachTo: document.body
    });
    await nextTick();

    expect(wrapper.findAll('.mine').map((node) => node.text())).toEqual(['Search', 'Direct']);
  });

  it('leaves the legend out unless asked', async () => {
    wrapper = mount(AppChartDonut as any, {
      props: { data: SOURCES, categoryKey: 'source', valueKey: 'total' },
      attachTo: document.body
    });

    expect(legendItems(wrapper)).toHaveLength(0);
  });
});
