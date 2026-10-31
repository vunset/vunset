<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useTimepickerColumn, type TimeUnit } from './use-timepicker';

defineOptions({ name: 'TimepickerColumn', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Which part of the time it lists. */
    unit: TimeUnit;
    /** Element or component each option renders. */
    optionAs?: string | object;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { optionAs: 'div', as: 'div' }
);

defineSlots<{
  /**
   * One option's content.
   * @slotOnly Each option carries `data-part="option"`, `data-value`, `data-selected` while picked, and `data-disabled` outside `min`/`max`.
   */
  option(props: {
    /** The hour 0–23 even in 12-hour, the minute or second, or `0`/`1` for AM/PM. */
    value: number;
    /** As the segment shows it: `07`, `12`, `PM`. */
    label: string;
    selected: boolean;
    disabled: boolean;
  }): unknown;
}>();

const { shown, columnProps, options } = useTimepickerColumn(() => props.unit);
const merged = usePartProps(columnProps);
</script>

<template>
  <Part v-if="shown" :as="props.as" v-bind="merged">
    <Part v-for="option in options" :key="option.value" :as="props.optionAs" v-bind="option.props">
      <slot name="option" :value="option.value" :label="option.label" :selected="option.selected" :disabled="option.disabled">
        {{ option.label }}
      </slot>
    </Part>
  </Part>
</template>
