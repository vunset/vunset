<script lang="ts">
import { defineAsyncComponent, type Component } from 'vue';

// The home page's demos are imported by HomeExample itself.
const demos =import.meta.glob<Component>(['../../demos/**/*.vue', '!../../demos/home/*.vue'], { import: 'default' });

const COLLAPSE_AFTER = 10;
</script>

<script setup lang="ts">
import { computed, inject, provide, ref } from 'vue';
import { PREVIEW_OUTPUT } from '../preview-output';
import { TabsIndicator, TabsList, TabsPanel, TabsRoot, TabsTab } from '@vunset/vue';
import { IN_CARD } from './SectionCard.vue';

const props = defineProps<{
  src?: string;
  files: string[];
  lines: number[];
}>();

const demo = computed(() => {
  const load = props.src && demos[`../../demos/${props.src}.vue`];
  if (props.src && !load) console.warn(`[Preview] no demo at docs/.vitepress/demos/${props.src}.vue`);
  return load ? defineAsyncComponent(load) : null;
});

const active = ref(props.files[0]);

const output = ref<HTMLElement | null>(null);
const outputs = ref(0);
provide(PREVIEW_OUTPUT, {
  target: output,
  register() {
    outputs.value += 1;
    return () => (outputs.value -= 1);
  }
});

const inCard = inject(IN_CARD, false);

const expanded = ref(false);
const long = computed(() => (props.lines[props.files.indexOf(active.value)] ?? 0) > COLLAPSE_AFTER);
</script>

<template>
  <div class="p-px" :class="inCard ? '' : 'rounded-[28px] bg-stage pattern-grid pb-3'">
    <div
      class="px-3 grid grid-cols-[minmax(0,1fr)] mb-3 relative rounded-[20px] place-items-center"
      :class="inCard ? 'py-10' : 'py-14 m-3'"
    >
      <div
        v-if="!inCard"
        class="uppercase absolute top-3 left-3 pointer-events-none font-mono text-[11px]/none text-current/40 tracking-wider"
      >
        Preview
      </div>

      <slot>
        <component :is="demo" v-if="demo" />
      </slot>

      <output
        v-show="outputs > 0"
        ref="output"
        class="flex absolute flex-wrap gap-x-4 gap-y-1 left-3 bottom-3 text-current/50 hover:text-current font-mono text-[11px]/none"
      />
    </div>

    <TabsRoot v-model="active" class="inset-card relative flow-root overflow-clip" :class="inCard ? '' : 'mx-3'">
      <TabsList class="relative isolate flex gap-1 m-2 mb-0">
        <TabsTab
          v-for="(file, index) in files"
          :key="file"
          :value="file"
          class="px-3 py-1.5 rounded-full font-mono text-xs text-muted duration-150 hover:text-surface data-selected:text-surface"
        >
          <template v-if="index === 0">
            {{ file.includes('.vue') ? 'index.vue' : file }}
          </template>

          <template v-else>{{ file }}</template>
        </TabsTab>

        <TabsIndicator
          class="absolute bg-chip duration-150 transition-[left,top] -z-1 rounded-full"
          :style="{
            width: 'var(--active-tab-width)',
            height: 'var(--active-tab-height)',
            left: 'var(--active-tab-left)',
            top: 'var(--active-tab-top)'
          }"
        />
      </TabsList>

      <TabsPanel
        v-for="(file, index) in files"
        :key="file"
        :value="file"
        keep-mounted
        class="preview-code"
        :class="long && !expanded && 'max-h-40 overflow-hidden mask-b-from-50%'"
      >
        <slot :name="`file-${index}`" />
      </TabsPanel>

      <div
        v-if="long"
        class="sticky bottom-0 z-1 flex items-center justify-center gap-3 p-2 bg-linear-0 from-canvas-strong"
      >
        <button
          type="button"
          class="rounded-full bg-card px-3.5 py-1 text-sm text-surface/85 duration-150 hover:bg-chip"
          @click="expanded = !expanded"
        >
          {{ expanded ? 'Collapse' : 'Expand' }}
        </button>
      </div>
    </TabsRoot>
  </div>
</template>

<style>
@reference '../style.css';

.preview-code [class*='language-'] {
  @apply px-6 py-4;
}
</style>
