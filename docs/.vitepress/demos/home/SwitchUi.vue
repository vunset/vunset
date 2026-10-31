<script setup lang="ts">
import { ref } from 'vue';
import { FormSwitch } from '@vunset/ui';

const notifications = ref(true);
</script>

<template>
  <FormSwitch v-model="notifications" label="Notifications" />
</template>
