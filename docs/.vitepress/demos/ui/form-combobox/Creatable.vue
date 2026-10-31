<script setup lang="ts">
import { ref } from 'vue';
import { FormCombobox } from '@vunset/ui';

const options = ref(['urgent', 'later', 'blocked']);
const labels = ref(['urgent']);

function add(value: string) {
  options.value = [...options.value, value];
}
</script>

<template>
  <FormCombobox
    v-model="labels"
    label="Labels"
    multiple
    creatable
    placeholder="Type a new one"
    :options="options"
    class="w-72"
    @create="add"
  />

  <DemoOutput>v-model: {{ labels }}</DemoOutput>
</template>
