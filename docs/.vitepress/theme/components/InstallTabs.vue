<script lang="ts">
import { ref } from 'vue';

const MANAGERS = ['npm', 'pnpm', 'yarn', 'bun'] as const;
type Manager = (typeof MANAGERS)[number];

const KEY = 'vunset-package-manager';

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

function choose(value: Manager) {
  manager.value = value;
  try {
    localStorage.setItem(KEY, value);
  } catch {
    // storage blocked: the choice lasts for this visit
  }
}
</script>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { TabsIndicator, TabsList, TabsPanel, TabsRoot, TabsTab } from '@vunset/vue';

// Read after hydration, so the server's npm and the client's first render agree.
onMounted(restore);

const selected = computed({ get: () => manager.value, set: choose });
</script>

<template>
  <TabsRoot v-model="selected" class="install-tabs inset-card border border-edge flow-root overflow-clip">
    <TabsList aria-label="Package manager" class="relative isolate flex gap-1 m-2 mb-0">
      <TabsTab
        v-for="name in MANAGERS"
        :key="name"
        :value="name"
        class="px-3 py-1.5 rounded-full font-mono text-xs text-muted duration-150 hover:text-surface data-selected:text-surface"
      >
        {{ name }}
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

    <TabsPanel v-for="name in MANAGERS" :key="name" :value="name" keep-mounted>
      <slot :name="name" />
    </TabsPanel>
  </TabsRoot>
</template>
