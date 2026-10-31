<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { TabsList, TabsPanel, TabsRoot, TabsTab } from '@vunset/vue';
import SectionFrame from './SectionFrame.vue';
import SectionCard from './SectionCard.vue';

defineProps<{ items: string[] }>();

const selected = ref(0);
const root = ref<HTMLElement>();
// set by a followed link, which lands on its heading wherever the list is
let toHeading = false;

// a link to an example's heading (the outline, `#addons` from another page)
// selects it, then scrolls to it: VitePress scrolled while it was still hidden
function follow() {
  const id = decodeURIComponent(location.hash.slice(1));
  const panel = id && document.getElementById(id)?.closest<HTMLElement>('[data-example]');
  if (!panel || !root.value?.contains(panel)) return;
  const index = Number(panel.dataset.example);
  if (selected.value === index) return;
  toHeading = true;
  selected.value = index;
}

// the selected example is in the URL, to share; on a narrow page, where the
// list is a row, its tab scrolls into view sideways
watch(selected, async (index) => {
  const heading = root.value?.querySelector<HTMLElement>(`[data-example="${index}"] h3[id]`);
  if (heading && location.hash !== `#${heading.id}`) history.replaceState(history.state, '', `#${heading.id}`);

  const linked = toHeading;
  toHeading = false;

  await nextTick();
  const tab = root.value?.querySelector<HTMLElement>('[role="tab"][data-selected]');

  // every switch lands where its hash link would (the html's scroll-padding
  // clears the header); where the list isn't sticky, on the list, so the
  // tabs stay in reach. A frame later, once the panel is shown.
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
  follow();
  window.addEventListener('hashchange', follow);
});

onUnmounted(() => window.removeEventListener('hashchange', follow));
</script>

<template>
  <div ref="root">
    <TabsRoot v-model="selected" orientation="vertical">
      <SectionFrame>
        <template #title><slot name="title" /></template>

        <template #aside>
          <div v-if="$slots.lead" class="examples-lead px-2"><slot name="lead" /></div>

          <TabsList class="relative flex @2xl:flex-col gap-1 overflow-x-auto">
            <TabsTab
              v-for="(label, index) in items"
              :key="index"
              :value="index"
              class="group flex shrink-0 items-center gap-2 px-3 py-1.5 rounded-full text-left text-sm/snug text-muted duration-150 hover:text-surface data-selected:bg-stage data-selected:text-surface"
            >
              <span class="font-mono text-[11px]/none text-current/50 group-data-selected:text-accent">
                {{ String(index + 1).padStart(2, '0') }}
              </span>

              <span class="truncate">{{ label }}</span>
            </TabsTab>
          </TabsList>
        </template>

        <TabsPanel v-for="(_, index) in items" :key="index" :value="index" :data-example="index" keep-mounted>
          <SectionCard><slot :name="`example-${index}`" /></SectionCard>
        </TabsPanel>
      </SectionFrame>
    </TabsRoot>
  </div>
</template>

<style>
@reference '../style.css';

.examples-lead p {
  @apply m-0 text-sm text-muted;
}
</style>
