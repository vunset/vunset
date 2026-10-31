<script setup lang="ts">
import { ref } from 'vue';
import { FormTimepicker } from '@vunset/ui';

const delivery = ref<string | null>(null);
</script>

<template>
  <FormTimepicker
    v-model="delivery"
    label="Delivery"
    help="Between 09:30 and 17:15"
    min="09:30"
    max="17:15"
    clearable
    class="w-56"
  />

  <DemoOutput>v-model: {{ delivery ?? 'null' }}</DemoOutput>
</template>
