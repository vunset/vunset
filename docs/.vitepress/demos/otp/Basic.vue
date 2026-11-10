<script setup lang="ts">
import { ref } from 'vue';
import { OtpRoot, OtpInput } from '@vunset/vue';
import './otp.css';

const code = ref('');
const completed = ref('');
</script>

<template>
  <OtpRoot v-slot="{ length }" v-model="code" class="demo-otp" @complete="completed = $event">
    <OtpInput v-for="index in length" :key="index" :index="index - 1" class="demo-otp-input" />
  </OtpRoot>

  <DemoOutput>v-model: {{ code }} · @complete: {{ completed }}</DemoOutput>
</template>
