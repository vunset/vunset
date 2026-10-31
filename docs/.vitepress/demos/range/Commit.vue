<script setup lang="ts">
import { ref } from 'vue';
import {
  RangeRoot,
  RangeLabel,
  RangeValue,
  RangeControl,
  RangeTrack,
  RangeIndicator,
  RangeThumb,
  type RangeChangeDetails
} from '@vunset/vue';
import './range.css';

const price = ref<number[]>([25, 75]);
const saved = ref('nothing yet');

function save(value: number | number[], details: RangeChangeDetails) {
  saved.value = `${JSON.stringify(value)} by ${details.reason}`;
}
</script>

<template>
  <RangeRoot v-model="price" class="demo-range" @commit="save">
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

  <DemoOutput>v-model: {{ price }} • last commit: {{ saved }}</DemoOutput>
</template>
