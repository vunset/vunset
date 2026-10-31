<script setup lang="ts">
import { inject, onBeforeUnmount, onMounted, ref } from 'vue';
import { PREVIEW_OUTPUT } from '../preview-output';

const preview = inject(PREVIEW_OUTPUT, null);

const mounted = ref(false);
let release: (() => void) | undefined;

onMounted(() => {
  release = preview?.register();
  mounted.value = true;
});
onBeforeUnmount(() => release?.());
</script>

<template>
  <Teleport v-if="preview && mounted && preview.target.value" :to="preview.target.value">
    <span><slot /></span>
  </Teleport>
  <span v-else-if="!preview"><slot /></span>
</template>
