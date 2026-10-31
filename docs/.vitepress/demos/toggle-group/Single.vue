<script setup lang="ts">
import { ref } from 'vue';
import { Toggle } from '@vunset/vue';
import './toggle.css';

const bookmarked = ref(false);
</script>

<template>
  <Toggle v-model="bookmarked" class="demo-toggle">
    <span aria-hidden="true">{{ bookmarked ? '★' : '☆' }}</span>
    Bookmark
  </Toggle>
</template>
