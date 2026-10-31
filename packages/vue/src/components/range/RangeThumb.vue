<script setup lang="ts">
import { Part } from '../../shared/part';
import { toRef } from 'vue';
import { usePartProps } from '../../shared/use-part-props';
import { useRangeThumb, type RangeState } from './use-range';

defineOptions({ name: 'RangeThumb', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Which value this thumb controls. Defaults to its position among its siblings. */
    index?: number;
    /** Takes this one thumb out of reach of pointer and keyboard. */
    disabled?: boolean;
    /** Names the thumb's input, e.g. "Lowest" and "Highest" for a two-thumb range. */
    ariaLabel?: string;
    /** Overrides what is announced in place of the raw number. */
    valueText?: string;
    /** Builds what is announced, from the formatted value. Wins over `valueText`. */
    getValueText?: (formattedValue: string, value: number, index: number) => string;
    /** The thumb input's `tabindex`. */
    tabIndex?: number;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'div' }
);

defineSlots<{
  default(
    props: RangeState & {
      /**
       * Which value this thumb controls.
       * @attribute `data-index="…"`
       */
      index: number;
      /**
       * The value it is at.
       * @attribute none
       */
      value: number;
    }
  ): unknown;
}>();

const api = useRangeThumb({
  index: toRef(() => props.index),
  disabled: toRef(() => props.disabled ?? false),
  ariaLabel: toRef(() => props.ariaLabel),
  valueText: toRef(() => props.valueText),
  getValueText: props.getValueText,
  tabIndex: toRef(() => props.tabIndex)
});

defineExpose(api);

const merged = usePartProps(api.thumbProps);
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="api.state.value" :index="api.index.value" :value="api.value.value" />

    <input v-bind="api.inputProps.value" />
  </Part>
</template>
