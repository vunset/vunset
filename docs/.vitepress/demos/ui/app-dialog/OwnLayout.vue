<script setup lang="ts">
import { ref } from 'vue';
import { DialogTitle } from '@vunset/vue';
import { AppDialog, AppButton, FormInput } from '@vunset/ui';

const email = ref('');
const invited = ref('');

function invite(close: () => void) {
  invited.value = email.value;
  close();
}
</script>

<template>
  <AppDialog trigger="Invite" :as="AppButton" variant="outline" size="sm">
    <template #default="{ close }">
      <form class="grid gap-4" @submit.prevent="invite(close)">
        <div class="app-overlay-header">
          <!-- Still names the dialog for a screen reader. -->
          <DialogTitle class="app-overlay-title">Invite a teammate</DialogTitle>
        </div>

        <FormInput v-model="email" label="Email" type="email" required />

        <div class="app-overlay-footer">
          <AppButton variant="outline" @click="close">Cancel</AppButton>
          <AppButton variant="solid" tone="accent" type="submit">Send invite</AppButton>
        </div>
      </form>
    </template>
  </AppDialog>

  <DemoOutput>invited: {{ invited || '—' }}</DemoOutput>
</template>
