<script lang="ts">
import { ref } from 'vue';

const MANAGERS = ['npm', 'pnpm', 'yarn', 'bun'] as const;
type Manager = (typeof MANAGERS)[number];

const KEY = 'vunset-package-manager';
const TABS = MANAGERS.map((name) => ({ value: name, label: name }));

// One choice for every install block on the site, remembered across visits.
const manager = ref<Manager>('npm');
let restored = false;

function restore() {
  if (restored) return;
  restored = true;
  try {
    const saved = localStorage.getItem(KEY);
    if (MANAGERS.includes(saved as Manager)) manager.value = saved as Manager;
  } catch {
    // storage blocked: npm it is
  }
}

function choose(value?: string) {
  if (!value) return;
  manager.value = value as Manager;
  try {
    localStorage.setItem(KEY, value);
  } catch {
    // storage blocked: the choice lasts for this visit
  }
}
</script>

<script setup lang="ts">
import { onMounted } from 'vue';
import Frame from './Frame.vue';
import CodeTabs from './CodeTabs.vue';

// Read after hydration, so the server's npm and the client's first render agree.
onMounted(restore);
</script>

<template>
  <Frame>
    <CodeTabs :model-value="manager" :tabs="TABS" label="Package manager" @update:model-value="choose">
      <template v-for="name in MANAGERS" :key="name" #[name]>
        <slot :name="name" />
      </template>
    </CodeTabs>
  </Frame>
</template>
