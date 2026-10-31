<script setup lang="ts">
import { ref } from 'vue';
import { TimepickerRoot, TimepickerInput, TimepickerColumn, Portal, Positioner, Popup } from '@vunset/vue';
import './timepicker.css';

const time = ref<string | null>('10:00');
</script>

<template>
  <TimepickerRoot v-model="time" min="09:30" max="17:15" class="demo-timepicker">
    <TimepickerInput class="demo-timepicker-input" />

    <Portal>
      <Positioner>
        <Popup class="demo-timepicker-popup">
          <TimepickerColumn unit="hour" class="demo-timepicker-column" />
          <TimepickerColumn unit="minute" class="demo-timepicker-column" />
        </Popup>
      </Positioner>
    </Portal>
  </TimepickerRoot>

  <DemoOutput>v-model: {{ time ?? 'null' }}</DemoOutput>
</template>
