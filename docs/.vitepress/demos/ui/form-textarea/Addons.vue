<script setup lang="ts">
import { computed, ref } from 'vue';
import { FormTextarea } from '@vunset/ui';

const LIMIT = 280;
const note = ref('');
const remaining = computed(() => LIMIT - note.value.length);
</script>

<template>
  <FormTextarea
    v-model="note"
    label="Note"
    :max-length="LIMIT"
    autosize
    rows="2"
    placeholder="Jot it down"
    class="w-80"
  >
    <template #start>
      <svg viewBox="0 0 16 16" class="size-4" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M11 2.5l2.5 2.5L6 12.5H3.5V10z" />
      </svg>
    </template>
    <template #end>
      <span class="text-xs tabular-nums">{{ remaining }}</span>
    </template>
  </FormTextarea>

  <DemoOutput>v-model: {{ note }}</DemoOutput>
</template>
