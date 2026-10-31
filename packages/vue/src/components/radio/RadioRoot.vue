<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed, toRef, useAttrs } from 'vue';
import { mergeProps } from '../../shared/merge-props';
import { useRadio, type RadioValue } from './use-radio-group';
import { provideToggleIndicator } from '../../shared/use-toggle-indicator';

defineOptions({ name: 'RadioRoot', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** What the group's `v-model` holds while this radio is chosen. */
    value: RadioValue;
    /** Takes this one radio out of reach; arrow keys skip it. */
    disabled?: boolean;
    /** The root's id. Generated when not given. */
    id?: string;
    /** Element or component to render. Anything but a `button` gets Enter/Space keys, and a `<label>` no longer names it. */
    as?: string | object;
  }>(),
  { disabled: false, as: 'button' }
);

const api = useRadio({
  value: toRef(() => props.value),
  disabled: toRef(() => props.disabled),
  id: toRef(() => props.id),
  native: toRef(() => props.as === 'button')
});

provideToggleIndicator({ state: api.state, hooks: api.hooks, present: () => api.checked.value });

defineExpose(api);

const attrs = useAttrs();
const rootProps = computed(() => mergeProps({ 'data-part': 'root', ...api.rootProps.value }, attrs));
</script>

<template>
  <Part :as="props.as" v-bind="rootProps">
    <slot v-bind="api.state.value" />
  </Part>
  <input v-bind="api.inputProps.value" />
</template>
