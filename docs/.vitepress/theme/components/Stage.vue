<script setup lang="ts">
import { provide, ref } from 'vue';
import { PREVIEW_OUTPUT } from '../preview-output';

// The card a demo renders on; its <DemoOutput> lands in the bottom corner.
const output = ref<HTMLElement | null>(null);
const outputs = ref(0);
provide(PREVIEW_OUTPUT, {
  target: output,
  register() {
    outputs.value += 1;
    return () => (outputs.value -= 1);
  }
});
</script>

<template>
  <div class="card pattern-grid relative grid grid-cols-[minmax(0,1fr)] place-items-center px-2 py-14">
    <div class="absolute top-2 left-3 pointer-events-none text-[10px]/none uppercase text-current/20">Preview</div>

    <slot />

    <output
      v-show="outputs > 0"
      ref="output"
      class="absolute left-3 bottom-2 flex flex-wrap gap-x-4 gap-y-1 text-xs/none text-current/20 hover:text-current duration-150"
    />
  </div>
</template>
