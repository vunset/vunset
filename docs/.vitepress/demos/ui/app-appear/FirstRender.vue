<script setup lang="ts">
import { ref } from 'vue';
import { AppAlert, AppAppear, AppButton } from '@vunset/ui';

const key = ref(0);
</script>

<template>
  <div class="grid w-96 justify-items-center gap-3">
    <AppButton variant="outline" @click="key++">Mount again</AppButton>

    <div :key class="grid w-full gap-2">
      <AppAppear>
        <AppAlert tone="accent" title="Animates in" />
      </AppAppear>

      <AppAppear :appear="false">
        <AppAlert title="Just there" />
      </AppAppear>
    </div>
  </div>
</template>
