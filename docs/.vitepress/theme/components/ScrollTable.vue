<script setup lang="ts">
import { ScrollArea } from '@vunset/vue';
import Frame from './Frame.vue';
</script>

<template>
  <Frame>
    <ScrollArea axis="x" fade="x" class="article-table card overflow-clip">
      <slot />
    </ScrollArea>
  </Frame>
</template>

<style>
@reference '../style.css';

.article-table {
  table {
    @apply w-full text-sm;
  }

  th {
    @apply px-4 py-2.5 text-left text-xs font-medium uppercase text-docs-text/50 border-b border-docs-bg;

    &:nth-child(4) {
      @apply min-w-60;
    }
  }

  tbody tr:not(:last-child) {
    @apply border-b border-docs-bg;
  }

  td {
    @apply px-4 py-2.5 text-current/80;

    kbd {
      @apply whitespace-nowrap;
    }

    div {
      @apply mt-1.5 text-xs text-docs-text/50;
    }
  }
}
</style>
