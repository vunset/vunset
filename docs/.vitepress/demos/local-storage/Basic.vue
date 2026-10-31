<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { Button, FieldRoot, FieldLabel, Input, useLocalStorage } from '@vunset/vue';
import '../button/button.css';
import '../field/field.css';
import './local-storage.css';

const KEY = 'vunset-demo-note';
const storage = useLocalStorage();
const note = ref('');

// Read once mounted: the server has no storage, and must render what the browser hydrates.
onMounted(() => (note.value = storage.getItem<string>(KEY) ?? ''));
watch(note, (value) => storage.setItem(KEY, value || null));
</script>

<template>
  <div class="demo-local-storage-stack">
    <FieldRoot class="demo-field">
      <FieldLabel class="demo-field-label">Note</FieldLabel>
      <Input v-model="note" placeholder="Type, then reload the page" class="demo-field-input" />
    </FieldRoot>
    <Button class="demo-button" @click="note = ''">Forget it</Button>
  </div>
  <DemoOutput>localStorage['{{ KEY }}']: {{ note ? JSON.stringify(note) : 'removed' }}</DemoOutput>
</template>
