<script setup lang="ts">
import { ref } from 'vue';
import { AppButton, AppSpinner } from '@vunset/ui';

const saving = ref(false);

function save() {
  saving.value = true;
  setTimeout(() => (saving.value = false), 1500);
}
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <AppButton variant="solid" tone="accent" :loading="saving" @click="save">{{ saving ? 'Saving' : 'Save' }}</AppButton>

    <AppButton variant="outline" :loading="saving" @click="save">
      <AppSpinner v-if="saving" />
      {{ saving ? 'Saving' : 'Save, with a spinner' }}
    </AppButton>
  </div>

  <DemoOutput>saving: {{ saving }}</DemoOutput>
</template>
