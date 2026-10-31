<script setup lang="ts">
import { FormRadioGroup } from '@vunset/ui';
</script>

<template>
  <FormRadioGroup label="Plan" read-only default-value="Pro" :options="['Free', 'Pro', 'Team']" />
</template>
