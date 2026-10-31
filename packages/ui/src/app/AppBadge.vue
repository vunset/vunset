<script lang="ts">
export type AppBadgeVariant = 'solid' | 'soft' | 'outline';
export type AppBadgeSize = 'sm' | 'md' | 'lg';
</script>

<script setup lang="ts">
import { Badge } from '@vunset/vue';
import type { AppTone } from './AppButton.vue';

defineOptions({ name: 'AppBadge' });

withDefaults(
  defineProps<{
    /** `solid`, `soft` or `outline`. */
    variant?: AppBadgeVariant;
    /** `neutral`, `accent`, `success`, `warning` or `danger`, as on a button. */
    tone?: AppTone;
    /** `sm`, `md` or `lg`. */
    size?: AppBadgeSize;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { variant: 'soft', tone: 'neutral', size: 'md', as: 'span' }
);
</script>

<template>
  <Badge class="app-badge" :data-variant="variant" :data-tone="tone" :data-size="size" :as="as">
    <slot />
  </Badge>
</template>
