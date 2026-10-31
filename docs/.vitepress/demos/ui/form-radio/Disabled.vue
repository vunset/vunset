<script setup lang="ts">
import { FormRadioGroup } from '@vunset/ui';
</script>

<template>
  <FormRadioGroup label="Plan" disabled :options="['Free', 'Pro', 'Team']" />
</template>
