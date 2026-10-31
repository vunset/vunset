<script setup lang="ts">
import { ref } from 'vue';
import { FormTextarea } from '@vunset/ui';

const bio = ref('');
</script>

<template>
  <FormTextarea v-model="bio" label="Bio" help="Shown on your profile." placeholder="A line or two" class="w-72" />

  <DemoOutput>v-model: {{ bio }}</DemoOutput>
</template>
