<script setup lang="ts">
import { ScrollArea } from '@vunset/vue';
</script>

<template>
  <ScrollArea axis="x" fade="x" class="article-table inset-card overflow-clip">
    <slot />
  </ScrollArea>
</template>

<style>
@reference '../style.css';

.article-table {
  @apply border border-edge;

  table {
    @apply w-full text-sm;
  }

  th {
    @apply px-4 py-2 text-left font-mono text-[11px] font-normal uppercase tracking-wider text-muted border-b border-edge-strong;

    &:nth-child(4) {
      @apply min-w-60;
    }
  }

  tbody tr:not(:last-child) {
    @apply border-b border-edge-strong;
  }

  td {
    @apply px-4 py-2.5 text-current/80;

    kbd {
      @apply whitespace-nowrap;
    }

    div {
      @apply mt-1.5 text-xs text-muted;
    }
  }
}
</style>
