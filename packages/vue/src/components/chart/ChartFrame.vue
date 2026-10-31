<script lang="ts">
/** What a chart sees after each draw: the scene's size, and where the plot sits in it. */
export interface ChartRender {
  scene: {
    width: number;
    height: number;
    chart: { x: number; y: number; width: number; height: number };
  };
  svg: SVGSVGElement;
}
</script>

<script setup lang="ts">
import { computed, defineComponent, h, mergeProps, onMounted, shallowRef, useTemplateRef } from 'vue';
import { Chart, type ChartDefinition, type ChartPoint } from '@tanstack/charts/vue';

defineOptions({ name: 'ChartFrame' });

// Getters, read as the drawing renders: by then the parts in the slot have registered.
const props = defineProps<{
  /** Which chart this is, for `data-chart`. */
  kind?: string;
  definition: () => ChartDefinition<any, any, any>;
  /** The accessible name. */
  label: () => string;
  /** A number means pixels. */
  height: number | string;
  tooltip: () => boolean;
  /** Attributes for the tooltip's box. */
  tooltipAttrs?: () => Record<string, unknown>;
}>();

const emit = defineEmits<{
  render: [context: ChartRender];
}>();

const slots = defineSlots<{
  /** Content before the drawing, such as a `ChartLegend`. */
  default(): unknown;
  /** The tooltip's content, for the point in focus. */
  tooltip(props: { point: ChartPoint<any> }): unknown;
  /** Content laid over the plot, centered on it. */
  center?(): unknown;
}>();

/** `--chart-tick-font-size` in px, for the chart's definition. */
const tickSize = defineModel<number>('tickSize');

// TanStack takes the size as a number, so the stylesheet's length is read off a probe.
const probe = useTemplateRef<HTMLElement>('probe');

function readTickSize() {
  const size = probe.value ? parseFloat(getComputedStyle(probe.value).fontSize) : NaN;
  const next = size > 0 ? size : undefined;
  if (next !== tickSize.value) tickSize.value = next;
}

onMounted(readTickSize);

const plot = shallowRef<Record<string, string>>();

function onRender(context: ChartRender) {
  readTickSize();
  if (slots.center) {
    const { width, height, chart } = context.scene;
    plot.value = {
      top: `${chart.y}px`,
      left: `${chart.x}px`,
      right: `${width - chart.x - chart.width}px`,
      bottom: `${height - chart.y - chart.height}px`
    };
  }
  emit('render', context);
}

// The adapter sets its own size without a unit, which the browser drops.
const height = computed(() => (typeof props.height === 'number' ? `${props.height}px` : props.height));

const tooltipBody = ({ primaryPoint }: { primaryPoint?: ChartPoint<any> }) =>
  primaryPoint
    ? h('div', mergeProps({ 'data-part': 'chart-tooltip' }, props.tooltipAttrs?.() ?? {}), [
        h('div', { 'data-part': 'tooltip' }, slots.tooltip({ point: primaryPoint }) as any)
      ])
    : null;

// A component of its own, so it renders after the slot rather than with the frame.
const Drawing = defineComponent({
  name: 'ChartDrawing',
  setup: () => () =>
    h(
      Chart,
      { definition: props.definition(), ariaLabel: props.label(), style: { height: height.value }, onRender },
      props.tooltip() ? { tooltipBody } : {}
    )
});
</script>

<template>
  <div data-part="chart" :data-chart="props.kind">
    <slot />

    <div data-part="chart-plot" :style="{ position: 'relative' }">
      <span
        ref="probe"
        aria-hidden="true"
        :style="{ position: 'absolute', visibility: 'hidden', fontSize: 'var(--chart-tick-font-size, 0px)' }"
      />
      <Drawing />

      <div
        v-if="slots.center && plot"
        data-part="chart-center"
        :style="{
          position: 'absolute',
          ...plot,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }"
      >
        <slot name="center" />
      </div>
    </div>
  </div>
</template>
