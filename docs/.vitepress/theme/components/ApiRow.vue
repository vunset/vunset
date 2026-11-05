<script setup lang="ts">
import { computed } from 'vue';
import { CollapsiblePanel, CollapsibleRoot, CollapsibleTrigger } from '@vunset/vue';
import PlusIcon from './PlusIcon.vue';

const props = defineProps<{
  /** A field of a slot's row: flush, with a narrower name column. */
  nested?: boolean;
}>();

defineSlots<{ head(): unknown; default?(): unknown }>();

const row = computed(() =>
  props.nested ? 'not-last:border-b border-docs-border py-2' : 'rounded-xl bg-docs-bg p-3'
);
const head = computed(() => [
  'group grid w-full items-center gap-x-2.5 gap-y-1.5 text-left outline-none grid-cols-[0.75rem_minmax(0,1fr)]',
  props.nested
    ? 'sm:grid-cols-[0.75rem_minmax(0,1fr)_minmax(0,2fr)]'
    : 'sm:grid-cols-[0.75rem_minmax(0,9rem)_minmax(0,1fr)]'
]);
</script>

<template>
  <CollapsibleRoot v-if="$slots.default" :class="row">
    <CollapsibleTrigger :class="[head, 'cursor-pointer']">
      <PlusIcon />
      <slot name="head" />
    </CollapsibleTrigger>

    <CollapsiblePanel
      keep-mounted
      class="overflow-hidden h-(--collapsible-panel-height) transition-[height] duration-200 ease-out data-enter-from:h-0 data-leave-to:h-0"
    >
      <slot />
    </CollapsiblePanel>
  </CollapsibleRoot>

  <div v-else :class="row">
    <div :class="head">
      <span />
      <slot name="head" />
    </div>
  </div>
</template>

<style>
@reference '../style.css';

/* the type reads as plain code beside the name's badge, and wraps: the prose's
   inline code stays on one line, which a slot's long props list would overflow */
article code.api-type {
  @apply bg-transparent whitespace-normal wrap-break-word;
}

.api-description a {
  @apply border-b border-current/30 duration-200 hover:border-docs-accent;
}
</style>
