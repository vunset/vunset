<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, provide, ref, watch } from 'vue';
import { TabsList, TabsPanel, TabsRoot, TabsTab } from '@vunset/vue';
import { FRAMED } from './Frame.vue';

// no items: one example, its cards stacked in the window
const props = defineProps<{ items?: string[] }>();

provide(FRAMED, true);

const selected = ref(0);
const root = ref<HTMLElement>();
let toHeading = false;

function follow() {
  const id = decodeURIComponent(location.hash.slice(1));
  const panel = id && document.getElementById(id)?.closest<HTMLElement>('[data-example]');
  if (!panel || !root.value?.contains(panel)) return;
  const index = Number(panel.dataset.example);
  if (selected.value === index) return;
  toHeading = true;
  selected.value = index;
}

watch(selected, async (index) => {
  const heading = root.value?.querySelector<HTMLElement>(`[data-example="${index}"] h3[id]`);
  if (heading && location.hash !== `#${heading.id}`) history.replaceState(history.state, '', `#${heading.id}`);

  const linked = toHeading;
  toHeading = false;

  await nextTick();
  const tab = root.value?.querySelector<HTMLElement>('[role="tab"][data-selected]');

  requestAnimationFrame(() => {
    if (!heading?.offsetHeight) return;
    const list = tab?.closest<HTMLElement>('[role="tablist"]');
    let sticky = false;
    for (let el = list?.parentElement; el && el !== root.value; el = el.parentElement) {
      if (getComputedStyle(el).position === 'sticky') sticky = true;
    }
    (sticky || linked || !list ? heading : list).scrollIntoView({ block: 'start', behavior: 'instant' });
  });

  tab?.parentElement?.scrollTo({ left: tab.offsetLeft - 8, behavior: 'smooth' });
});

onMounted(() => {
  if (!props.items) return;
  follow();
  window.addEventListener('hashchange', follow);
});

onUnmounted(() => window.removeEventListener('hashchange', follow));
</script>

<template>
  <section v-if="items" ref="root" class="examples @container">
    <TabsRoot v-model="selected" orientation="vertical" class="window items-stretch @2xl:flex-row">
      <div class="card flex flex-col gap-2.5 min-w-0 p-3 @2xl:w-48 @2xl:shrink-0">
        <div class="examples-title"><slot name="title" /></div>
        <div v-if="$slots.lead" class="examples-lead"><slot name="lead" /></div>

        <TabsList class="flex @2xl:flex-col gap-0.5 overflow-x-auto @2xl:sticky @2xl:top-16">
          <TabsTab
            v-for="(label, index) in items"
            :key="index"
            :value="index"
            class="shrink-0 px-3.5 py-1.75 rounded-full text-left text-sm/snug text-docs-text/70 duration-150 hover:text-docs-text data-selected:bg-docs-bg data-selected:text-docs-text"
          >
            <span class="block truncate">{{ label }}</span>
          </TabsTab>
        </TabsList>
      </div>

      <TabsPanel
        v-for="(_, index) in items"
        :key="index"
        :value="index"
        :data-example="index"
        keep-mounted
        class="examples-panel flex flex-col gap-1.5 flex-1 min-w-0"
      >
        <slot :name="`example-${index}`" />
      </TabsPanel>
    </TabsRoot>
  </section>

  <div v-else class="examples examples-panel window"><slot /></div>
</template>

<style>
@reference '../style.css';

.examples-title > h2 {
  @apply m-0 text-base font-normal;
}

.examples-lead p {
  @apply m-0 text-sm text-docs-text/50;
}

/* an example's text between its preview and code, one card per run */
.examples-panel .example-text {
  @apply card flex flex-col gap-2 p-3 text-sm/[1.4];

  & > * {
    @apply m-0;
  }

  & > h3 {
    @apply text-base;
  }

  /* a table or code inside sits a step deeper */
  & > * {
    --color-docs-surface: var(--color-docs-bg);
  }

  & > :is(p, ul, ol) + :is(p, ul, ol) {
    @apply mt-3;
  }
}

.examples-panel > [class*='language-'] {
  @apply card;
}
</style>
