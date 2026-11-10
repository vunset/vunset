<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useAvatarContext, type AvatarState } from './AvatarRoot.vue';

defineOptions({ name: 'AvatarFallback', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'span' }
);

defineSlots<{
  default(props: AvatarState): unknown;
}>();

const { state, showFallback, fallbackProps } = useAvatarContext();
const merged = usePartProps(fallbackProps);
</script>

<template>
  <Part v-if="showFallback" :as="props.as" v-bind="merged">
    <slot v-bind="state" />
  </Part>
</template>
