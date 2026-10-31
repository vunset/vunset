<script setup lang="ts">
import { ref } from 'vue';
import { SwitchRoot, SwitchThumb } from '@vunset/vue';

const notifications = ref(true);
</script>

<template>
  <label class="inline-flex cursor-pointer items-center gap-2 text-[13px] font-medium">
    <SwitchRoot
      v-model="notifications"
      class="inline-flex h-5.5 w-10 rounded-full border border-[#333] bg-[#111] p-0.5 outline-none transition data-checked:border-[#a9c98f] data-checked:bg-[#a9c98f] focus-visible:ring-3 focus-visible:ring-[#a9c98f]/15"
    >
      <SwitchThumb
        class="aspect-square h-full rounded-full bg-[#333]/70 transition data-checked:translate-x-4.5 data-checked:bg-white data-checked:shadow-sm"
      />
    </SwitchRoot>
    Notifications
  </label>
</template>
