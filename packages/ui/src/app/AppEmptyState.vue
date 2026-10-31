<script setup lang="ts">
import { Part } from '@vunset/vue';
import type { AppTone } from './AppButton.vue';
import AppIcon from './AppIcon.vue';

defineOptions({ name: 'AppEmptyState' });

withDefaults(
  defineProps<{
    /** An icon's name, drawn through AppIcon above the title. Or use the `#icon` slot. */
    icon?: string;
    title?: string;
    /** The text under the title. */
    description?: string;
    /** Colors the icon: `neutral`, `accent`, `success`, `warning` or `danger`, as on a button. */
    tone?: AppTone;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { tone: 'neutral', as: 'div' }
);

defineSlots<{
  /** The icon, in place of `icon`: an AppSpinner, an illustration. */
  icon?(): unknown;
  title?(): unknown;
  description?(): unknown;
  /** Anything else, under the text. */
  default?(): unknown;
  /** Buttons at the bottom: "Create the first one". */
  actions?(): unknown;
}>();
</script>

<template>
  <Part :as="as" class="app-empty-state" :data-tone="tone">
    <span v-if="icon || $slots.icon" class="app-empty-state-icon">
      <slot name="icon"><AppIcon :name="icon!" /></slot>
    </span>
    <p v-if="title || $slots.title" class="app-empty-state-title">
      <slot name="title">{{ title }}</slot>
    </p>
    <p v-if="description || $slots.description" class="app-empty-state-description">
      <slot name="description">{{ description }}</slot>
    </p>
    <slot />
    <div v-if="$slots.actions" class="app-empty-state-actions"><slot name="actions" /></div>
  </Part>
</template>
