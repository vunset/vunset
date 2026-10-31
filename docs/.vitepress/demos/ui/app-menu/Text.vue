<script setup lang="ts">
import { AppMenu } from '@vunset/ui';
</script>

<template>
  <p class="m-0">
    Shared with
    <AppMenu trigger="3 people" open-on-hover :items="[{ label: 'Ada' }, { label: 'Grace' }, { label: 'Linus' }]" />
  </p>
</template>
