<script setup lang="ts">
import { ref } from 'vue';
import { Appear } from '@vunset/vue';
import { AppButton } from '@vunset/ui';

const open = ref(false);
</script>

<template>
  <div class="grid w-96 justify-items-center gap-3">
    <AppButton variant="outline" @click="open = !open">{{ open ? 'Hide' : 'Show' }}</AppButton>

    <!-- The raw part, as a list item, with the same class. -->
    <ul class="m-0 grid w-full list-none gap-1 p-0">
      <li>Always here</li>
      <Appear :open as="li" class="app-appear">And this one, when shown</Appear>
    </ul>
  </div>
</template>
