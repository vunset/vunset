<script setup lang="ts">
import { reactive } from 'vue';
import { RangeRoot, RangeLabel, RangeControl, RangeTrack, RangeIndicator, RangeThumb } from '@vunset/vue';
import './range.css';

const values = reactive({
  push: [20, 50, 80],
  swap: [20, 50, 80],
  none: [20, 50, 80]
});
</script>

<template>
  <div class="demo-range-group">
    <RangeRoot
      v-for="behavior in ['push', 'swap', 'none']"
      :key="behavior"
      v-model="values[behavior]"
      :default-value="[20, 50, 80]"
      :thumb-collision-behavior="behavior"
      class="demo-range"
    >
      <RangeLabel class="demo-range-label">{{ behavior }}</RangeLabel>

      <RangeControl class="demo-range-control">
        <RangeTrack class="demo-range-track">
          <RangeIndicator class="demo-range-indicator" />
          <RangeThumb v-for="i in 3" :key="i" :aria-label="`Thumb ${i}`" class="demo-range-thumb" />
        </RangeTrack>
      </RangeControl>
    </RangeRoot>

    <DemoOutput>push: {{ values.push }} • swap: {{ values.swap }} • none: {{ values.none }}</DemoOutput>
  </div>
</template>
