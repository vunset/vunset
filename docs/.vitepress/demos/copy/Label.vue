<script setup lang="ts">
import { ref } from 'vue';
import { Copy } from '@vunset/vue';
import './copy.css';

const result = ref('—');
</script>

<template>
  <Copy v-slot="{ copied }" value="npm install @vunset/vue" class="demo-copy" @copy="(ok) => (result = String(ok))">
    {{ copied ? 'Install link copied' : 'Copy install link' }}
  </Copy>

  <DemoOutput>@copy: {{ result }}</DemoOutput>
</template>
