<script setup lang="ts">
import { AppCard } from '@vunset/ui';
</script>

<template>
  <div class="grid w-full max-w-lg gap-3 sm:grid-cols-2">
    <AppCard as="a" href="#" title="Get started" description="Install and import the stylesheet." />
    <AppCard as="a" href="#" title="Theming" description="Override the --ui-* tokens." />
  </div>
</template>
