<script setup lang="ts">
import { ref } from 'vue';
import { AppFloating, AppButton } from '@vunset/ui';

const open = ref(false);
</script>

<template>
  <AppButton variant="outline" @click="open = !open">{{ open ? 'Hide' : 'Show' }} notes</AppButton>

  <!-- Against the bottom-right corner, and kept there as the window resizes, until it is dragged. -->
  <AppFloating v-model:open="open" title="Notes" :right="24" :bottom="24" :width="300" resize="y">
    <template #actions>
      <AppButton variant="ghost" size="sm" @click="open = false">Hide</AppButton>
    </template>

    <p class="m-0">Pull the top or bottom edge to make room; double-click the header to put it back.</p>
  </AppFloating>
</template>
