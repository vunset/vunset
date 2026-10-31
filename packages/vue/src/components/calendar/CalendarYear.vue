<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed, useAttrs } from 'vue';
import { mergeProps } from '../../shared/merge-props';
import { useCalendarContext } from './use-calendar';

defineOptions({ name: 'CalendarYear', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The year it stands for. Without it, it renders every year on the page, in the year view only. */
    value?: number;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'button' }
);

const calendar = useCalendarContext();
const attrs = useAttrs();

const values = computed(() => {
  if (props.value !== undefined) return [props.value];
  return calendar.state.value.view === 'year' ? calendar.years.value : [];
});
</script>

<template>
  <Part :as="props.as" v-for="year in values" :key="year" v-bind="mergeProps(calendar.getYearProps(year), attrs)">
    <slot v-bind="calendar.getYearState(year)">{{ year }}</slot>
  </Part>
</template>
