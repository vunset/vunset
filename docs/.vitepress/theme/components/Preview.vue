<script lang="ts">
import { defineAsyncComponent, ref, type Component, watch } from 'vue';
import { ToggleGroup, Toggle } from '@vunset/vue';

const demos = import.meta.glob<Component>('../../demos/**/*.vue', { import: 'default' });

const COLLAPSE_AFTER = 10;

// One scheme for every preview: their popups share `#teleports`, which can only follow <html>.
const theme = ref<'light' | 'dark' | null>(null);

watch(theme, (value) => {
  if (value) document.documentElement.dataset.demoScheme = value;
  else delete document.documentElement.dataset.demoScheme;
});
</script>

<script setup lang="ts">
import { computed, inject, provide } from 'vue';
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
      :class="[
        inCard ? 'py-10 ' : 'py-14 m-3 ',
        theme && 'bg-(--demo-color-backdrop)',
        { 'scheme-dark text-white': theme === 'dark', 'scheme-light text-black': theme === 'light' }
      ]"
    >
      <div
        v-if="!inCard"
        class="uppercase absolute top-3 left-3 pointer-events-none font-mono text-[11px]/none text-current/40 tracking-wider"
      >
        Preview
      </div>

      <ToggleGroup
        v-model="theme"
        class="absolute p-0.5 rounded-2xl bg-canvas border-edge border top-2 right-2 flex flex-col shadow-lg"
      >
        <Toggle
          as="svg"
          value="light"
          class="size-5 p-0.5 text-surface/50 hover:text-surface duration-150 rounded-full data-pressed:text-accent data-pressed:bg-current/5 outline-none"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M11.9982 3.29071V1.76746M5.83985 18.1585L4.76275 19.2356M11.9982 22.2326V20.7093M19.2334 4.76456L18.1562 5.84166M20.707 12H22.2303M18.1562 18.1584L19.2334 19.2355M1.76562 12H3.28888M4.76267 4.7645L5.83977 5.8416M15.7104 8.28769C17.7606 10.3379 17.7606 13.6621 15.7104 15.7123C13.6601 17.7626 10.336 17.7626 8.28574 15.7123C6.23548 13.6621 6.23548 10.3379 8.28574 8.28769C10.336 6.23744 13.6601 6.23744 15.7104 8.28769Z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </Toggle>

        <Toggle
          as="svg"
          value="dark"
          class="size-5 p-0.5 text-surface/50 hover:text-surface duration-150 rounded-full data-pressed:text-accent data-pressed:bg-current/5 outline-none"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M21.2481 11.8112C20.1889 12.5601 18.8958 13.0001 17.5 13.0001C13.9101 13.0001 11 10.0899 11 6.50006C11 5.10422 11.44 3.81114 12.1888 2.75195C12.126 2.75069 12.0631 2.75006 12 2.75006C6.89137 2.75006 2.75 6.89143 2.75 12.0001C2.75 17.1087 6.89137 21.2501 12 21.2501C17.1086 21.2501 21.25 17.1087 21.25 12.0001C21.25 11.937 21.2494 11.874 21.2481 11.8112Z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </Toggle>
      </ToggleGroup>

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
