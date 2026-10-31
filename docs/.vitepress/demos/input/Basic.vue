<script setup lang="ts">
import { ref, useId } from 'vue';
import { Input } from '@vunset/vue';
import './input.css';

const email = ref('');
</script>

<template>
  <Input v-model="email" type="email" placeholder="ada@example.com" class="demo-input" />

  <DemoOutput>v-model: {{ email }}</DemoOutput>
</template>
