<script setup lang="ts">
import { Copy } from '@vunset/vue';
import './copy.css';
</script>

<template>
  <div class="demo-copy-field">
    <code>npm install @vunset/vue</code>

    <Copy value="npm install @vunset/vue" class="demo-copy" />
  </div>
</template>
