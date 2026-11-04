<script setup lang="ts">
import { computed, ref } from 'vue';
import { TabsIndicator, TabsList, TabsPanel, TabsRoot, TabsTab } from '@vunset/vue';

const props = defineProps<{
  tabs: { value: string; label: string; hint?: string; long?: boolean }[];
  label?: string;
}>();

// unbound, the model keeps its own value
const active = defineModel<string>();
const selected = computed<string>({
  get: () => active.value ?? props.tabs[0].value,
  set: (value) => (active.value = value)
});

const expanded = ref(false);
const long = computed(() => props.tabs.find((tab) => tab.value === selected.value)?.long);
</script>

<template>
  <TabsRoot v-model="selected" class="code-tabs card relative flow-root overflow-clip">
    <TabsList :aria-label="label" class="relative isolate flex m-1.5 mb-0">
      <TabsTab
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        class="px-2.5 py-0.75 rounded-full text-xs/snug text-docs-text/50 duration-150 hover:text-docs-text data-selected:text-docs-text"
      >
        {{ tab.label }}
        <span v-if="tab.hint" class="text-docs-text/50">{{ tab.hint }}</span>
      </TabsTab>

      <TabsIndicator
        class="absolute bg-docs-bg duration-150 transition-[left,top] -z-1 rounded-full"
        :style="{
          width: 'var(--active-tab-width)',
          height: 'var(--active-tab-height)',
          left: 'var(--active-tab-left)',
          top: 'var(--active-tab-top)'
        }"
      />
    </TabsList>

    <TabsPanel
      v-for="tab in tabs"
      :key="tab.value"
      :value="tab.value"
      keep-mounted
      :class="long && !expanded && 'max-h-40 overflow-hidden mask-b-from-50%'"
    >
      <slot :name="tab.value" />
    </TabsPanel>

    <div v-if="long" class="sticky bottom-0 z-1 flex justify-center">
      <button
        type="button"
        class="px-3 py-1 rounded-t-xl bg-docs-bg text-xs/snug text-docs-text/70 duration-150 hover:text-docs-text"
        @click="expanded = !expanded"
      >
        {{ expanded ? 'Collapse' : 'Expand' }}
      </button>
    </div>
  </TabsRoot>
</template>

<style>
@reference '../style.css';

.code-tabs [class*='language-'] {
  @apply bg-transparent px-4.5 py-3;
}
</style>
