<script setup lang="ts">
import { ref } from 'vue';
import { AppDialog, AppButton } from '@vunset/ui';

const emit = defineEmits<{ closed: []; signedOut: [] }>();

// Fresh each time it's shown: nothing to reset.
const busy = ref(false);

async function signOut(close: () => void) {
  busy.value = true;
  await new Promise((resolve) => setTimeout(resolve, 600));
  emit('signedOut');
  close();
}
</script>

<template>
  <AppDialog
    default-open
    role="alertdialog"
    size="sm"
    title="Sign out?"
    description="You’ll need to sign in again on this device."
    :closable="false"
    @closed="emit('closed')"
  >
    <template #footer="{ close }">
      <AppButton variant="outline" :disabled="busy" @click="close">Stay</AppButton>
      <AppButton variant="solid" tone="accent" :loading="busy" @click="signOut(close)">Sign out</AppButton>
    </template>
  </AppDialog>
</template>
