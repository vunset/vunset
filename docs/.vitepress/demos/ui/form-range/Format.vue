<script setup lang="ts">
import { ref } from 'vue';
import { FormRange } from '@vunset/ui';

const opacity = ref(0.6);
</script>

<template>
  <FormRange
    v-model="opacity"
    label="Opacity"
    :min="0"
    :max="1"
    :step="0.05"
    :format="{ style: 'percent' }"
    class="w-72"
  />

  <DemoOutput>v-model: {{ opacity }}</DemoOutput>
</template>
