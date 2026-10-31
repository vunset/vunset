<script setup lang="ts">
import { computed, ref } from 'vue';
import { TabsIndicator, TabsList, TabsPanel, TabsRoot, TabsTab, ScrollArea } from '@vunset/vue';
import SwitchTailwind from '../../demos/home/SwitchTailwind.vue';
import SwitchCss from '../../demos/home/SwitchCss.vue';
import SwitchUi from '../../demos/home/SwitchUi.vue';

const kind = ref<'headless' | 'ui'>('headless');
const styling = ref<'tailwind' | 'css'>('tailwind');

const demo = computed(() => (kind.value === 'ui' ? SwitchUi : styling.value === 'css' ? SwitchCss : SwitchTailwind));

const indicator = {
  width: 'var(--active-tab-width)',
  height: 'var(--active-tab-height)',
  left: 'var(--active-tab-left)',
  top: 'var(--active-tab-top)'
};
</script>

<template>
  <div
    class="rounded-[28px] grid grid-cols-1 md:grid-cols-[2fr_1fr] border-edge-subtle/60 backdrop-blur-lg bg-canvas/60 border p-px"
  >
    <TabsRoot v-model="kind" class="home-example-code flow-root overflow-clip">
      <TabsList aria-label="Package" class="relative isolate m-2 mb-0 flex gap-1">
        <TabsTab
          v-for="tab in ['headless', 'ui']"
          :key="tab"
          :value="tab"
          class="rounded-full px-3 py-1.5 text-xs font-medium text-muted duration-150 hover:text-surface data-selected:text-surface"
        >
          {{ tab === 'ui' ? 'Pre-styled' : 'Headless' }}
          <span class="ml-1 font-mono font-normal text-muted">@vunset/{{ tab === 'ui' ? 'ui' : 'vue' }}</span>
        </TabsTab>

        <TabsIndicator
          class="absolute -z-1 rounded-full bg-chip duration-150 transition-[left,top]"
          :style="indicator"
        />
      </TabsList>

      <TabsPanel value="headless">
        <TabsRoot v-model="styling" class="relative">
          <TabsPanel value="tailwind">
            <ScrollArea fade="y" class="h-80 overflow-auto scrollbar-thin scrollbar-thumb-white/15">
              <slot name="tailwind" />
            </ScrollArea>
          </TabsPanel>

          <TabsPanel value="css">
            <ScrollArea fade="y" class="h-80 overflow-auto scrollbar-thin scrollbar-thumb-white/15">
              <slot name="css" />
            </ScrollArea>
          </TabsPanel>

          <TabsList
            aria-label="Styling"
            class="overflow-hidden absolute bottom-3 right-3 isolate flex gap-0.5 rounded-full border border-edge-subtle bg-canvas-subtle p-0.5"
          >
            <TabsTab
              v-for="tab in ['tailwind', 'css']"
              :key="tab"
              :value="tab"
              class="rounded-full px-3 py-1 text-xs text-muted duration-150 hover:text-surface data-selected:text-surface"
            >
              {{ tab === 'css' ? 'CSS' : 'Tailwind' }}
            </TabsTab>

            <TabsIndicator
              class="absolute -z-1 rounded-full bg-chip duration-150 transition-[left,top]"
              :style="indicator"
            />
          </TabsList>
        </TabsRoot>
      </TabsPanel>

      <TabsPanel value="ui">
        <ScrollArea fade="y" class="h-80 overflow-auto scrollbar-thin scrollbar-thumb-white/15">
          <slot name="ui" />
        </ScrollArea>
      </TabsPanel>
    </TabsRoot>

    <div
      class="relative m-2 grid max-md:order-first place-items-center rounded-[20px] py-14 text-surface pattern-grid bg-white/5"
    >
      <span
        class="pointer-events-none absolute top-3 left-3 font-mono text-[11px]/none tracking-wider text-current/40 uppercase"
      >
        Preview
      </span>
      <component :is="demo" />
    </div>
  </div>
</template>

<style>
@reference '../style.css';

.home-example-code [class*='language-'] {
  @apply px-5 py-4;
}
</style>
