<template>
  <nav v-if="neighbors.prev || neighbors.next" aria-label="Pages" class="mt-12 grid grid-cols-2 gap-3">
    <a
      v-if="neighbors.prev"
      :href="neighbors.prev.link"
      class="flex flex-col gap-1 rounded-2xl border border-edge-subtle p-4 duration-150 hover:border-accent/40 hover:bg-canvas-subtle"
    >
      <span class="text-xs text-muted">← Previous</span>
      <span class="page-nav-title font-medium text-surface" v-html="label(neighbors.prev.text)" />
    </a>

    <a
      v-if="neighbors.next"
      :href="neighbors.next.link"
      class="col-start-2 flex flex-col items-end gap-1 rounded-2xl border border-edge-subtle p-4 text-right duration-150 hover:border-accent/40 hover:bg-canvas-subtle"
    >
      <span class="text-xs text-muted">Next →</span>
      <span class="page-nav-title font-medium text-surface" v-html="label(neighbors.next.text)" />
    </a>
  </nav>
</template>

<script setup lang="ts">
import { formatText, useSidebar } from '../sidebar';

const { neighbors, route } = useSidebar();

const label = (text: string) => (route.path.startsWith('/ui/') ? formatText(text) : text);
</script>

<style>
@reference '../style.css';

.page-nav-title > span {
  @apply opacity-40;
}
</style>
