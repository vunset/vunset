<script setup lang="ts">
import { Appear, type AppearState } from '@vunset/vue';

defineOptions({ name: 'AppAppear' });

withDefaults(
  defineProps<{
    /** Whether the content is showing. */
    open?: boolean;
    /** Whether content that is already showing on the first render animates in. */
    appear?: boolean;
    /** Keep the element in the DOM while hidden, marked `hidden`, instead of unmounting it. */
    keepMounted?: boolean;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { open: true, appear: true, keepMounted: false, as: 'div' }
);

defineSlots<{
  /** The content. */
  default(props: AppearState): unknown;
}>();
</script>

<template>
  <Appear :open="open" :appear="appear" :keep-mounted="keepMounted" :as="as" class="app-appear">
    <template #default="state"><slot v-bind="state" /></template>
  </Appear>
</template>
