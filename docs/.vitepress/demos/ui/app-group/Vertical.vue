<script setup lang="ts">
import { AppButton, AppGroup, FormInput } from '@vunset/ui';
</script>

<template>
  <div class="flex flex-wrap items-start gap-6">
    <AppGroup orientation="vertical" label="Address" class="w-64">
      <FormInput placeholder="Street" aria-label="Street" />
      <FormInput placeholder="City" aria-label="City" />
      <FormInput placeholder="Postcode" aria-label="Postcode" />
    </AppGroup>

    <AppGroup orientation="vertical" label="Zoom">
      <AppButton variant="outline" square aria-label="Zoom in">+</AppButton>
      <AppButton variant="outline" square aria-label="Zoom out">−</AppButton>
    </AppGroup>
  </div>
</template>
