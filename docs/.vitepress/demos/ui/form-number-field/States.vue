<script setup lang="ts">
import { FormNumberField } from '@vunset/ui';
</script>

<template>
  <div class="grid w-56 gap-4">
    <FormNumberField label="Seats" :default-value="40" error="No more than 30 in this room." />
    <FormNumberField label="Floor" :default-value="3" read-only />
    <FormNumberField label="Rooms" :default-value="1" disabled />
    <FormNumberField label="Small" size="sm" :default-value="5" />
  </div>
</template>
