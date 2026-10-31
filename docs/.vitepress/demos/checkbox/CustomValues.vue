<script setup lang="ts">
import { ref } from 'vue';
import { CheckboxRoot, CheckboxIndicator } from '@vunset/vue';
import './checkbox.css';

const newsletter = ref<'yes' | 'no'>('no');
</script>

<template>
  <label class="demo-checkbox-label">
    <CheckboxRoot v-model="newsletter" true-value="yes" false-value="no" class="demo-checkbox">
      <CheckboxIndicator class="demo-checkbox-indicator" />
    </CheckboxRoot>
    Email me updates
  </label>

  <DemoOutput>v-model: {{ newsletter }}</DemoOutput>
</template>
