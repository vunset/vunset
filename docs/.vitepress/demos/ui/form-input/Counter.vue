<script setup lang="ts">
import { computed, ref } from 'vue';
import { FormInput } from '@vunset/ui';

const LIMIT = 40;
const note = ref('');
const remaining = computed(() => LIMIT - note.value.length);
</script>

<template>
  <FormInput v-model="note" label="Note" :max-length="LIMIT" placeholder="Say something" class="w-72">
    <template #end>{{ remaining }}</template>
  </FormInput>
</template>
