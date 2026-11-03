<template>
  <DrawerRoot v-model:open="open" side="left" swipeable>
    <DrawerTrigger
      v-bind="$attrs"
      class="size-8 rounded-full shrink-0 grid hover:bg-docs-border duration-150"
      aria-label="Menu"
    >
      <svg class="size-4 m-auto" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M2 4.5h12M2 8h12M2 11.5h12" />
      </svg>
    </DrawerTrigger>

    <Portal>
      <DrawerBackdrop
        class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm duration-250 data-enter-from:opacity-0 data-leave-to:opacity-0"
      />

      <Popup
        class="fixed z-50 inset-y-0 left-0 w-[min(18rem,85vw)] flex flex-col bg-docs-surface border-r border-docs-border outline-none duration-250 ease-out data-enter-from:-translate-x-full data-leave-to:-translate-x-full"
      >
        <DrawerTitle class="sr-only">Menu</DrawerTitle>

        <nav class="flex flex-wrap gap-1 p-4 border-b border-docs-border">
          <a
            v-for="item in site.themeConfig.nav"
            :key="item.text"
            :href="withBase(item.link)"
            class="px-3 py-1 rounded-full text-sm duration-150"
            :class="section(item.link) === section(path) ? 'bg-docs-border' : 'text-docs-text/50 hover:text-docs-text'"
          >
            {{ item.text }}
          </a>
        </nav>

        <SidebarNav class="flex-1 min-h-0 px-4 py-6" />

        <a
          href="https://www.npmjs.com/package/@vunset/vue"
          target="_blank"
          class="flex items-center gap-2 p-4 border-t border-docs-border text-xs text-docs-text/50 hover:text-docs-text duration-150"
        >
          <svg class="size-3.5" viewBox="0 0 10 10" fill="none">
            <path d="M10 0V10H8V2H5V10H0V0H10Z" fill="currentColor" />
          </svg>
          {{ site.themeConfig.version }}
        </a>
      </Popup>
    </Portal>
  </DrawerRoot>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useData, useRoute, withBase } from 'vitepress';
import { DrawerRoot, DrawerTrigger, DrawerBackdrop, DrawerTitle, Portal, Popup } from '@vunset/vue';
import SidebarNav from './SidebarNav.vue';
import { section, usePagePath } from '../sidebar';

defineOptions({ inheritAttrs: false });

const { site } = useData();
const route = useRoute();
const path = usePagePath();

const open = ref(false);

// A link was followed: the page behind is the one asked for.
watch(() => route.path, () => (open.value = false));
</script>
