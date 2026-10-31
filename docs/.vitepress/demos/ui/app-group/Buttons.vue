<script setup lang="ts">
import { ref } from 'vue';
import { AppButton, AppGroup, AppIcon, AppMenu, type AppMenuEntry } from '@vunset/ui';

const last = ref('');
const run = (label: string) => () => (last.value = label);

const more: AppMenuEntry[] = [
  { label: 'Save as draft', onSelect: run('Save as draft') },
  { label: 'Save and close', onSelect: run('Save and close') }
];
</script>

<template>
  <div class="flex flex-wrap items-center gap-4">
    <AppGroup label="Range">
      <AppButton variant="outline">Day</AppButton>
      <AppButton variant="outline">Week</AppButton>
      <AppButton variant="outline">Month</AppButton>
    </AppGroup>

    <AppGroup label="Save">
      <AppButton variant="solid" tone="accent" @click="run('Save')()">Save</AppButton>
      <AppMenu :as="AppButton" variant="solid" tone="accent" square aria-label="More ways to save" :items="more">
        <template #trigger><AppIcon name="chevron-down" /></template>
      </AppMenu>
    </AppGroup>
  </div>

  <DemoOutput>last: {{ last }}</DemoOutput>
</template>
