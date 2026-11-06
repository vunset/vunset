<script setup lang="ts">
import { ref, useId, watch } from 'vue';
import {
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxInput,
  ComboboxIndicator,
  Portal,
  Positioner,
  Popup,
  ComboboxList,
  ComboboxEmpty,
  Icon
} from '@vunset/vue';
import './combobox.css';

const ALL = ['Vue', 'Svelte', 'Solid', 'Angular', 'React', 'Preact', 'Qwik', 'Lit', 'Ember', 'Alpine'];

const id = useId();
const framework = ref<string | null>(null);
const query = ref('');
const options = ref<string[]>([]);
const loading = ref(false);
let latest = 0;

// stands in for a server search; only the latest answer lands
watch(query, async (text) => {
  if (!text.trim()) return;
  const request = ++latest;
  loading.value = true;
  await new Promise((resolve) => setTimeout(resolve, 600));
  if (request !== latest) return;
  options.value = ALL.filter((name) => name.toLowerCase().includes(text.trim().toLowerCase()));
  loading.value = false;
});
</script>

<template>
  <div class="demo-combobox-field">
    <label :for="id" class="demo-combobox-label">Framework</label>

    <ComboboxRoot
      :id="id"
      v-model="framework"
      v-model:query="query"
      :options="options"
    >
      <ComboboxTrigger class="demo-combobox-trigger">
        <ComboboxInput placeholder="Type to search" class="demo-combobox-input" />
        <ComboboxIndicator class="demo-combobox-indicator" :as="Icon" name="grabber" />
      </ComboboxTrigger>

      <Portal>
        <Positioner>
          <Popup class="demo-combobox-popup">
            <ComboboxList class="demo-combobox-list" :aria-busy="loading || undefined" />

            <ComboboxEmpty class="demo-combobox-empty">
              {{ loading ? 'Searching…' : 'Type a name to search' }}
            </ComboboxEmpty>
          </Popup>
        </Positioner>
      </Portal>
    </ComboboxRoot>
  </div>
</template>
