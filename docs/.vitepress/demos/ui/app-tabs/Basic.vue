<script setup lang="ts">
import { ref } from 'vue';
import { AppTabs, AppButton, FormInput } from '@vunset/ui';

const tabs = [
  { value: 'account', label: 'Account' },
  { value: 'password', label: 'Password' },
  { value: 'billing', label: 'Billing', disabled: true }
];
const tab = ref('account');
</script>

<template>
  <AppTabs v-model="tab" :tabs="tabs" class="w-full max-w-sm">
    <template #account>
      <div class="grid gap-3">
        <FormInput label="Name" default-value="Ada Lovelace" />
        <AppButton variant="solid" tone="accent" class="justify-self-start">Save</AppButton>
      </div>
    </template>

    <template #password>
      <div class="grid gap-3">
        <FormInput label="New password" type="password" />
        <AppButton variant="solid" tone="accent" class="justify-self-start">Change password</AppButton>
      </div>
    </template>
  </AppTabs>

  <DemoOutput>tab: {{ tab }}</DemoOutput>
</template>
