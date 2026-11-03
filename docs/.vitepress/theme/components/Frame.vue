<script lang="ts">
import type { InjectionKey } from 'vue';

/** Provided inside a window: what sits there drops its own and shows as bare cards. */
export const FRAMED: InjectionKey<boolean> = Symbol('framed');
</script>

<script setup lang="ts">
import { inject, provide } from 'vue';

const framed = inject(FRAMED, false);
provide(FRAMED, true);
</script>

<template>
  <slot v-if="framed" />
  <div v-else class="window"><slot /></div>
</template>
