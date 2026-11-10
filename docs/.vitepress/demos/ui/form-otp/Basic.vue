<script setup lang="ts">
import { ref } from 'vue';
import { FormOtp } from '@vunset/ui';

const code = ref('');
const completed = ref('');
</script>

<template>
  <FormOtp v-model="code" label="Verification code" help="We sent it to your phone." @complete="completed = $event" />

  <DemoOutput>v-model: {{ code }} · @complete: {{ completed }}</DemoOutput>
</template>
