<script lang="ts">
import type { InjectionKey } from 'vue';

/** Provided by a card: a preview inside drops its own backdrop for the card's. */
export const IN_CARD: InjectionKey<boolean> = Symbol('in-card');
</script>

<script setup lang="ts">
import { provide } from 'vue';

provide(IN_CARD, true);
</script>

<!-- Markdown in a green card -->
<template>
  <div class="section-card flow-root space-y-2 rounded-[22px] bg-stage pattern-grid p-2">
    <slot />
  </div>
</template>

<style>
@reference '../style.css';

.section-card {
  & > :is(p, ul, ol, h3, h4) {
    @apply mx-2.5;
  }

  & > p {
    @apply text-sm/relaxed;
  }

  & > h3:first-child {
    @apply mb-1 text-xl;
  }

  & > [class*='language-'] {
    @apply inset-card;
  }

  & > :is([class*='language-'], .article-table) {
    @apply mx-1;
  }

  & > :first-child:is([class*='language-'], .article-table) {
    @apply mt-1;
  }

  & > :last-child:is([class*='language-'], .article-table) {
    @apply mb-1;
  }
}
</style>
