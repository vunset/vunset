<script setup lang="ts">
import { ref } from 'vue';
import { Button, CheckboxGroup, CheckboxRoot, CheckboxIndicator, FieldRoot, FieldError, FieldLabel } from '@vunset/vue';
import './checkbox.css';
import '../field/field.css';
import '../button/button.css';

const days = ref<string[]>([]);
const saved = ref<string[] | null>(null);
const tried = ref(false);

// `required` only announces it: the check is the app's.
function save() {
  tried.value = true;
  if (days.value.length) saved.value = [...days.value];
}
</script>

<template>
  <form class="demo-field-col" @submit.prevent="save">
    <FieldRoot class="demo-field" :invalid="tried && !days.length">
      <FieldLabel as="div" class="demo-field-label">Delivery days</FieldLabel>

      <CheckboxGroup v-model="days" name="days" required class="demo-checkbox-group">
        <label v-for="day in ['Mon', 'Wed', 'Fri']" :key="day" class="demo-checkbox-label">
          <CheckboxRoot :value="day" class="demo-checkbox">
            <CheckboxIndicator class="demo-checkbox-indicator" />
          </CheckboxRoot>
          {{ day }}
        </label>
      </CheckboxGroup>

      <FieldError class="demo-field-error">Pick at least one day</FieldError>
    </FieldRoot>

    <Button type="submit" class="demo-button">Save</Button>
  </form>

  <DemoOutput>saved: {{ saved ?? '—' }}</DemoOutput>
</template>
