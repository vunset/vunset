<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { CollapsibleRoot, CollapsibleTrigger, CollapsiblePanel, isPropBound } from '@vunset/vue';
import AppIcon from './AppIcon.vue';

defineOptions({ name: 'AppCollapsible' });

// Forwarded only when bound, so one without `v-model:open` keeps its own state.
const openBound = isPropBound('open');

withDefaults(
  defineProps<{
    /** Whether it is open, bound with `v-model:open`. */
    open?: boolean;
    defaultOpen?: boolean;
    /** The trigger's text. Or use the `#trigger` slot. */
    title?: string;
    disabled?: boolean;
    /** Keeps the content in the page, hidden, while closed: for find-in-page, or state that must survive. */
    keepMounted?: boolean;
    /** Classes for the trigger row. */
    triggerClass?: HTMLAttributes['class'];
    /** Classes for the panel's content. */
    panelClass?: HTMLAttributes['class'];
  }>(),
  { open: undefined, defaultOpen: undefined }
);

const emit = defineEmits<{
  'update:open': [open: boolean];
}>();

defineSlots<{
  /** The content, shown while open. */
  default?(): unknown;
  /** The trigger's content, in place of `title`. */
  trigger?(props: { open: boolean }): unknown;
  /** The trigger's icon, in place of the chevron. */
  icon?(props: { open: boolean }): unknown;
}>();
</script>

<template>
  <CollapsibleRoot
    v-slot="{ open: isOpen }"
    v-bind="openBound ? { open } : {}"
    :default-open="defaultOpen"
    :disabled="disabled"
    class="app-collapsible"
    @update:open="emit('update:open', $event)"
  >
    <CollapsibleTrigger class="app-collapsible-trigger" :class="triggerClass">
      <span class="app-collapsible-title">
        <slot name="trigger" :open="isOpen">{{ title }}</slot>
      </span>

      <slot name="icon" :open="isOpen">
        <AppIcon name="chevron-down" class="app-collapsible-chevron" />
      </slot>
    </CollapsibleTrigger>

    <CollapsiblePanel :keep-mounted="keepMounted" class="app-collapsible-panel">
      <div class="app-collapsible-content" :class="panelClass"><slot /></div>
    </CollapsiblePanel>
  </CollapsibleRoot>
</template>
