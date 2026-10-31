<script setup lang="ts">
import { RangeRoot, RangeControl, RangeTrack, RangeIndicator, RangeThumb } from '@vunset/vue';
import './range.css';
</script>

<template>
  <div class="demo-range-group-row">
    <RangeRoot v-for="(level, i) in [30, 55, 80]" :key="i" :default-value="level" orientation="vertical">
      <RangeControl class="demo-range-control">
        <RangeTrack class="demo-range-track">
          <RangeIndicator class="demo-range-indicator" />
          <RangeThumb :aria-label="`Band ${i + 1}`" class="demo-range-thumb" />
        </RangeTrack>
      </RangeControl>
    </RangeRoot>
  </div>
</template>
