<script setup lang="ts">
import { computed } from 'vue';
import { AlertRoot, AlertTitle, AlertDescription } from '@vunset/vue';
import type { AppTone } from './AppButton.vue';
import AppIcon from './AppIcon.vue';

defineOptions({ name: 'AppAlert' });

const props = withDefaults(
  defineProps<{
    /** `neutral`, `accent`, `success`, `warning` or `danger`, as on a button. */
    tone?: AppTone;
    title?: string;
    /** The text under the title. Or put it in the default slot. */
    description?: string;
    /** The icon before the title; `false` leaves it out. Each tone has its own. */
    icon?: boolean;
    /** A close button, which emits `close`; the page removes the alert. */
    closable?: boolean;
    /** Names the close button. */
    closeLabel?: string;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { tone: 'neutral', icon: true, closeLabel: 'Dismiss', as: 'div' }
);

const emit = defineEmits<{
  /** The close button was pressed. */
  close: [event: MouseEvent];
}>();

// One icon per tone, drawn in the tone's color.
const ICONS: Record<string, string> = {
  neutral: 'alert-info',
  accent: 'alert-info',
  success: 'alert-success',
  warning: 'alert-warning',
  danger: 'alert-danger'
};
const iconName = computed(() => ICONS[props.tone] ?? ICONS.neutral!);
</script>

<template>
  <AlertRoot class="app-alert" :data-tone="tone" :as="as">
    <span v-if="icon || $slots.icon" class="app-alert-icon" aria-hidden="true">
      <slot name="icon">
        <AppIcon :name="iconName" />
      </slot>
    </span>

    <div class="app-alert-body">
      <AlertTitle v-if="title || $slots.title" class="app-alert-title">
        <slot name="title">{{ title }}</slot>
      </AlertTitle>

      <AlertDescription v-if="description || $slots.default" class="app-alert-description">
        <slot>{{ description }}</slot>
      </AlertDescription>

      <div v-if="$slots.actions" class="app-alert-actions">
        <slot name="actions" />
      </div>

      <button
        v-if="closable"
        type="button"
        class="app-alert-close"
        :aria-label="closeLabel"
        @click="emit('close', $event)"
      >
        <AppIcon name="close" />
      </button>
    </div>
  </AlertRoot>
</template>
