<script setup lang="ts">
import { CheckboxRoot, CheckboxIndicator } from '@vunset/vue';
import './checkbox.css';
</script>

<template>
  <label class="demo-checkbox-label">
    <CheckboxRoot disabled default-checked class="demo-checkbox">
      <CheckboxIndicator class="demo-checkbox-indicator" />
    </CheckboxRoot>
    Required cookies
  </label>
</template>
