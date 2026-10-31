<script setup lang="ts">
import { ref } from 'vue';
import { FormRadioGroup, FormRadio } from '@vunset/ui';

const delivery = ref('standard');
</script>

<template>
  <FormRadioGroup v-model="delivery" label="Delivery">
    <FormRadio value="standard" label="Standard" help="3–5 working days" />
    <FormRadio value="express" label="Express" help="Next working day" />
    <FormRadio value="pickup" label="Pick up in store" />
  </FormRadioGroup>

  <DemoOutput>v-model: {{ delivery }}</DemoOutput>
</template>
