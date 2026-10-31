<script setup lang="ts">
import { SwitchRoot, SwitchThumb } from '@vunset/vue';
import './switch.css';
</script>

<template>
  <label class="demo-switch-label">
    <SwitchRoot read-only default-checked class="demo-switch">
      <SwitchThumb class="demo-switch-thumb" />
    </SwitchRoot>
    Managed by your organization
  </label>
</template>
