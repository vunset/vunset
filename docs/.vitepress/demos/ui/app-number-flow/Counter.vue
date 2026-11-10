<script setup lang="ts">
import { ref } from 'vue';
import { AppButton, AppNumberFlow } from '@vunset/ui';

const count = ref(98);
</script>

<template>
  <div class="grid justify-items-center gap-3">
    <AppNumberFlow :value="count" :format="{}" class="text-5xl font-semibold" />
    <div class="flex gap-2">
      <AppButton variant="outline" @click="count--">−1</AppButton>
      <AppButton variant="outline" @click="count++">+1</AppButton>
      <AppButton variant="outline" @click="count += 25">+25</AppButton>
    </div>
  </div>
</template>
