<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed, useAttrs } from 'vue';
import { mergeProps } from '../../shared/merge-props';
import { useButton } from './use-button';

defineOptions({ name: 'Button', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Blocks clicks and removes the button from the tab order. */
    disabled?: boolean;
    /** Native `type`. The `button` default keeps it from submitting a form. */
    type?: 'button' | 'submit' | 'reset';
    /** Keeps a disabled button focusable, using `aria-disabled` instead of `disabled`. */
    focusableWhenDisabled?: boolean;
    /** Element or component to render. Anything but a native button gets `role="button"` and Enter/Space keys. */
    as?: string | object;
  }>(),
  { type: 'button', as: 'button' }
);

const attrs = useAttrs();

const navigates = computed(() => attrs.href !== undefined || attrs.to !== undefined || props.as === 'a');

const inertLink = computed(() => Boolean(props.disabled) && navigates.value);

const dynamicTag = computed(() => {
  if (inertLink.value) return null;

  return props.as && props.as !== 'button' ? props.as : null;
});

const api = useButton({
  disabled: () => props.disabled,
  type: () => props.type,
  native: () => dynamicTag.value === null,
  link: () => navigates.value && !inertLink.value,
  focusableWhenDisabled: () => props.focusableWhenDisabled
});

defineExpose(api);

const merged = computed(() => {
  const next = mergeProps(api.rootProps.value, attrs);

  if (inertLink.value) {
    delete next.href;
    delete next.to;
  }

  return next;
});
</script>

<template>
  <Part :as="dynamicTag ?? 'button'" v-bind="merged">
    <slot v-bind="api.state.value" />
  </Part>
</template>
