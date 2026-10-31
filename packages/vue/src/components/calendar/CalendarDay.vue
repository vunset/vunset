<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed, useAttrs } from 'vue';
import { mergeProps } from '../../shared/merge-props';
import { useCalendarContext } from './use-calendar';
import { useCalendarWeek } from './CalendarWeek.vue';

defineOptions({ name: 'CalendarDay', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The day it stands for. Without it, it renders every day of its `CalendarWeek`. */
    value?: Date;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'button' }
);

const calendar = useCalendarContext();
const week = useCalendarWeek();
const attrs = useAttrs();

if (process.env.NODE_ENV !== 'production' && props.value === undefined && !week) {
  console.warn('[CalendarDay] Without a `value` it renders the days of its `CalendarWeek`, and it is not inside one.');
}

const dates = computed(() => (props.value ? [props.value] : (week?.() ?? [])));
</script>

<template>
  <Part
    :as="props.as"
    v-for="date in dates"
    :key="date.getTime()"
    v-bind="mergeProps(calendar.getDayProps(date), attrs)"
  >
    <slot v-bind="calendar.getDayState(date)">{{ date.getDate() }}</slot>
  </Part>
</template>
