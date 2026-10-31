<script setup lang="ts">
import { ref } from 'vue';
import { FormCheckbox } from '@vunset/ui';

const terms = ref(false);
</script>

<template>
  <FormCheckbox v-model="terms" label="Accept the terms" required :error="terms ? undefined : 'Required to continue'" />

  <DemoOutput>v-model: {{ terms }}</DemoOutput>
</template>
