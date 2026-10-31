<script setup lang="ts">
import { SwitchRoot, SwitchThumb } from '@vunset/vue';
import './switch.css';
</script>

<template>
  <label class="demo-switch-label">
    <SwitchRoot disabled class="demo-switch">
      <SwitchThumb class="demo-switch-thumb" />
    </SwitchRoot>
    Beta features
  </label>
</template>
