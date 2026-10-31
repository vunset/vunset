<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed, toRef, useAttrs } from 'vue';
import { mergeProps } from '../../shared/merge-props';
import type { Orientation } from '../../shared/use-roving-focus';
import { useAccordion, provideAccordionContext, type AccordionValue } from './use-accordion';

defineOptions({ name: 'AccordionRoot', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The open items' values, bound with `v-model`. Always an array. */
    modelValue?: AccordionValue[];
    /** The open items at first, when no `v-model` owns them. */
    defaultValue?: AccordionValue[];
    /** Let more than one item be open at a time. Otherwise opening one closes the others. */
    multiple?: boolean;
    /** Disables every item. */
    disabled?: boolean;
    /** Which arrow keys move between the triggers: Up/Down, or Left/Right for a horizontal one. */
    orientation?: Orientation;
    /** Whether arrow keys wrap past the first and last trigger. */
    loop?: boolean;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  {
    modelValue: undefined,
    defaultValue: undefined,
    multiple: false,
    disabled: false,
    orientation: 'vertical',
    loop: true,
    as: 'div'
  }
);

const emit = defineEmits<{
  /** The open items' new values, for `v-model`. */
  'update:modelValue': [value: AccordionValue[]];
  /** The same, for a listener without `v-model`. */
  change: [value: AccordionValue[]];
}>();

const api = useAccordion({
  value: toRef(() => props.modelValue),
  defaultValue: toRef(() => props.defaultValue),
  multiple: toRef(() => props.multiple),
  disabled: toRef(() => props.disabled),
  orientation: toRef(() => props.orientation),
  loop: toRef(() => props.loop),
  onChange: (value) => {
    emit('update:modelValue', value);
    emit('change', value);
  }
});

provideAccordionContext(api);
defineExpose(api);

const attrs = useAttrs();
const rootProps = computed(() => mergeProps(api.rootProps.value, attrs));
</script>

<template>
  <Part :as="props.as" v-bind="rootProps">
    <slot v-bind="api.state.value" />
  </Part>
</template>
