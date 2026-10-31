<script setup lang="ts">
import { ref } from 'vue';
import { FormCheckboxGroup, FormCheckbox } from '@vunset/ui';

const extras = ref(['gift']);
</script>

<template>
  <FormCheckboxGroup v-model="extras" label="Extras">
    <FormCheckbox value="gift" label="Gift wrap" help="Plus $3" />
    <FormCheckbox value="note" label="Add a note" />
  </FormCheckboxGroup>

  <DemoOutput>v-model: {{ extras }}</DemoOutput>
</template>
