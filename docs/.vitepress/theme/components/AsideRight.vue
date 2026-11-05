<template>
  <div class="sticky top-(--header-height) flex h-[calc(100vh-var(--header-height))] flex-col px-3.5 py-6">
    <template v-if="links.length">
      <div class="side-title">On this page</div>

      <!-- only the headings scroll, so the links below stay in view -->
      <ScrollArea ref="toc" as="nav" fade="y" :fade-size="24" class="min-h-0 shrink outline-none scrollbar-thumb-current/10 scrollbar-thin">
        <a
          v-for="header in links"
          :key="header.slug"
          :href="header.link"
          class="side-link truncate"
          :data-nested="header.level > 2 || undefined"
          :data-active="header.link === activeLink || undefined"
          :style="{ paddingLeft: `${16 + (header.level - 2) * 16}px` }"
        >
          {{ header.title }}
        </a>
      </ScrollArea>
    </template>

    <!-- the page as an assistant reads it: written out by `llms.ts` -->
    <div class="shrink-0" :class="{ 'pt-6': links.length }">
      <div class="side-title">For AI assistants</div>
      <div class="flex flex-col">
        <button type="button" class="side-link text-left" @pointerenter="load" @focus="load" @click="copyPage">
          {{ copied ? 'Copied' : 'Copy as Markdown' }}
        </button>
        <a :href="markdownUrl" target="_blank" class="side-link">View as Markdown</a>
        <a :href="withBase('/llms.txt')" target="_blank" class="side-link">llms.txt</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ScrollArea, useClipboard } from '@vunset/vue';
import { onContentUpdated, useData, withBase, type Header } from 'vitepress';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

const { page } = useData();

const markdownUrl = computed(() => withBase(`/${page.value.relativePath}`));
const { copy, copied } = useClipboard();

// fetched on hover or focus, so the click still counts as one for the clipboard (Safari)
let markdown: Promise<string> | null = null;
let loadedFor = '';

function load() {
  if (markdown && loadedFor === markdownUrl.value) return markdown;
  loadedFor = markdownUrl.value;
  markdown = fetch(loadedFor).then((response) => (response.ok ? response.text() : ''));
  return markdown;
}

async function copyPage() {
  copy(await load());
}

const activeLink = ref('');
const toc = ref<InstanceType<typeof ScrollArea> | null>(null);

// keep the active heading inside the list's own scroll, without moving the page
watch(activeLink, (link) => {
  const list = toc.value?.viewport;
  const item = link && list?.querySelector<HTMLElement>(`a[href="${CSS.escape(link)}"]`);
  if (!list || !item) return;
  const top = item.offsetTop - list.offsetTop;
  if (top < list.scrollTop) list.scrollTop = top - item.offsetHeight;
  else if (top + item.offsetHeight > list.scrollTop + list.clientHeight) {
    list.scrollTop = top + item.offsetHeight * 2 - list.clientHeight;
  }
});

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
