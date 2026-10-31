<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import { AppProgress, AppButton } from '@vunset/ui';

const done = ref(0);
let timer: ReturnType<typeof setInterval> | undefined;

function upload() {
  clearInterval(timer);
  done.value = 0;
  timer = setInterval(() => {
    done.value = Math.min(24, done.value + 1);
    if (done.value === 24) clearInterval(timer);
  }, 120);
}

onBeforeUnmount(() => clearInterval(timer));
</script>

<template>
  <div class="grid w-full max-w-sm gap-4">
    <AppProgress
      :value="done"
      :max="24"
      label="Uploading files"
      :get-value-text="(_, value) => `${value} of 24 files`"
      :tone="done === 24 ? 'success' : 'accent'"
    />
    <AppProgress :value="null" label="Waiting for the server" :show-value="false" />
    <AppButton variant="outline" size="sm" class="justify-self-start" @click="upload">Upload</AppButton>
  </div>
</template>
