<script setup lang="ts">
import { computed, ref } from 'vue';
import { FormTextarea } from '@vunset/ui';

const LIMIT = 140;
const summary = ref('');
const remaining = computed(() => LIMIT - summary.value.length);
</script>

<template>
  <FormTextarea v-model="summary" label="Summary" :max-length="LIMIT" placeholder="In a tweet" class="w-72">
    <template #label-end>{{ remaining }}</template>
  </FormTextarea>
</template>
