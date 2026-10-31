<script setup lang="ts">
import { FormCheckbox } from '@vunset/ui';
</script>

<template>
  <FormCheckbox>
    <template #label>I have read the <a href="#label-slot" class="underline">privacy policy</a></template>
  </FormCheckbox>
</template>
