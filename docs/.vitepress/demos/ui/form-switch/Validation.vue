<script setup lang="ts">
import { ref } from 'vue';
import { FormSwitch } from '@vunset/ui';

const terms = ref(false);
</script>

<template>
  <FormSwitch v-model="terms" label="Accept the terms" required :error="terms ? undefined : 'Required to continue'" />

  <DemoOutput>v-model: {{ terms }}</DemoOutput>
</template>
