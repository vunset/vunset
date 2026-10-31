<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
import { AccordionHeader, AccordionItem, AccordionRoot, CollapsiblePanel, CollapsibleTrigger } from '@vunset/vue';
import PlusIcon from './PlusIcon.vue';

defineProps<{
  parts: { label: string; count?: number; renders?: string }[];
}>();

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
    <AccordionRoot v-model="opened" multiple class="flex flex-col gap-1">
      <AccordionItem
        v-for="(part, index) in parts"
        :key="part.label"
        :value="index"
        class="api-part bg-card transition-[background-color,border-radius] duration-200 data-open:bg-stage data-open:first:mt-0 data-open:last:mb-0"
      >
        <AccordionHeader as="div">
          <CollapsibleTrigger class="group flex items-center w-full gap-4 px-5 py-4 text-left">
            <span class="flex items-baseline gap-2.5 mr-auto">
              <span class="text-lg/none font-medium">{{ part.label }}</span>
              <span v-if="part.renders" class="text-xs/none font-mono text-muted">&lt;{{ part.renders }}&gt;</span>
            </span>

            <PlusIcon />
          </CollapsibleTrigger>
        </AccordionHeader>

        <CollapsiblePanel keep-mounted :data-api-part="index">
          <div class="api-panel outline-none px-3 pb-3">
            <slot :name="`part-${index}`" />
          </div>
        </CollapsiblePanel>
      </AccordionItem>
    </AccordionRoot>
  </div>
</template>

<style>
@reference '../style.css';

/* a part's card, its corners joined to the closed ones beside it */
.api-part {
  @apply rounded-md;

  &:first-child,
  &[data-open],
  &[data-open] + & {
    @apply rounded-t-[28px];
  }

  &:last-child,
  &[data-open],
  &:has(+ [data-open]) {
    @apply rounded-b-[28px];
  }
}

/* the part's `###`, already its trigger's label */
.api-panel > h3:first-of-type {
  @apply sr-only;
}

/* a panel's own text, around its props, spaced as in an example's card */
.api-panel {
  & > * + :not(h3:first-child + *) {
    @apply mt-2;
  }

  & > h4:not(:first-child) {
    @apply mt-4;
  }

  & > :is(p, ul, ol, h4) {
    @apply mx-1.5;
  }
}
</style>
