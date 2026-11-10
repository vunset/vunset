<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useOtpContext } from './OtpRoot.vue';

defineOptions({ name: 'OtpInput', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Which character of the code this box holds, from 0. */
    index: number;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'input' }
);

const { getInputProps } = useOtpContext();
const merged = usePartProps(() => getInputProps(props.index));
</script>

<template>
  <Part :as="props.as" v-bind="merged" />
</template>
