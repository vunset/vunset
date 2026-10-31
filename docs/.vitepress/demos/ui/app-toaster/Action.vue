<script setup lang="ts">
import { ref } from 'vue';
import { createToastStore, useToast } from '@vunset/vue';
import { AppToaster, AppButton, type AppToastData } from '@vunset/ui';

const store = createToastStore();
const { setToast } = useToast(store);

const inbox = ref(['Quarterly report', 'Team offsite', 'Invoice #1042']);

function archive() {
  const [subject] = inbox.value;
  if (!subject) return;

  inbox.value = inbox.value.slice(1);
  setToast<AppToastData>({
    title: `“${subject}” archived`,
    data: { action: { label: 'Undo', onClick: () => (inbox.value = [subject, ...inbox.value]) } }
  });
}
</script>

<template>
  <AppButton variant="outline" :disabled="!inbox.length" @click="archive">Archive “{{ inbox[0] ?? '…' }}”</AppButton>

  <AppToaster :store="store" position="top-center" />

  <DemoOutput>inbox: {{ inbox.join(', ') || 'empty' }}</DemoOutput>
</template>
