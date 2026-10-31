<script setup lang="ts">
import { ref } from 'vue';
import { FormSelect } from '@vunset/ui';

const country = ref<string | null>(null);
</script>

<template>
  <FormSelect
    v-model="country"
    label="Country"
    help="Where you live."
    placeholder="Pick a country"
    :options="['France', 'Germany', 'Spain', 'Brazil', 'Canada']"
    class="w-72"
  />

  <DemoOutput>v-model: {{ country }}</DemoOutput>
</template>
