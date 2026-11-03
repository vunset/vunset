<script lang="ts">
import { defineAsyncComponent, type Component } from 'vue';

const demos = import.meta.glob<Component>(['../../demos/**/*.vue', '!../../demos/home/*.vue'], { import: 'default' });

const COLLAPSE_AFTER = 10;
</script>

<script setup lang="ts">
import { computed, provide, ref } from 'vue';
import { PREVIEW_OUTPUT } from '../preview-output';
import Frame from './Frame.vue';
import CodeTabs from './CodeTabs.vue';

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

const tabs = computed(() =>
  props.files.map((file, index) => ({
    value: `file-${index}`,
    label: index === 0 && file.endsWith('.vue') ? 'index.vue' : file,
    long: (props.lines[index] ?? 0) > COLLAPSE_AFTER
  }))
);

const output = ref<HTMLElement | null>(null);
const outputs = ref(0);
provide(PREVIEW_OUTPUT, {
  target: output,
  register() {
    outputs.value += 1;
    return () => (outputs.value -= 1);
  }
});
</script>

<template>
  <Frame>
    <div class="card pattern-grid relative grid grid-cols-[minmax(0,1fr)] place-items-center px-2 py-14">
      <div class="absolute top-2 left-3 pointer-events-none text-[10px]/none uppercase text-current/20">Preview</div>

      <slot>
        <component :is="demo" v-if="demo" />
      </slot>

      <output
        v-show="outputs > 0"
        ref="output"
        class="absolute left-3 bottom-2 flex flex-wrap gap-x-4 gap-y-1 text-xs/none text-current/20 hover:text-current duration-150"
      />
    </div>

    <CodeTabs :tabs="tabs">
      <template v-for="tab in tabs" :key="tab.value" #[tab.value]>
        <slot :name="tab.value" />
      </template>
    </CodeTabs>
  </Frame>
</template>
