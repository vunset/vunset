<script setup lang="ts">
import { ref } from 'vue';
import { FormCheckboxGroup } from '@vunset/ui';

const sizes = ref(['M']);
</script>

<template>
  <FormCheckboxGroup v-model="sizes" label="Sizes" orientation="horizontal" :options="['S', 'M', 'L', 'XL']" />

  <DemoOutput>v-model: {{ sizes }}</DemoOutput>
</template>
