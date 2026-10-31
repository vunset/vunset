<script setup lang="ts">
import { ref } from 'vue';
import { FormRange } from '@vunset/ui';

const level = ref(60);
</script>

<template>
  <FormRange v-model="level" label="Level" orientation="vertical" />

  <DemoOutput>v-model: {{ level }}</DemoOutput>
</template>
