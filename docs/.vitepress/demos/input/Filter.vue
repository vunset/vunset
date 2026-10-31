<script setup lang="ts">
import { ref, useId } from 'vue';
import { Input } from '@vunset/vue';
import './input.css';

const id = useId();
const code = ref('');
</script>

<template>
  <div class="demo-input-field">
    <label :for="id">Verification code</label>
    <Input
      :id="id"
      v-model="code"
      filter="[0-9]*"
      :max-length="6"
      inputmode="numeric"
      autocomplete="one-time-code"
      placeholder="000000"
      class="demo-input"
    />
    <p class="demo-input-hint">Digits only, up to six. Pasting letters does nothing.</p>
  </div>

  <DemoOutput>v-model: {{ code }}</DemoOutput>
</template>
