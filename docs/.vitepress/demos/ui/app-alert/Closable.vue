<script setup lang="ts">
import { ref } from 'vue';
import { AppAlert, AppButton } from '@vunset/ui';

const shown = ref(true);
</script>

<template>
  <AppAlert v-if="shown" tone="success" title="Saved" closable class="w-96" @close="shown = false" />
  <AppButton v-else size="sm" variant="outline" @click="shown = true">Show again</AppButton>
</template>
