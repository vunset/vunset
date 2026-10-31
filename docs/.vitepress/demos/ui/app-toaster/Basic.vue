<script setup lang="ts">
import { createToastStore, useToast } from '@vunset/vue';
import { AppToaster, AppButton } from '@vunset/ui';

// An app mounts one <AppToaster /> and calls useToast() with no store. This page
// holds several demos, so each keeps its own store and toaster.
const store = createToastStore();
const { setToast, clearToasts } = useToast(store);

let revision = 0;
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <AppButton
      variant="outline"
      @click="setToast({ title: 'Changes saved', text: `Revision ${++revision} is live.`, type: 'success' })"
    >
      Success
    </AppButton>
    <AppButton variant="outline" @click="setToast({ title: 'Upload failed', text: 'The connection dropped.', type: 'error' })">
      Error
    </AppButton>
    <AppButton variant="outline" @click="setToast({ title: 'Storage almost full', text: '92% of your quota.', type: 'warning' })">
      Warning
    </AppButton>
    <AppButton variant="outline" @click="setToast({ title: 'A new version is out', type: 'info' })">Info</AppButton>
    <AppButton variant="outline" @click="setToast({ title: 'Plain, no type' })">Plain</AppButton>
    <AppButton variant="ghost" @click="clearToasts()">Clear all</AppButton>
  </div>

  <AppToaster :store="store" />
</template>
