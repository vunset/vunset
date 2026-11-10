<script setup lang="ts">
import { AppAvatar } from '@vunset/ui';

const image = `${import.meta.env.BASE_URL}avatar.svg`;
</script>

<template>
  <div class="flex items-center gap-2">
    <AppAvatar :src="image" title="Ada Love" initials />
    <AppAvatar src="/broken.png" title="Grace Hopper" initials />
    <AppAvatar title="Alan Turing" initials />
    <AppAvatar src="/broken.png" />
  </div>
</template>
