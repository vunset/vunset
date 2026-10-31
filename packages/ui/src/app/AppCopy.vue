<script setup lang="ts">
import { ref } from 'vue';
import { Copy } from '@vunset/vue';
import AppButton, { type AppButtonSize, type AppButtonVariant, type AppTone } from './AppButton.vue';
import AppIcon from './AppIcon.vue';

defineOptions({ name: 'AppCopy' });

withDefaults(
  defineProps<{
    /** The text to copy. */
    value: string;
    /** Text beside the icon. Without it, or content of your own, it's a square button named "Copy". */
    label?: string;
    /** How long, in milliseconds, it shows it copied before settling back. */
    timeout?: number;
    disabled?: boolean;
    /** The button's look, as an [AppButton](/ui/app-button)'s. */
    variant?: AppButtonVariant;
    tone?: AppTone;
    size?: AppButtonSize;
  }>(),
  { variant: 'ghost', tone: 'neutral' }
);

const emit = defineEmits<{
  /** After each press, with whether the text reached the clipboard. */
  copy: [success: boolean];
}>();

defineSlots<{
  /** Content beside the icon, in place of `label`. */
  default?(props: { copied: boolean }): unknown;
}>();

const armed = ref(false);
</script>

<template>
  <Copy
    :value="value"
    :label="label"
    :timeout="timeout"
    :disabled="disabled"
    :as="AppButton"
    :variant="variant"
    :tone="tone"
    :size="size"
    :square="!label && !$slots.default"
    class="app-copy"
    @copy="emit('copy', $event)"
    @pointerenter="armed = true"
    @focus="armed = true"
  >
    <template #icon="{ copied }">
      <AppIcon name="copy" class="app-copy-icon" :data-active="!copied || undefined" />
      <AppIcon v-if="armed || copied" name="copy-done" class="app-copy-icon" :data-active="copied || undefined" />
    </template>

    <template v-if="$slots.default || label" #default="{ copied }">
      <slot :copied="copied">{{ label }}</slot>
    </template>
  </Copy>
</template>
