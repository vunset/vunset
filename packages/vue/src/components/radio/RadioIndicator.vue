<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useToggleIndicator } from '../../shared/use-toggle-indicator';
import type { RadioState } from './use-radio-group';

defineOptions({ name: 'RadioIndicator', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Stays in the DOM while unchecked, for styling both states yourself. */
    keepMounted?: boolean;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'span' }
);

const { mounted, state, indicatorProps } = useToggleIndicator<RadioState>();

const merged = usePartProps(indicatorProps);
</script>

<template>
  <Part :as="props.as" v-if="mounted || props.keepMounted" v-bind="merged">
    <slot v-bind="state" />
  </Part>
</template>
