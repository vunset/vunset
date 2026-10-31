<template>
  <div class="sticky top-(--header-height) h-[calc(100vh-var(--header-height))]">
    <ScrollArea v-if="links.length" fade="y" class="pl-2 pr-6 py-8 outline-none">
      <div class="side-title">On this page</div>

      <nav class="flex flex-col">
        <a
          v-for="header in links"
          :key="header.slug"
          :href="header.link"
          class="side-link truncate"
          :data-active="header.link === activeLink || undefined"
          :style="{ paddingLeft: `${14 + (header.level - 2) * 14}px` }"
        >
          {{ header.title }}
        </a>
      </nav>
    </ScrollArea>
  </div>
</template>

<script setup lang="ts">
import { ScrollArea } from '@vunset/vue';
import { onContentUpdated, useData, type Header } from 'vitepress';
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';

const { page } = useData();

const activeLink = ref('');

function flatten(headers: Header[], acc: Header[] = []) {
  for (const header of headers) {
    acc.push(header);
    if (header.children?.length) flatten(header.children, acc);
  }

  return acc;
}

const links = computed(() => flatten(page.value.headers));

function setActive() {
  const scrollOffset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--scroll-offset')) || 0;
  const offset = window.scrollY + scrollOffset + 4;
  let current = '';

  for (const header of links.value) {
    const el = document.getElementById(header.slug);
    // a heading in a closed API part has no box to measure
    if (!el?.getClientRects().length) continue;
    const top = el.getBoundingClientRect().top + window.scrollY;
    if (top > offset) break;
    current = header.link;
  }

  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1;

  if (atBottom && links.value.length) {
    current = links.value[links.value.length - 1].link;
  }

  activeLink.value = current;
}

onContentUpdated(() => nextTick(setActive));

onMounted(() => {
  setActive();
  window.addEventListener('scroll', setActive, { passive: true });
});

onUnmounted(() => window.removeEventListener('scroll', setActive));
</script>
