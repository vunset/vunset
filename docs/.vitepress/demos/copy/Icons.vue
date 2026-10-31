<script setup lang="ts">
import { Copy } from '@vunset/vue';
import './copy.css';
</script>

<template>
  <div class="demo-copy-field">
    <!-- by name, from the icon folder or the sprite -->
    <Copy value="npm install @vunset/vue" icon="star" copied-icon="bolt" class="demo-copy" />

    <!-- or anything of your own -->
    <Copy value="npm install @vunset/vue" class="demo-copy">
      <template #icon="{ copied }">{{ copied ? '✓' : '⧉' }}</template>
    </Copy>
  </div>
</template>
