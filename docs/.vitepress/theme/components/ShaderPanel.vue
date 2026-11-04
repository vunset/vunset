<script setup lang="ts">
import { ref } from 'vue';
import type { ShaderGroup } from '../shader';

// Dev-only sliders for a shader's uniforms; edits `settings` in place.
const props = defineProps<{
  label: string;
  groups: ShaderGroup[];
  settings: Record<string, number>;
  defaults: Record<string, number>;
}>();

const open = ref(false);
const copied = ref(false);

function reset() {
  Object.assign(props.settings, props.defaults);
}

async function copy() {
  await navigator.clipboard.writeText(JSON.stringify(props.settings, null, 2));
  copied.value = true;
  setTimeout(() => (copied.value = false), 1500);
}
</script>

<template>
  <div class="fixed right-4 bottom-4 z-50 w-84 text-xs text-docs-text">
    <div
      v-if="open"
      class="mb-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-docs-border bg-docs-bg/90 p-4 backdrop-blur"
    >
      <div v-for="group in groups" :key="group.title" class="mb-4 last:mb-0">
        <div class="mb-2 font-medium text-docs-text/50">{{ group.title }}</div>

        <label
          v-for="control in group.controls"
          :key="control.key"
          class="mb-1.5 grid grid-cols-[6.5rem_1fr_3.25rem] items-center gap-2"
        >
          <span class="truncate">{{ control.label }}</span>
          <input
            v-model.number="settings[control.key]"
            type="range"
            :min="control.min"
            :max="control.max"
            :step="control.step"
            class="accent-docs-accent"
          />
          <span class="text-right font-mono text-docs-text/50">{{ settings[control.key] }}</span>
        </label>
      </div>

      <div class="mt-4 flex gap-2">
        <button type="button" class="flex-1 rounded-full bg-docs-accent px-3 py-1.5 font-medium text-docs-bg" @click="copy">
          {{ copied ? 'Copied' : 'Copy values' }}
        </button>
        <button type="button" class="rounded-full border border-docs-border px-3 py-1.5" @click="reset">Reset</button>
      </div>
    </div>

    <button
      type="button"
      class="ml-auto block rounded-full border border-docs-border bg-docs-bg/90 px-3 py-1.5 backdrop-blur"
      @click="open = !open"
    >
      {{ open ? `Hide ${label} panel` : `${label} panel` }}
    </button>
  </div>
</template>
