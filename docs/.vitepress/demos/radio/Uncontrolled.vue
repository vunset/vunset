<script setup lang="ts">
import { useId } from 'vue';
import { RadioGroup, RadioRoot, RadioIndicator } from '@vunset/vue';
import './radio.css';

const labelId = useId();
</script>

<template>
  <div class="demo-radio-group">
    <span :id="labelId" class="demo-radio-group-label">Size</span>

    <RadioGroup default-value="m" name="size" :aria-labelledby="labelId" class="demo-radio-group">
      <label v-for="size in ['s', 'm', 'l']" :key="size" class="demo-radio-label">
        <RadioRoot :value="size" class="demo-radio">
          <RadioIndicator class="demo-radio-indicator" />
        </RadioRoot>
        {{ size.toUpperCase() }}
      </label>
    </RadioGroup>
  </div>
</template>
