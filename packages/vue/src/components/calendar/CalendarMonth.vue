<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed, useAttrs } from 'vue';
import { mergeProps } from '../../shared/merge-props';
import { MONTHS_IN_YEAR } from '@vunset/utils';
import { useCalendarContext } from './use-calendar';

defineOptions({ name: 'CalendarMonth', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The month it stands for, `0`–`11`. Without it, it renders all twelve, in the month view only. */
    value?: number;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'button' }
);

const calendar = useCalendarContext();
const attrs = useAttrs();

const ALL = Array.from({ length: MONTHS_IN_YEAR }, (_, index) => index);
const values = computed(() => {
  if (props.value !== undefined) return [props.value];
  return calendar.state.value.view === 'month' ? ALL : [];
});
</script>

<template>
  <Part :as="props.as" v-for="month in values" :key="month" v-bind="mergeProps(calendar.getMonthProps(month), attrs)">
    <slot v-bind="calendar.getMonthState(month)">{{ calendar.getMonthState(month).label }}</slot>
  </Part>
</template>
