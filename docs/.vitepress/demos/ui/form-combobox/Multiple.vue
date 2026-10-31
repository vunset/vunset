<script setup lang="ts">
import { ref } from 'vue';
import { FormCombobox } from '@vunset/ui';

const tags = ref(['design', 'frontend']);
</script>

<template>
  <FormCombobox
    v-model="tags"
    label="Tags"
    multiple
    placeholder="Add a tag"
    :options="['design', 'frontend', 'backend', 'devops', 'research']"
    class="w-72"
  />

  <DemoOutput>v-model: {{ tags }}</DemoOutput>
</template>
