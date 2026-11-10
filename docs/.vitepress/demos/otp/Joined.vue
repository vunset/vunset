<script setup lang="ts">
import { OtpRoot, OtpInput, Group } from '@vunset/vue';
import './otp.css';
</script>

<template>
  <OtpRoot class="demo-otp" type="alphanumeric">
    <Group class="demo-otp-joined">
      <OtpInput v-for="index in 3" :key="index" :index="index - 1" class="demo-otp-input" />
    </Group>
    <span class="demo-otp-dash" aria-hidden="true">–</span>
    <Group class="demo-otp-joined">
      <OtpInput v-for="index in 3" :key="index" :index="index + 2" class="demo-otp-input" />
    </Group>
  </OtpRoot>
</template>
