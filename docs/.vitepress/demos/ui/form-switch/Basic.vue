<script setup lang="ts">
import { ref } from 'vue';
import { FormSwitch } from '@vunset/ui';

const notifications = ref(true);
</script>

<template>
  <FormSwitch v-model="notifications" label="Notifications" help="A weekly digest, every Monday." />

  <DemoOutput>v-model: {{ notifications }}</DemoOutput>
</template>
