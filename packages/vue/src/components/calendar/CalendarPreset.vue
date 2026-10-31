<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed, useAttrs } from 'vue';
import { mergeProps } from '../../shared/merge-props';
import { useCalendarContext } from './use-calendar';

defineOptions({ name: 'CalendarPreset', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Which preset it applies, by `key`. Without it, it renders every preset. */
    value?: string;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'button' }
);

defineSlots<{
  /** The preset's details; empty for a `value` that names no preset. */
  default(props: {
    /**
     * Which preset it is.
     * @attribute `data-value="…"`
     */
    key?: string;
    /**
     * What it is called.
     * @attribute none
     */
    label?: string;
    /**
     * The first and last day it selects.
     * @attribute none
     */
    range?: [Date, Date];
    /** Whether it can't be applied: its days fall outside `min`/`max`, or it is a quarter yet to start. */
    disabled?: boolean;
  }): unknown;
}>();

const calendar = useCalendarContext();
const attrs = useAttrs();

const keys = computed(() => (props.value !== undefined ? [props.value] : calendar.presets.value.map((preset) => preset.key)));
</script>

<template>
  <Part :as="props.as" v-for="key in keys" :key="key" v-bind="mergeProps(calendar.getPresetProps(key), attrs)">
    <slot v-bind="calendar.getPresetState(key) ?? {}">{{ calendar.getPresetState(key)?.label }}</slot>
  </Part>
</template>
