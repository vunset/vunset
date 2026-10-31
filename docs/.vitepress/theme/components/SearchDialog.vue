<script setup lang="ts">
import { computed, markRaw, onMounted, onUnmounted, ref, shallowRef } from 'vue';
import { useData, useRouter, withBase } from 'vitepress';
import MiniSearch, { type SearchResult } from 'minisearch';
import searchIndex from '@localSearchIndex';
import {
  ComboboxEmpty,
  ComboboxInput,
  ComboboxList,
  ComboboxRoot,
  DialogBackdrop,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  Popup,
  Portal,
  type ListboxGroup
} from '@vunset/vue';

const LIMIT = 20;
const SNIPPET_BEFORE = 40;
const SNIPPET_LENGTH = 140;

const { localeIndex } = useData();
const router = useRouter();

const open = ref(false);
const query = ref('');
const index = shallowRef<MiniSearch | null>(null);

// fetched on first open: the page doesn't pay for it until someone searches
async function load() {
  if (index.value) return;
  const json = (await (searchIndex[localeIndex.value] ?? searchIndex.root)?.())?.default;
  if (!json) return;
  index.value = markRaw(
    MiniSearch.loadJSON(json, {
      fields: ['title', 'titles', 'text'],
      storeFields: ['title', 'titles', 'text'],
      searchOptions: { fuzzy: 0.2, prefix: true, boost: { title: 4, text: 2, titles: 1 } }
    })
  );
}

interface Part {
  text: string;
  match: boolean;
}

// the index holds text from rendered HTML, entities and all (`&quot;`)
let decoder: HTMLTextAreaElement | undefined;
function decode(html: string) {
  decoder ??= document.createElement('textarea');
  decoder.innerHTML = html;
  return decoder.value;
}

// a window of the section's text around the first match, the matches marked
function snippet(html: string, terms: string[]): Part[] {
  const text = decode(html);
  const pattern = new RegExp(`(${terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const first = text.search(pattern);
  const start = Math.max(0, first - SNIPPET_BEFORE);
  const window =
    (start > 0 ? '…' : '') +
    text.slice(start, start + SNIPPET_LENGTH).trim() +
    (text.length > start + SNIPPET_LENGTH ? '…' : '');
  return window
    .split(pattern)
    .filter(Boolean)
    .map((part) => ({ text: part, match: terms.some((term) => term.toLowerCase() === part.toLowerCase()) }));
}

// grouped by page, in the order of each page's best result
const results = computed<ListboxGroup[]>(() => {
  const q = query.value.trim();
  if (!index.value || !q) return [];

  const groups = new Map<string, ListboxGroup>();
  for (const result of index.value.search(q).slice(0, LIMIT) as (SearchResult & {
    title: string;
    titles: string[];
    text: string;
  })[]) {
    const page = result.titles[0] ?? result.title;
    const group = groups.get(page) ?? { label: page, options: [] };
    groups.set(page, group);
    group.options.push({
      value: result.id,
      label: [...result.titles.slice(1), result.title].join(' › ') || result.title,
      snippet: snippet(result.text ?? '', result.terms)
    });
  }
  return [...groups.values()];
});

function go(id: unknown) {
  if (typeof id !== 'string') return;
  open.value = false;
  router.go(withBase(id));
}

function onOpen(value: boolean) {
  open.value = value;
  if (value) {
    query.value = '';
    load();
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && open.value) return onOpen(false);

  const target = event.target as HTMLElement | null;
  const typing = target?.closest('input, textarea, select, [contenteditable="true"]');
  const shortcut = (event.key === 'k' && (event.metaKey || event.ctrlKey)) || (event.key === '/' && !typing);
  if (!shortcut || open.value) return;
  event.preventDefault();
  onOpen(true);
}

onMounted(() => window.addEventListener('keydown', onKeydown, true));
onUnmounted(() => window.removeEventListener('keydown', onKeydown, true));
</script>

<template>
  <DialogRoot :open="open" outside-press @update:open="onOpen">
    <DialogTrigger
      class="flex items-center gap-2 h-8 px-3 max-md:px-2 rounded-full hover:bg-chip text-muted duration-150 hover:text-surface"
      aria-label="Search"
    >
      <svg class="size-4 md:hidden" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="7" cy="7" r="4.5" />
        <path d="m10.5 10.5 3.5 3.5" />
      </svg>
      <span class="max-md:hidden">Search</span>
      <kbd class="bg-transparent p-0 opacity-50 max-md:hidden">⌘K</kbd>
    </DialogTrigger>

    <Portal>
      <DialogBackdrop class="search-backdrop fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />

      <Popup
        class="search-dialog fixed z-50 left-1/2 top-[12vh] -translate-x-1/2 w-[min(640px,calc(100vw-2rem))] flex flex-col max-h-[70vh] rounded-[20px] border border-edge bg-canvas-subtle text-surface shadow-[0_20px_60px_rgb(0_0_0/0.5)] overflow-hidden outline-none"
      >
        <DialogTitle class="sr-only">Search the docs</DialogTitle>

        <ComboboxRoot
          :options="results"
          :filter="() => true"
          class="flex flex-col min-h-0"
          :open="query.trim() !== ''"
          @update:model-value="go"
        >
          <ComboboxInput
            aria-label="Search the docs"
            placeholder="Search the docs…"
            autocomplete="off"
            class="w-full px-5 py-4 bg-transparent border-b border-edge text-base outline-none placeholder:text-muted"
            @input="query = ($event.target as HTMLInputElement).value"
          />

          <Popup class="search-results flex flex-col flex-1 min-h-0 outline-none">
            <ComboboxList class="min-h-0 overflow-y-auto not-empty:p-2">
              <template #group="{ section }">
                <span class="block px-3 pt-3 pb-1 font-mono text-[11px] uppercase tracking-wider text-muted">
                  {{ section.label }}
                </span>
              </template>

              <template #option="{ label, option }">
                <span class="block text-sm text-surface">{{ label }}</span>

                <span class="block mt-0.5 text-xs/relaxed text-muted line-clamp-2">
                  <template v-for="(part, i) in option.snippet as Part[]" :key="i">
                    <mark v-if="part.match" class="bg-transparent text-accent">{{ part.text }}</mark>
                    <template v-else>{{ part.text }}</template>
                  </template>
                </span>
              </template>
            </ComboboxList>

            <ComboboxEmpty class="px-3 py-6 text-center text-sm text-muted">
              {{ query ? `No results for: ${query}` : 'Components, props, keys, examples: type to search every page.' }}
            </ComboboxEmpty>
          </Popup>
        </ComboboxRoot>
      </Popup>
    </Portal>
  </DialogRoot>
</template>

<style>
@reference '../style.css';

.search-results [role='option'] {
  @apply px-3 py-2 rounded-xl cursor-pointer;

  &[data-active] {
    @apply bg-stage;
  }
}

.search-backdrop,
.search-dialog {
  transition: opacity 150ms ease;

  &[data-enter-from],
  &[data-leave-to] {
    opacity: 0;
  }
}
</style>
