<script setup lang="ts">
import { ref } from 'vue';
import { RangeRoot, RangeLabel, RangeValue, RangeControl, RangeTrack, RangeIndicator, RangeThumb } from '@vunset/vue';
import './range.css';

const volume = ref(40);
</script>

<template>
  <RangeRoot v-model="volume" class="demo-range">
    <div class="demo-range-header">
      <RangeLabel class="demo-range-label">Volume</RangeLabel>
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
