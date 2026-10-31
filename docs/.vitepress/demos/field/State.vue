<script setup lang="ts">
import { computed, ref } from 'vue';
import { FieldRoot, FieldLabel, FieldGroup, Addon, Input, FieldError } from '@vunset/vue';
import './field.css';

const LIMIT = 40;
const note = ref('');
const remaining = computed(() => LIMIT - note.value.length);
</script>

<template>
  <FieldRoot v-slot="{ filled, dirty, focused, touched }" :invalid="remaining < 0" class="demo-field">
    <FieldLabel class="demo-field-label">Note</FieldLabel>

    <FieldGroup class="demo-field-group">
      <Input v-model="note" placeholder="Say something" class="demo-field-input" />

      <Addon side="end">
        <span class="demo-field-count">{{ remaining }}</span>
      </Addon>
    </FieldGroup>

    <FieldError class="demo-field-error">{{ -remaining }} too many characters.</FieldError>

    <DemoOutput>filled: {{ filled }} • dirty: {{ dirty }} • focused: {{ focused }} • touched: {{ touched }}</DemoOutput>
  </FieldRoot>
</template>
