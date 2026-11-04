<script setup lang="ts">
import { ref } from 'vue';
import { FormInput } from '@vunset/ui';

const email = ref('');
</script>

<template>
  <FormInput v-model="email" type="email" placeholder="ada@example.com" class="w-64" />

  <DemoOutput>v-model: {{ email }}</DemoOutput>
</template>
