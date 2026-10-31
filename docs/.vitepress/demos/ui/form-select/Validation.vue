<script setup lang="ts">
import { ref } from 'vue';
import { FormSelect } from '@vunset/ui';

const country = ref<string | null>(null);
</script>

<template>
  <FormSelect
    v-model="country"
    label="Country"
    required
    placeholder="Pick a country"
    :options="['France', 'Germany', 'Spain']"
    :error="country ? undefined : 'Pick a country to continue'"
    class="w-72"
  />

  <DemoOutput>v-model: {{ country }}</DemoOutput>
</template>
