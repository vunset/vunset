<script setup lang="ts">
import { ref } from 'vue';
import { AppAlert, AppAppear, AppButton } from '@vunset/ui';

const open = ref(true);
</script>

<template>
  <div class="grid w-96 justify-items-center gap-3">
    <AppButton variant="outline" @click="open = !open">{{ open ? 'Hide' : 'Show' }}</AppButton>

    <AppAppear :open class="w-full">
      <AppAlert tone="success" title="Draft saved" description="Two seconds ago." />
    </AppAppear>
  </div>
</template>
