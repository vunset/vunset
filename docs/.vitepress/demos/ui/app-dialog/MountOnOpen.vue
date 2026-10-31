<script setup lang="ts">
import { ref } from 'vue';
import { AppButton } from '@vunset/ui';
import SignOutDialog from './SignOutDialog.vue';

const shown = ref(false);
const signedOut = ref(0);
</script>

<template>
  <AppButton variant="outline" @click="shown = true">Sign out</AppButton>

  <SignOutDialog v-if="shown" @closed="shown = false" @signed-out="signedOut++" />

  <DemoOutput>mounted: {{ shown }} · signed out: {{ signedOut }}</DemoOutput>
</template>
