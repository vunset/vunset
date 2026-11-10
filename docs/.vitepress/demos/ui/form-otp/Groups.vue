<script setup lang="ts">
import { FormOtp } from '@vunset/ui';
</script>

<template>
  <div class="grid gap-4">
    <FormOtp label="Joined" :groups="[6]" />
    <FormOtp label="Two groups of three" :groups="[3, 3]" />
    <FormOtp label="License key" :length="8" :groups="[4, 4]" type="alphanumeric" />
  </div>
</template>
