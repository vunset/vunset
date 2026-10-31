<script setup lang="ts">
import { AlertRoot, AlertTitle, AlertDescription } from '@vunset/vue';
import './alert.css';
</script>

<template>
  <AlertRoot class="demo-alert">
    <AlertTitle class="demo-alert-title">Scheduled maintenance</AlertTitle>
    <AlertDescription class="demo-alert-description">
      The editor is read-only on Sunday, 02:00–03:00 UTC.
    </AlertDescription>
  </AlertRoot>
</template>
