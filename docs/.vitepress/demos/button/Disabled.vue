<script setup lang="ts">
import { Button } from '@vunset/vue';
import './button.css';
</script>

<template>
  <div class="demo-button-row">
    <Button class="demo-button" disabled>Disabled</Button>
    <Button class="demo-button" disabled focusable-when-disabled>Focusable when disabled</Button>
  </div>
</template>
