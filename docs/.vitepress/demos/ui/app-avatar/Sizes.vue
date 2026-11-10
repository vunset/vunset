<script setup lang="ts">
import { AppAvatar } from '@vunset/ui';

const image = `${import.meta.env.BASE_URL}avatar.svg`;
</script>

<template>
  <div class="grid gap-3">
    <div class="flex items-center gap-2">
      <AppAvatar size="sm" title="Ada Love" initials />
      <AppAvatar title="Ada Love" initials />
      <AppAvatar size="lg" title="Ada Love" initials />
    </div>
    <div class="flex items-center gap-2">
      <AppAvatar size="sm" :src="image" title="Ada Love" class="app-avatar-square" />
      <AppAvatar :src="image" title="Ada Love" class="app-avatar-square" />
      <AppAvatar size="lg" :src="image" title="Ada Love" class="app-avatar-square" />
    </div>
  </div>
</template>
