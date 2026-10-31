<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed, useAttrs } from 'vue';
import { mergeProps } from '../../shared/merge-props';
import { useGauge, provideGaugeContext, type GaugeState } from '../../shared/use-gauge';

defineOptions({ name: 'ProgressRoot', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The value, or `null` while there is no telling how far along it is. */
    value: number | null;
    /** The lower end of the range. */
    min?: number;
    /** The upper end of the range. */
    max?: number;
    /** How the value is shown and read out, as `Intl.NumberFormat` options. The bare number otherwise. */
    format?: Intl.NumberFormatOptions;
    /** The locale `format` uses. The runtime's own by default. */
    locale?: Intl.LocalesArgument;
    /** The text read out for the value, from the formatted value and the raw one: "3 of 7 steps" rather than "3". */
    getValueText?: (formattedValue: string, value: number | null) => string;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { min: 0, max: 100, as: 'div' }
);

defineSlots<{
  default(props: GaugeState): unknown;
}>();

const api = useGauge({
  role: 'progressbar',
  value: () => props.value,
  min: () => props.min,
  max: () => props.max,
  format: () => props.format,
  locale: () => props.locale,
  getValueText: props.getValueText
});

provideGaugeContext(api);
defineExpose(api);

const attrs = useAttrs();
const rootProps = computed(() => mergeProps(api.rootProps.value, attrs));
</script>

<template>
  <Part :as="props.as" v-bind="rootProps">
    <slot v-bind="api.state.value" />
  </Part>
</template>
