<script setup lang="ts">
import { ref, useId } from 'vue';
import { RadioGroup, RadioRoot, RadioIndicator } from '@vunset/vue';
import './radio.css';

const labelId = useId();
const shipping = ref('standard');
</script>

<template>
  <div class="demo-radio-group">
    <span :id="labelId" class="demo-radio-group-label">Shipping</span>

    <RadioGroup v-model="shipping" :aria-labelledby="labelId" class="demo-radio-group">
      <label class="demo-radio-label">
        <RadioRoot value="standard" class="demo-radio">
          <RadioIndicator class="demo-radio-indicator" />
        </RadioRoot>
        Standard
      </label>

      <label class="demo-radio-label">
        <RadioRoot value="express" class="demo-radio">
          <RadioIndicator class="demo-radio-indicator" />
        </RadioRoot>
        Express
      </label>

      <label class="demo-radio-label">
        <RadioRoot value="overnight" disabled class="demo-radio">
          <RadioIndicator class="demo-radio-indicator" />
        </RadioRoot>
        Overnight (unavailable)
      </label>
    </RadioGroup>
  </div>
</template>
