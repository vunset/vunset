<script setup lang="ts">
import { ref } from 'vue';
import { FormTextarea } from '@vunset/ui';

const notes = ref('First line\nSecond line');
</script>

<template>
  <FormTextarea
    v-model="notes"
    label="Notes"
    autosize
    :max-rows="6"
    help="Grows to six lines, then scrolls."
    class="w-72"
  />
</template>
