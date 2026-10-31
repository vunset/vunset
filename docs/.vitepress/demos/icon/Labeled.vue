<script setup lang="ts">
import { Icon } from '@vunset/vue';
import './icon.css';
</script>

<template>
  <div class="demo-icon-row">
    <!-- next to text, it only decorates: hidden from assistive technology -->
    <span class="demo-icon-label"><Icon name="bell" class="demo-icon-sm" /> Notifications</span>

    <!-- standing alone, it needs a name: with one, it is an image -->
    <Icon name="star" inline aria-label="Favorite" class="demo-icon" />
  </div>
</template>
