<script setup lang="ts">
import { computed, provide, ref } from 'vue';
import { ScrollArea, TabsIndicator, TabsList, TabsPanel, TabsRoot, TabsTab } from '@vunset/vue';
import InputTailwind from '../../demos/home/InputTailwind.vue';
import InputCss from '../../demos/home/InputCss.vue';
import InputUi from '../../demos/home/InputUi.vue';
import { FRAMED } from './Frame.vue';
import CodeTabs from './CodeTabs.vue';
import Stage from './Stage.vue';

provide(FRAMED, true);

const TABS = [
  { value: 'headless', label: 'Headless', hint: '@vunset/vue' },
  { value: 'ui', label: 'Pre-styled', hint: '@vunset/ui' }
];

const kind = ref('headless');
const styling = ref<'tailwind' | 'css'>('tailwind');

const demo = computed(() => (kind.value === 'ui' ? InputUi : styling.value === 'css' ? InputCss : InputTailwind));
</script>

<template>
  <div class="window md:flex-row">
    <CodeTabs v-model="kind" :tabs="TABS" label="Package" class="min-w-0 md:flex-1">
      <template #headless>
        <TabsRoot v-model="styling" class="relative">
          <TabsPanel value="tailwind">
            <ScrollArea fade="y" class="h-60 overflow-auto"><slot name="tailwind" /></ScrollArea>
          </TabsPanel>

          <TabsPanel value="css">
            <ScrollArea fade="y" class="h-60 overflow-auto"><slot name="css" /></ScrollArea>
          </TabsPanel>

          <TabsList aria-label="Styling" class="absolute right-2 bottom-2 isolate flex rounded-full bg-docs-bg p-0.5">
            <TabsTab
              v-for="tab in ['tailwind', 'css']"
              :key="tab"
              :value="tab"
              class="rounded-full px-2.5 py-0.75 text-xs/snug text-docs-text/50 duration-150 hover:text-docs-text data-selected:text-docs-text"
            >
              {{ tab === 'css' ? 'CSS' : 'Tailwind' }}
            </TabsTab>

            <TabsIndicator
              class="absolute -z-1 rounded-full bg-docs-border duration-150 transition-[left,top]"
              :style="{
                width: 'var(--active-tab-width)',
                height: 'var(--active-tab-height)',
                left: 'var(--active-tab-left)',
                top: 'var(--active-tab-top)'
              }"
            />
          </TabsList>
        </TabsRoot>
      </template>

      <template #ui>
        <ScrollArea fade="y" class="h-60 overflow-auto"><slot name="ui" /></ScrollArea>
      </template>
    </CodeTabs>

    <Stage class="max-md:order-first md:w-80 md:shrink-0">
      <component :is="demo" />
    </Stage>
  </div>
</template>
