<template>
  <nav v-if="neighbors.prev || neighbors.next" aria-label="Pages" class="mt-6 grid grid-cols-2 gap-3.5">
    <a
      v-if="neighbors.prev"
      :href="withBase(neighbors.prev.link)"
      rel="prev"
      class="pill rounded-xl flex items-center justify-between gap-3 p-3.5 duration-150 hover:border-docs-text/20"
    >
      <span class="text-xs text-docs-text/50" aria-hidden="true">←</span>
      <span class="sr-only">Previous:</span>
      <span class="page-nav-title truncate" v-html="label(neighbors.prev.text)" />
      <span class="w-3" />
    </a>

    <a
      v-if="neighbors.next"
      :href="withBase(neighbors.next.link)"
      rel="next"
      class="pill rounded-xl col-start-2 flex items-center justify-between gap-3 p-3.5 duration-150 hover:border-docs-text/20"
    >
      <span class="w-3" />
      <span class="sr-only">Next:</span>
      <span class="page-nav-title truncate" v-html="label(neighbors.next.text)" />
      <span class="text-xs text-docs-text/50" aria-hidden="true">→</span>
    </a>
  </nav>
</template>

<script setup lang="ts">
import { withBase } from 'vitepress';
import { formatText, useSidebar } from '../sidebar';

const { neighbors, path } = useSidebar();

const label = (text: string) => (path.value.startsWith('/ui/') ? formatText(text) : text);
</script>

<style>
@reference '../style.css';

.page-nav-title > span {
  @apply opacity-40;
}
</style>
