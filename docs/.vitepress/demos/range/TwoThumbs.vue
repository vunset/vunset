<script setup lang="ts">
import { ref } from 'vue';
import { RangeRoot, RangeLabel, RangeValue, RangeControl, RangeTrack, RangeIndicator, RangeThumb } from '@vunset/vue';
import './range.css';

const price = ref([25, 75]);
</script>

<template>
  <RangeRoot v-model="price" :min-steps-between-values="10" class="demo-range">
    <div class="demo-range-header">
      <RangeLabel class="demo-range-label">Price</RangeLabel>
      <RangeValue class="demo-range-value" />
    </div>

    <RangeControl class="demo-range-control">
      <RangeTrack class="demo-range-track">
        <RangeIndicator class="demo-range-indicator" />
        <RangeThumb aria-label="Lowest" class="demo-range-thumb" />
        <RangeThumb aria-label="Highest" class="demo-range-thumb" />
      </RangeTrack>
    </RangeControl>
  </RangeRoot>
</template>
