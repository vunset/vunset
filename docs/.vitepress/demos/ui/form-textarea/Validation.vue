<script setup lang="ts">
import { computed, ref } from 'vue';
import { FormTextarea } from '@vunset/ui';

const message = ref('');
const error = computed(() => {
  const missing = 20 - message.value.trim().length;
  return missing > 0 ? `${missing} more characters, at least.` : undefined;
});
</script>

<template>
  <FormTextarea v-model="message" label="Message" required :rows="3" :error="error" class="w-72" />
</template>
