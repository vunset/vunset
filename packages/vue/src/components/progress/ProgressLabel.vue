<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed, onBeforeUnmount, useAttrs, useId } from 'vue';
import { mergeProps } from '../../shared/merge-props';
import { useGaugeContext, type GaugeState } from '../../shared/use-gauge';

defineOptions({ name: 'ProgressLabel', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The id the progress is labeled by. Generated when not given. */
    id?: string;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'span' }
);

defineSlots<{
  /** @slotOnly The element carries only the id the progress is labeled by. */
  default(props: GaugeState): unknown;
}>();

const { registerLabel, state } = useGaugeContext();

const generatedId = useId();
const id = props.id ?? generatedId;

onBeforeUnmount(registerLabel(id));

const attrs = useAttrs();
const merged = computed(() => mergeProps({ 'data-part': 'label', id }, attrs));
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="state" />
  </Part>
</template>
