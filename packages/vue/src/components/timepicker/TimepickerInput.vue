<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useTimepickerContext, type TimepickerState } from './use-timepicker';
import TimepickerSegment from './TimepickerSegment.vue';

defineOptions({ name: 'TimepickerInput', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'div' }
);

defineSlots<{
  /** The segments. Left empty, one per unit with `:` between them, and a space before AM/PM. */
  default(props: TimepickerState): unknown;
}>();

const { inputProps, state, units } = useTimepickerContext();
const merged = usePartProps(inputProps);
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="state">
      <template v-for="(unit, index) in units" :key="unit">
        <span v-if="index > 0" data-part="separator" aria-hidden="true">{{ unit === 'period' ? '&nbsp;' : ':' }}</span>
        <TimepickerSegment :unit="unit" />
      </template>
    </slot>
  </Part>
</template>
