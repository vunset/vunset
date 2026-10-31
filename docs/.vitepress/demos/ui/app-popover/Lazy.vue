<script setup lang="ts">
import { reactive } from 'vue';
import { AppPopover, AppButton, FormInput } from '@vunset/ui';

const prices = reactive<Record<string, number>>({ Alpha: 20, Beta: 100, Gamma: 0, Delta: 1500 });
</script>

<template>
  <div class="grid w-64 gap-2">
    <div v-for="(price, item) in prices" :key="item" class="flex items-center justify-between gap-4 text-sm">
      {{ item }}

      <AppPopover lazy :as="AppButton" variant="outline" size="sm" class="w-20" side="bottom">
        <template #trigger>${{ price }}</template>

        <template #default="{ close }">
          <form class="flex gap-2" @submit.prevent="close()">
            <FormInput v-model.number="prices[item]" type="number" aria-label="Price" control-class="w-28" />
            <AppButton variant="solid" tone="accent" type="submit">Save</AppButton>
          </form>
        </template>
      </AppPopover>
    </div>
  </div>
</template>
