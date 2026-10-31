<script setup lang="ts">
import { ref } from 'vue';
import { FormInput } from '@vunset/ui';
import { toSeparatedList } from '@vunset/utils';

const code = ref('');
const emails = ref('');
</script>

<template>
  <div class="flex flex-col gap-4">
    <FormInput v-model="code" label="Promo code" :transform="(value) => value.trim().toUpperCase()" class="w-72" />
    <FormInput
      v-model="emails"
      label="Invite"
      help="Separate addresses with commas."
      :transform="(value) => toSeparatedList(value, ',', true)"
      placeholder="ada@example.com,grace@example.com"
      class="w-72"
    />
  </div>

  <DemoOutput>code: {{ code }} · emails: {{ emails }}</DemoOutput>
</template>
