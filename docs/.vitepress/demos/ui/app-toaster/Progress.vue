<script setup lang="ts">
import { createToastStore, useToast } from '@vunset/vue';
import { AppToaster, AppButton } from '@vunset/ui';

const store = createToastStore();
const { setToast } = useToast(store);
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <AppButton variant="outline" @click="setToast({ title: 'Message archived', text: 'Hover to hold it.', type: 'success' })">
      Archive
    </AppButton>
    <AppButton variant="outline" @click="setToast({ title: 'Link copied', timeout: 2000 })">Copy, 2 seconds</AppButton>
  </div>

  <AppToaster :store="store" progress />
</template>
