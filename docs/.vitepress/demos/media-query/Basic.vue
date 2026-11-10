<script setup lang="ts">
import { useMediaQuery } from '@vunset/vue';
import './media-query.css';

const narrow = useMediaQuery('(max-width: 1024px)');
const dark = useMediaQuery('(prefers-color-scheme: dark)');
const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
</script>

<template>
  <div class="demo-media-query" :data-narrow="narrow || undefined">
    {{ narrow ? 'Narrow layout' : 'Wide layout' }}
  </div>
  <DemoOutput>
    max-width 1024px: {{ narrow }} · dark: {{ dark }} · reduced motion: {{ reducedMotion }}
  </DemoOutput>
</template>
