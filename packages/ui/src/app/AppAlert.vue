<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
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
    /** The icon before the title: a name to draw that icon, `false` to leave it out. Each tone has its own. */
    icon?: boolean | string;
    /** A close button, which emits `close`; the page removes the alert. */
    closable?: boolean;
    /** Names the close button. */
    closeLabel?: string;
    /** Classes for the title. */
    titleClass?: HTMLAttributes['class'];
    /** Classes for the description. */
    descriptionClass?: HTMLAttributes['class'];
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { tone: 'neutral', icon: true, closeLabel: 'Dismiss', as: 'div' }
);

const emit = defineEmits<{
  /** The close button was pressed. */
  close: [event: MouseEvent];
}>();

const ICONS: Record<string, string> = {
  neutral: 'alert-info',
  accent: 'alert-info',
  success: 'alert-success',
  warning: 'alert-warning',
  danger: 'alert-danger'
};
const iconName = computed(() =>
  typeof props.icon === 'string' && props.icon ? props.icon : (ICONS[props.tone] ?? ICONS.neutral!)
);
</script>

<template>
  <AlertRoot class="app-alert" :data-tone="tone" :as="as">
    <span v-if="icon || $slots.icon" class="app-alert-icon" aria-hidden="true">
      <slot name="icon">
        <AppIcon :name="iconName" />
      </slot>
    </span>

    <div class="app-alert-body">
      <AlertTitle v-if="title || $slots.title" class="app-alert-title" :class="titleClass">
        <slot name="title">{{ title }}</slot>
      </AlertTitle>

      <AlertDescription
        v-if="description || $slots.default"
        class="app-alert-description"
        :class="descriptionClass"
      >
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
