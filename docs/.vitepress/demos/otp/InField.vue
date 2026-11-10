<script setup lang="ts">
import { OtpRoot, OtpInput, FieldRoot, FieldLabel, FieldDescription } from '@vunset/vue';
import '../input/input.css';
import './otp.css';
</script>

<template>
  <FieldRoot name="pin" class="demo-input-field">
    <FieldLabel>PIN</FieldLabel>
    <OtpRoot :length="4" mask class="demo-otp">
      <OtpInput v-for="index in 4" :key="index" :index="index - 1" class="demo-otp-input" />
    </OtpRoot>
    <FieldDescription class="demo-input-hint">Four digits, hidden as you type.</FieldDescription>
  </FieldRoot>
</template>
