<script setup lang="ts">
import { RangeRoot, RangeLabel, RangeValue, RangeControl, RangeTrack, RangeIndicator, RangeThumb } from '@vunset/vue';
import './range.css';
</script>

<template>
  <RangeRoot
    :default-value="1200"
    :max="5000"
    :step="50"
    :large-step="500"
    :format="{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }"
    class="demo-range"
  >
    <div class="demo-range-header">
      <RangeLabel class="demo-range-label">Budget</RangeLabel>
      <RangeValue class="demo-range-value" />
    </div>

    <RangeControl class="demo-range-control">
      <RangeTrack class="demo-range-track">
        <RangeIndicator class="demo-range-indicator" />
        <RangeThumb class="demo-range-thumb" />
      </RangeTrack>
    </RangeControl>
  </RangeRoot>
</template>
