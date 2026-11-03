<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, provide, ref } from 'vue';
import { AccordionHeader, AccordionItem, AccordionRoot, CollapsiblePanel, CollapsibleTrigger } from '@vunset/vue';
import PlusIcon from './PlusIcon.vue';
import { FRAMED } from './Frame.vue';

defineProps<{
  parts: { label: string; count?: number; renders?: string }[];
}>();

provide(FRAMED, true);

const opened = ref<number[]>([0]);
const root = ref<HTMLElement>();

// a link to a heading inside a part (the outline, `#menuroot` from another page)
// opens that part and scrolls to the heading itself: VitePress scrolls a frame
// after the hash changes, while the panel is still hidden, and until it has
// grown to full height the page may be too short to reach the heading
function open() {
  const id = decodeURIComponent(location.hash.slice(1));
  const panel = id && document.getElementById(id)?.closest<HTMLElement>('[data-api-part]');
  if (!panel || !root.value?.contains(panel)) return;
  const index = Number(panel.dataset.apiPart);
  if (opened.value.includes(index)) return;
  opened.value = [...opened.value, index];

  const scroll = () => document.getElementById(id)?.scrollIntoView({ block: 'start' });
  panel.addEventListener('transitionend', scroll, { once: true });
  nextTick(() => requestAnimationFrame(scroll));
}

onMounted(() => {
  open();
  window.addEventListener('hashchange', open);
});

onUnmounted(() => window.removeEventListener('hashchange', open));
</script>

<template>
  <div ref="root">
    <AccordionRoot v-model="opened" multiple class="window">
      <AccordionItem v-for="(part, index) in parts" :key="part.label" :value="index" class="card">
        <AccordionHeader as="div">
          <CollapsibleTrigger class="group flex items-center w-full gap-2.5 p-3 text-left">
            <PlusIcon />
            <span class="text-base/none">{{ part.label }}</span>
            <span v-if="part.renders" class="text-sm/none text-docs-text/50">&lt;{{ part.renders }}&gt;</span>
          </CollapsibleTrigger>
        </AccordionHeader>

        <CollapsiblePanel keep-mounted :data-api-part="index">
          <div class="api-panel outline-none px-1.5 pb-1.5">
            <slot :name="`part-${index}`" />
          </div>
        </CollapsiblePanel>
      </AccordionItem>
    </AccordionRoot>
  </div>
</template>

<style>
@reference '../style.css';

/* the part's `###`, already its trigger's label */
.api-panel > h3:first-of-type {
  @apply sr-only;
}

/* a panel's own text, around its props; cards inside it sit a step deeper */
.api-panel {
  --color-docs-surface: var(--color-docs-bg);

  & > * + :not(h3:first-child + *) {
    @apply mt-2;
  }

  & > h4:not(:first-child) {
    @apply mt-4;
  }

  & > :is(p, ul, ol, h4) {
    @apply mx-1.5 text-sm;
  }
}
</style>
