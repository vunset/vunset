<script setup lang="ts">
import { AppAvatar } from '@vunset/ui';
</script>

<template>
  <div class="flex items-center gap-2">
    <AppAvatar src="/broken.png" title="Ada Love" initials />
    <AppAvatar title="Ada Love" initials />
    <AppAvatar fallback="AL" />
    <AppAvatar src="/broken.png" />
    <AppAvatar title="Someone">
      <template #fallback>?</template>
    </AppAvatar>
  </div>
</template>
