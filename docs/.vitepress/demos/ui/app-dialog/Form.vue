<script setup lang="ts">
import { reactive, ref, useId } from 'vue';
import { AppDialog, AppButton, FormInput } from '@vunset/ui';

const formId = useId();
const profile = reactive({ name: 'Ada Lovelace', email: 'ada@example.com' });
const error = ref('');
const saving = ref(false);
const saved = ref('');

async function save(close: () => void) {
  error.value = profile.email.includes('@') ? '' : 'Enter an email address';
  if (error.value) return;

  saving.value = true;
  await new Promise((resolve) => setTimeout(resolve, 600));
  saving.value = false;
  saved.value = `${profile.name} <${profile.email}>`;
  close();
}
</script>

<template>
  <AppDialog
    title="Edit profile"
    description="Shown on your public page."
    trigger="Edit profile"
    :as="AppButton"
    variant="outline"
  >
    <template #default="{ close }">
      <form :id="formId" class="grid gap-3" @submit.prevent="save(close)">
        <FormInput v-model="profile.name" label="Name" name="name" />
        <FormInput v-model="profile.email" label="Email" name="email" :error="error" required />
      </form>
    </template>

    <!-- `form` ties the buttons to the form above: a click on Save, or Enter in a field, submits it. -->
    <template #footer="{ close }">
      <AppButton variant="outline" :disabled="saving" @click="close">Cancel</AppButton>
      <AppButton variant="solid" type="submit" :form="formId" tone="accent" :loading="saving">Save</AppButton>
    </template>
  </AppDialog>

  <DemoOutput>saved: {{ saved || '—' }}</DemoOutput>
</template>
