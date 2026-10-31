<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed } from 'vue';
import { usePartProps } from '../../shared/use-part-props';
import { useDatepickerContext } from './DatepickerRoot.vue';

defineOptions({ name: 'DatepickerValue', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Shown while nothing is picked. */
    placeholder?: string;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'span' }
);

defineSlots<{
  /**
   * The value, to write another way.
   * @slotOnly The element carries `data-placeholder` while nothing is picked.
   */
  default(props: {
    /** Every picked day, in order. */
    dates: Date[];
    /** The value as the part writes it; empty while nothing is picked. */
    text: string;
  }): unknown;
}>();

const { state, text, hooks } = useDatepickerContext();
const empty = computed(() => state.value.selected.length === 0);
const merged = usePartProps(() => ({
  ...hooks.value,
  'data-part': 'value',
  'data-placeholder': empty.value ? '' : undefined
}));
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot :dates="state.selected" :text="text">{{ empty ? props.placeholder : text }}</slot>
  </Part>
</template>
