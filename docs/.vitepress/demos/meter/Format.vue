<script setup lang="ts">
import { MeterRoot, MeterLabel, MeterValue, MeterTrack, MeterIndicator } from '@vunset/vue';
import '../progress/gauge.css';
</script>

<template>
  <MeterRoot
    :value="1500"
    :max="4000"
    :format="{ style: 'unit', unit: 'gigabyte', unitDisplay: 'short' }"
    class="demo-gauge"
  >
    <div class="demo-gauge-head">
      <MeterLabel>Team storage</MeterLabel>
      <MeterValue v-slot="{ formattedValue, max }" class="demo-gauge-value">
        {{ formattedValue }} of {{ max / 1000 }} TB
      </MeterValue>
    </div>
    <MeterTrack class="demo-gauge-track">
      <MeterIndicator class="demo-gauge-indicator" />
    </MeterTrack>
  </MeterRoot>
</template>
