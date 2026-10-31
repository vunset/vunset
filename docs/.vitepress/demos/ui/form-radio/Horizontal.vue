<script setup lang="ts">
import { ref } from 'vue';
import { FormRadioGroup } from '@vunset/ui';

const size = ref('M');
</script>

<template>
  <FormRadioGroup v-model="size" label="Size" :options="['S', 'M', 'L', 'XL']" orientation="horizontal" />

  <DemoOutput>v-model: {{ size }}</DemoOutput>
</template>
