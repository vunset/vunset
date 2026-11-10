<script setup lang="ts">
import { AvatarRoot, AvatarImage, AvatarFallback } from '@vunset/vue';
import './avatar.css';

const people = [
  { name: 'Ada Lovelace', initials: 'AL', src: `${import.meta.env.BASE_URL}avatar.svg` },
  { name: 'Grace Hopper', initials: 'GH', src: `${import.meta.env.BASE_URL}missing.png` },
  { name: 'Alan Turing', initials: 'AT' }
];
</script>

<template>
  <div class="demo-avatar-group">
    <AvatarRoot v-for="person in people" :key="person.name" class="demo-avatar">
      <AvatarImage v-if="person.src" :src="person.src" :alt="person.name" class="demo-avatar-image" />
      <AvatarFallback :title="person.name">{{ person.initials }}</AvatarFallback>
    </AvatarRoot>
  </div>
</template>
