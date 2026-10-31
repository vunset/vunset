<script setup lang="ts">
import { ref } from 'vue';
import { FormSelect } from '@vunset/ui';

const SKILLS = [
  { value: 'vue', label: 'Vue', hint: 'The one we are in' },
  { value: 'ts', label: 'TypeScript', hint: 'Types at build time' },
  { value: 'css', label: 'CSS', hint: 'Cascading, still' },
  { value: 'a11y', label: 'Accessibility', hint: 'Not optional' },
  { value: 'rust', label: 'Rust', hint: 'Borrow checker included' },
  { value: 'go', label: 'Go', hint: 'Gophers' }
];

const skills = ref<string[]>(['vue', 'ts']);
</script>

<template>
  <FormSelect
    v-model="skills"
    label="Skills"
    multiple
    :flatten="2"
    placeholder="None yet"
    :options="SKILLS"
    class="w-72"
  >
    <template #option="{ label, option }">
      <span class="grid">
        <span>{{ label }}</span>
        <span class="text-xs opacity-60">{{ option.hint }}</span>
      </span>
    </template>
  </FormSelect>

  <DemoOutput>v-model: {{ skills.join(', ') }}</DemoOutput>
</template>
