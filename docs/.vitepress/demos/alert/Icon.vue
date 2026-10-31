<script setup lang="ts">
import { AlertRoot, AlertTitle, AlertDescription, Icon } from '@vunset/vue';
import './alert.css';
</script>

<template>
  <AlertRoot data-variant="info" class="demo-alert">
    <Icon name="bell" class="demo-alert-icon" />
    <AlertTitle as="h3" class="demo-alert-title">Scheduled maintenance on Sunday</AlertTitle>
    <AlertDescription class="demo-alert-description">
      The editor is read-only from 02:00 to 03:00 UTC. Plan accordingly.
    </AlertDescription>
  </AlertRoot>
</template>
