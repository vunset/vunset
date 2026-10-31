<script setup lang="ts">
import { toRef } from 'vue';
import { useTooltipGroup } from './use-tooltip';

defineOptions({ name: 'TooltipGroup' });

const props = defineProps<{
  /** How long the pointer must rest before the first tooltip opens, in ms. @default 600 */
  delay?: number;
  /** How long after the pointer leaves before a tooltip hides, in ms. @default 0 */
  closeDelay?: number;
  /** How long after the last tooltip closes that neighbors still open instantly, in ms. @default 400 */
  timeout?: number;
}>();

useTooltipGroup({
  delay: toRef(() => props.delay),
  closeDelay: toRef(() => props.closeDelay),
  timeout: toRef(() => props.timeout),
});
</script>

<template>
  <slot />
</template>
