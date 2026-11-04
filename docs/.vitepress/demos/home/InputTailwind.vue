<script setup lang="ts">
import { ref } from 'vue';
import { Input } from '@vunset/vue';

const email = ref('');
</script>

<template>
  <Input
    v-model="email"
    type="email"
    placeholder="ada@example.com"
    class="h-9 w-64 border border-dotted border-current/30 bg-current/3 px-3 text-sm outline-none placeholder:opacity-50 focus-visible:border-current"
  />

  <DemoOutput>v-model: {{ email }}</DemoOutput>
</template>
