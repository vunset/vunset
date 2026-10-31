<script setup lang="ts">
import { ref } from 'vue';
import { FormRange } from '@vunset/ui';

const volume = ref(40);
</script>

<template>
  <FormRange v-model="volume" label="Volume" help="Applies to every speaker." class="w-72" />

  <DemoOutput>v-model: {{ volume }}</DemoOutput>
</template>
