<script setup lang="ts">
import { ref } from 'vue';
import { AppPopover, AppButton } from '@vunset/ui';

const status = ref('Online');
</script>

<template>
  <AppPopover :trigger="status" :as="AppButton" variant="outline" side="right">
    <template #default="{ close }">
      <div class="grid gap-1">
        <AppButton
          v-for="option in ['Online', 'Away', 'Busy']"
          :key="option"
          variant="ghost"
          size="sm"
          @click="((status = option), close())"
        >
          {{ option }}
        </AppButton>
      </div>
    </template>
  </AppPopover>
</template>
