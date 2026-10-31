<script setup lang="ts">
import { CheckboxRoot, CheckboxIndicator } from '@vunset/vue';
import './checkbox.css';
</script>

<template>
  <label class="demo-checkbox-label">
    <CheckboxRoot class="demo-checkbox">
      <CheckboxIndicator class="demo-checkbox-indicator" />
    </CheckboxRoot>
    Accept the terms
  </label>
</template>
