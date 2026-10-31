<script setup lang="ts">
import { ref, useId } from 'vue';
import { RadioGroup, RadioRoot, RadioIndicator } from '@vunset/vue';
import './radio.css';

const labelId = useId();
const plan = ref('monthly');
</script>

<template>
  <div class="demo-radio-group">
    <span :id="labelId" class="demo-radio-group-label">Billing</span>

    <RadioGroup v-model="plan" :aria-labelledby="labelId" class="demo-radio-group">
      <label v-for="option in ['monthly', 'yearly', 'lifetime']" :key="option" class="demo-radio-label">
        <RadioRoot :value="option" class="demo-radio">
          <RadioIndicator class="demo-radio-indicator" />
        </RadioRoot>
        {{ option }}
      </label>
    </RadioGroup>
  </div>

  <DemoOutput>v-model: {{ plan }}</DemoOutput>
</template>
