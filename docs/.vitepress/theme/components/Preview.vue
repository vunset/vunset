<script lang="ts">
import { defineAsyncComponent, type Component } from 'vue';

const demos = import.meta.glob<Component>(['../../demos/**/*.vue', '!../../demos/home/*.vue'], { import: 'default' });

const COLLAPSE_AFTER = 10;
</script>

<script setup lang="ts">
import { computed } from 'vue';
import Frame from './Frame.vue';
import Stage from './Stage.vue';
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
</script>

<template>
  <Frame>
    <Stage>
      <slot>
        <component :is="demo" v-if="demo" />
      </slot>
    </Stage>

    <CodeTabs :tabs="tabs">
      <template v-for="tab in tabs" :key="tab.value" #[tab.value]>
        <slot :name="tab.value" />
      </template>
    </CodeTabs>
  </Frame>
</template>
