<script setup lang="ts">
import { ref } from 'vue';
import { FormNumberField } from '@vunset/ui';

const guests = ref<number | null>(2);
</script>

<template>
  <FormNumberField v-model="guests" label="Guests" help="Up to 12 per table." :min="1" :max="12" class="w-56" />

  <DemoOutput>v-model: {{ guests }}</DemoOutput>
</template>
