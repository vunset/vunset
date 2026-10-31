<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useRegisteredId } from '../../shared/labeling';
import { useToastRootContext, type ToastSlotProps } from '../../composables/use-toast';

defineOptions({ name: 'ToastDescription', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'div' }
);

defineSlots<{
  /** Shows the toast's `text` when left empty. */
  default(props: ToastSlotProps): unknown;
}>();

const { descriptionProps, state, toast, close, registerDescription } = useToastRootContext();

const id = useRegisteredId(registerDescription);

const merged = usePartProps(() => ({ ...descriptionProps.value, id: id.value }));
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="state" :toast="toast" :close="close">{{ toast.text }}</slot>
  </Part>
</template>
