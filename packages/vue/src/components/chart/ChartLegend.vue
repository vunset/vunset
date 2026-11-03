<script lang="ts">
/** One entry in a legend. */
export interface ChartLegendItem {
  category: string;
  label: string;
  color: string;
  /** Its series isn't drawn. */
  hidden: boolean;
  /** Hides it, or shows it again. */
  toggle: () => void;
}
</script>

<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed, useAttrs, type HTMLAttributes } from 'vue';
import { mergeProps } from '../../shared/merge-props';
import { useControlled } from '../../shared/use-controlled';
import { useOptionalChartContext } from './use-chart-series';
import { chartColors } from '@vunset/utils';

defineOptions({ name: 'ChartLegend', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The hidden categories, bound with `v-model`, for a legend beside a chart rather than inside it. */
    modelValue?: string[];
    /** Taken from the chart this sits inside, when it sits inside one. */
    categories?: string[];
    /** One per category; taken from the chart this sits inside, or `var(--chart-color-N)`. */
    colors?: string[];
    /** How many `--chart-color-N` the theme defines: series past it start over at the first. @default 8 */
    paletteSize?: number;
    /** Renames a category for the reader. Inside a chart, each series' `label` already does. */
    labelFormat?: (category: string) => string;
    /** Inside a chart: above the drawing, or below it. @default 'top' */
    placement?: 'top' | 'bottom';
    /** A class for each button, beside its `data-part="legend-item"`. */
    itemClass?: HTMLAttributes['class'];
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { modelValue: undefined, as: 'div', placement: 'top' }
);

const emit = defineEmits<{
  /** A category was shown or hidden, for `v-model`. */
  'update:modelValue': [hidden: string[]];
}>();

defineSlots<{
  /**
   * Replaces the buttons.
   * @slotOnly The element carries only `data-part="legend"`.
   */
  default(props: {
    /** One per category, with its `category`, `label`, `color`, whether it is `hidden`, and a `toggle()`. */
    items: ChartLegendItem[];
    /** The hidden categories. */
    hidden: string[];
  }): unknown;
  /** Replaces what each button shows, a swatch and the label; the button and its toggling stay. */
  item?(props: ChartLegendItem & { index: number }): unknown;
}>();

const chart = useOptionalChartContext();
const driven = chart !== null && props.modelValue === undefined;

const own = useControlled<string[]>({
  value: () => props.modelValue,
  defaultValue: () => [],
  onChange: (next) => emit('update:modelValue', next),
  name: 'ChartLegend',
  label: 'modelValue'
});

const categories = computed(() => props.categories ?? chart?.categories.value ?? []);
const colors = computed(
  () =>
    props.colors ?? chart?.colors.value ?? chartColors(categories.value.length, undefined, undefined, props.paletteSize)
);
const hidden = computed(() => (driven ? chart!.hidden.value : own.value));

function toggle(category: string): void {
  if (driven) {
    chart!.toggle(category);
    return;
  }
  own.value = hidden.value.includes(category)
    ? hidden.value.filter((entry) => entry !== category)
    : [...hidden.value, category];
}

const items = computed<ChartLegendItem[]>(() =>
  categories.value.map((category, index) => ({
    category,
    label: props.labelFormat
      ? props.labelFormat(category)
      : ((props.categories ? undefined : chart?.labels?.value[index]) ?? category),
    color: colors.value[index] ?? '',
    hidden: hidden.value.includes(category),
    toggle: () => toggle(category)
  }))
);

const attrs = useAttrs();
const merged = computed(() => mergeProps({ 'data-part': 'legend', 'data-placement': props.placement }, attrs));
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="{ items, hidden }">
      <button
        v-for="(item, index) in items"
        :key="item.category"
        type="button"
        data-part="legend-item"
        :class="props.itemClass"
        :data-hidden="item.hidden ? '' : undefined"
        :aria-pressed="!item.hidden"
        @click="item.toggle()"
      >
        <slot name="item" v-bind="{ ...item, index }">
          <span data-part="legend-swatch" :style="{ background: item.color }" />
          <span data-part="legend-label">{{ item.label }}</span>
        </slot>
      </button>
    </slot>
  </Part>
</template>
