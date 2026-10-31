<script lang="ts">
export type AppButtonVariant = 'ghost' | 'soft' | 'outline' | 'solid';
/** A color role, shared by every component that takes a `tone`. */
export type AppTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
export type AppButtonSize = 'xs' | 'sm' | 'md' | 'lg';
</script>

<script setup lang="ts">
import { Button } from '@vunset/vue';

// Every other attribute — `href`, `aria-label`, `@click` — lands on the button.
defineOptions({ name: 'AppButton' });

const props = withDefaults(
  defineProps<{
    /** `ghost`, `soft`, `outline` or `solid`. */
    variant?: AppButtonVariant;
    /** `neutral`, `accent`, `success`, `warning` or `danger`. */
    tone?: AppTone;
    /** `xs`, `sm`, `md` (an input's height) or `lg`. */
    size?: AppButtonSize;
    disabled?: boolean;
    /** Draws moving stripes and blocks clicks, but stays focusable and announced as busy. Put an AppSpinner in it for a spinner too. */
    loading?: boolean;
    /** As wide as it is tall, for an icon alone. Give it an `aria-label`. */
    square?: boolean;
    /** Native `type`. The `button` default keeps it from submitting a form. */
    type?: 'button' | 'submit' | 'reset';
    /** Keeps a disabled button focusable, using `aria-disabled` instead of `disabled`. */
    focusableWhenDisabled?: boolean;
    /** Element or component to render: `a`, a router link. */
    as?: string | object;
  }>(),
  { variant: 'ghost', tone: 'neutral', size: 'md', type: 'button', as: 'button' }
);
</script>

<template>
  <Button
    class="app-button"
    :data-variant="variant"
    :data-tone="tone"
    :data-size="size"
    :type="type"
    :as="as"
    :disabled="disabled || loading"
    :focusable-when-disabled="focusableWhenDisabled || loading"
    :aria-busy="loading || undefined"
    :data-loading="loading || undefined"
    :data-square="square || undefined"
  >
    <slot />
  </Button>
</template>
