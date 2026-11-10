<script setup lang="ts">
import { ref } from 'vue';
import { AvatarRoot, AvatarImage, AvatarFallback, Button, type AvatarStatus } from '@vunset/vue';
import '../button/button.css';
import './avatar.css';

const image = `${import.meta.env.BASE_URL}avatar.svg`;
const broken = `${import.meta.env.BASE_URL}missing.png`;
const src = ref(image);
const statuses = ref<AvatarStatus[]>([]);
</script>

<template>
  <div class="demo-avatar-group">
    <AvatarRoot class="demo-avatar" :delay="300" @status-change="statuses.push($event)">
      <AvatarImage :src="src" alt="Ada Lovelace" class="demo-avatar-image" />
      <AvatarFallback>AL</AvatarFallback>
    </AvatarRoot>

    <Button class="demo-button" @click="src = src === image ? broken : image">
      {{ src === image ? 'Break the image' : 'Fix the image' }}
    </Button>

    <DemoOutput>@status-change: {{ statuses.join(' → ') || '…' }}</DemoOutput>
  </div>
</template>
