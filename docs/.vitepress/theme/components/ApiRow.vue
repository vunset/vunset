<script setup lang="ts">
import { computed } from 'vue';
import { CollapsiblePanel, CollapsibleRoot, CollapsibleTrigger } from '@vunset/vue';
import PlusIcon from './PlusIcon.vue';

const props = defineProps<{
  /** A field of a slot's row: flush, with a narrower name column. */
  nested?: boolean;
}>();

defineSlots<{ head(): unknown; default?(): unknown }>();

const row = computed(() => ['not-last:border-b border-edge-strong', !props.nested && 'mx-4 py-1.5']);
const head = computed(() => [
  'group grid w-full items-center gap-x-4 gap-y-1 text-left outline-none grid-cols-[minmax(0,1fr)_0.75rem]',
  props.nested
    ? 'sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_0.75rem]'
    : 'sm:grid-cols-[minmax(0,2fr)_minmax(0,5fr)_0.75rem]'
]);
</script>

<template>
  <CollapsibleRoot v-if="$slots.default" :class="row">
    <CollapsibleTrigger :class="[head, 'cursor-pointer']">
      <slot name="head" />
      <PlusIcon class="col-start-2 row-start-1 sm:col-start-3 self-center justify-self-end" />
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
      <slot name="head" />
    </div>
  </div>
</template>

<style>
@reference '../style.css';

.api-description a {
  @apply border-b border-current/30 duration-200 hover:border-accent;
}
</style>
