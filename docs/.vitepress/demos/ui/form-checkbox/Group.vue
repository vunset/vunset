<script setup lang="ts">
import { computed, ref } from 'vue';
import { FormCheckbox } from '@vunset/ui';

const TOPICS = [
  { value: 'vue', label: 'Vue' },
  { value: 'css', label: 'CSS' },
  { value: 'a11y', label: 'Accessibility' }
];

const topics = ref<string[]>(['vue']);
const all = computed(() => topics.value.length === TOPICS.length);
const some = computed(() => topics.value.length > 0 && !all.value);

function toggleAll(on: boolean) {
  topics.value = on ? TOPICS.map((topic) => topic.value) : [];
}
</script>

<template>
  <div class="grid gap-2">
    <FormCheckbox
      :model-value="all"
      :indeterminate="some"
      label="All topics"
      @update:model-value="toggleAll($event as boolean)"
    />
    <div class="grid gap-2 pl-6">
      <FormCheckbox
        v-for="topic in TOPICS"
        :key="topic.value"
        v-model="topics"
        :value="topic.value"
        :label="topic.label"
        name="topics"
      />
    </div>
  </div>

  <DemoOutput>v-model: {{ topics.join(', ') }}</DemoOutput>
</template>
