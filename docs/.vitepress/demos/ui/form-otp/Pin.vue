<script setup lang="ts">
import { FormOtp } from '@vunset/ui';
</script>

<template>
  <div class="grid gap-4">
    <FormOtp label="PIN" :length="4" mask :groups="[4]" />
    <FormOtp label="Code" :length="4" default-value="1234" error="That code has expired." size="sm" />
  </div>
</template>
