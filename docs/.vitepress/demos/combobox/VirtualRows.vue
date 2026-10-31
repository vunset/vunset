<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useVirtualizer } from '@tanstack/vue-virtual';
import { ComboboxItem, type RenderedOption } from '@vunset/vue';

const props = withDefaults(defineProps<{ options?: RenderedOption[]; activeIndex?: number }>(), {
  options: () => [],
  activeIndex: -1
});

const rows = ref<HTMLElement | null>(null);

const virtualizer = useVirtualizer(
  computed(() => ({
    count: props.options.length,
    // the list scrolls; these rows sit inside it
    getScrollElement: () => rows.value?.parentElement ?? null,
    // every row is 2rem tall (combobox.css), so the estimate is exact
    estimateSize: () => 32,
    overscan: 8
  }))
);

// The keys reach rows TanStack hasn't rendered: bring the highlighted one on screen.
watch(
  () => props.activeIndex,
  (index) => {
    if (index >= 0) virtualizer.value.scrollToIndex(index);
  }
);
</script>

<template>
  <div ref="rows" class="demo-combobox-virtual" :style="{ height: `${virtualizer.getTotalSize()}px` }">
    <ComboboxItem
      v-for="row in virtualizer.getVirtualItems()"
      :key="String(row.key)"
      :option="options[row.index]!"
      class="demo-combobox-virtual-row"
      :style="{ transform: `translateY(${row.start}px)` }"
    />
  </div>
</template>
