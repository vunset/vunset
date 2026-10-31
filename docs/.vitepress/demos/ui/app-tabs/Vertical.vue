<script setup lang="ts">
import { AppTabs, FormInput, FormSwitch } from '@vunset/ui';
</script>

<template>
  <AppTabs orientation="vertical" keep-mounted :tabs="['General', 'Notifications', 'Privacy']" class="w-full max-w-md">
    <template #General>
      <FormInput label="Workspace" default-value="vunset" />
    </template>
    <template #Notifications>
      <FormSwitch label="Email me about mentions" />
    </template>
    <template #Privacy>
      <FormSwitch label="Public profile" />
    </template>
  </AppTabs>
</template>
