<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useCalendarContext, type CalendarState } from './use-calendar';

defineOptions({ name: 'CalendarPrev', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'button' }
);

defineSlots<{
  /**
   * The calendar's state, for the slot only: the element carries none of it.
   * @slotOnly
   */
  default(props: CalendarState): unknown;
}>();

const calendar = useCalendarContext();
const merged = usePartProps(calendar.prevProps);
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="calendar.state.value" />
  </Part>
</template>
