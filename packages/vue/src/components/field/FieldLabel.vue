<script setup lang="ts">
import { Part } from '../../shared/part';
import { onBeforeUnmount } from 'vue';
import { usePartProps } from '../../shared/use-part-props';
import { useFieldContext } from '../../shared/use-field';

defineOptions({ name: 'FieldLabel', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'label' }
);

const { labelProps, state, registerLabel } = useFieldContext();

onBeforeUnmount(registerLabel());

// `for` only works on a `<label>`; other tags rely on `aria-labelledby`.
const merged = usePartProps(() => {
  if (!props.as || props.as === 'label') return labelProps.value;
  const { for: _for, ...rest } = labelProps.value;
  return rest;
});
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="state" />
  </Part>
</template>
