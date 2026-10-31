<script setup lang="ts">
import { ref } from 'vue';
import { FormSelect } from '@vunset/ui';

const PERMISSIONS = [
  { value: 'read', label: 'Read' },
  { value: 'comment', label: 'Comment' },
  { value: 'edit', label: 'Edit' },
  { value: 'publish', label: 'Publish' },
  { value: 'invite', label: 'Invite members' },
  { value: 'billing', label: 'Manage billing' },
  { value: 'delete', label: 'Delete' }
];

const PRESETS = [
  { label: 'Viewer', values: ['read', 'comment'] },
  { label: 'Editor', values: ['read', 'comment', 'edit', 'publish'] },
  { label: 'Owner', values: PERMISSIONS.map((permission) => permission.value), disabled: true },
  {
    label: 'Teams',
    presets: [
      { label: 'Support', values: ['read', 'comment', 'invite'] },
      { label: 'Finance', values: ['read', 'billing'] }
    ]
  }
];

const permissions = ref<string[]>(['read']);
</script>

<template>
  <FormSelect
    v-model="permissions"
    label="Permissions"
    multiple
    searchable
    :flatten="2"
    placeholder="None"
    :options="PERMISSIONS"
    :presets="PRESETS"
    presets-label="Roles"
    class="w-72"
  />

  <DemoOutput>v-model: {{ permissions.join(', ') }}</DemoOutput>
</template>
