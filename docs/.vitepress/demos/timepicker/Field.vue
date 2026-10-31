<script setup lang="ts">
import { ref } from 'vue';
import {
  FieldRoot,
  FieldLabel,
  FieldDescription,
  FieldError,
  TimepickerRoot,
  TimepickerInput,
  TimepickerTrigger,
  TimepickerColumn,
  Portal,
  Positioner,
  Popup
} from '@vunset/vue';
import '../field/field.css';
import './timepicker.css';

const time = ref<string | null>(null);
const tried = ref(false);
const submitted = ref('');

function onSubmit(event: Event) {
  tried.value = true;
  submitted.value = new URLSearchParams(new FormData(event.target as HTMLFormElement) as never).toString();
}
</script>

<template>
  <form class="demo-timepicker-form" @submit.prevent="onSubmit">
    <FieldRoot name="opens" required :invalid="tried && !time" class="demo-field">
      <FieldLabel class="demo-field-label">Opens at</FieldLabel>
      <TimepickerRoot v-model="time" class="demo-timepicker">
        <TimepickerInput class="demo-timepicker-input" />
        <TimepickerTrigger class="demo-timepicker-button">Pick</TimepickerTrigger>

        <Portal>
          <Positioner>
            <Popup class="demo-timepicker-popup">
              <TimepickerColumn unit="hour" class="demo-timepicker-column" />
              <TimepickerColumn unit="minute" class="demo-timepicker-column" />
            </Popup>
          </Positioner>
        </Portal>
      </TimepickerRoot>
      <FieldDescription class="demo-field-description">Clicking the label focuses the hours.</FieldDescription>
      <FieldError class="demo-field-error" :match="tried && !time">Enter a time.</FieldError>
    </FieldRoot>
    <button type="submit" class="demo-timepicker-button">Save</button>
  </form>

  <DemoOutput>submitted: {{ submitted || '—' }}</DemoOutput>
</template>
