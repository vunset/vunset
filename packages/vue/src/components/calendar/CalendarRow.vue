<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useCalendarContext, type CalendarState, type CalendarView } from './use-calendar';

defineOptions({ name: 'CalendarRow', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Shows the row only in this view; without it, the row is always there. */
    view?: CalendarView;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'div' }
);

defineSlots<{
  /**
   * The calendar's state, for the slot only: the element carries none of it.
   * @slotOnly
   */
  default(props: CalendarState): unknown;
}>();

const calendar = useCalendarContext();
const merged = usePartProps(calendar.rowProps);
</script>

<template>
  <Part :as="props.as" v-if="!props.view || props.view === calendar.state.value.view" v-bind="merged">
    <slot v-bind="calendar.state.value" />
  </Part>
</template>
