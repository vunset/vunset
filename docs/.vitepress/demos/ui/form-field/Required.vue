<script setup lang="ts">
import { ref } from 'vue';
import { FormInput } from '@vunset/ui';

const code = ref('');
</script>

<template>
  <FormInput v-model="code" required placeholder="Promo code" aria-label="Promo code" class="w-72" />

  <DemoOutput>v-model: {{ code }}</DemoOutput>
</template>
