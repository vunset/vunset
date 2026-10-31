<script setup lang="ts">
import { Part } from '../../shared/part';
import { toRef } from 'vue';
import { usePartProps } from '../../shared/use-part-props';
import { useFieldError, type FieldErrorState } from '../../shared/use-field';

defineOptions({ name: 'FieldError', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Shows or hides the message, overriding the field's `invalid`. */
    match?: boolean;
    /** Shows this name's `useValidate()` error instead; works outside a `FieldRoot` too. */
    name?: string;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { match: undefined, as: 'div' }
);

defineSlots<{
  default(
    props: FieldErrorState & {
      /**
       * The validation message, kept through the exit animation.
       * @attribute none
       */
      message: string | undefined;
    }
  ): unknown;
}>();

const { mounted, errorProps, state, message } = useFieldError({ match: toRef(() => props.match), name: toRef(() => props.name) });
const merged = usePartProps(errorProps);
</script>

<template>
  <Part :as="props.as" v-if="mounted" v-bind="merged">
    <slot v-bind="state" :message="message">{{ message }}</slot>
  </Part>
</template>
