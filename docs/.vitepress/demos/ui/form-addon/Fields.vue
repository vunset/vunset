<script setup lang="ts">
import { ref } from 'vue';
import { FormInput, FormSelect } from '@vunset/ui';

const format = ref('json');
const link = ref('');
const amount = ref('');
const currency = ref('USD');
</script>

<template>
  <div class="grid w-80 gap-4">
    <!-- A FormSelect at the start joins the box, like a button. -->
    <FormInput v-model="link" label="Example link" placeholder="https://api.example.com/report">
      <template #start>
        <FormSelect v-model="format" :options="['json', 'xml', 'csv']" aria-label="Format" />
      </template>
    </FormInput>

    <!-- And at the end. -->
    <FormInput v-model="amount" label="Amount" inputmode="decimal" placeholder="0.00">
      <template #end>
        <FormSelect v-model="currency" :options="['USD', 'EUR', 'GBP']" aria-label="Currency" />
      </template>
    </FormInput>
  </div>

  <DemoOutput>{{ format }} · {{ link || '—' }} · {{ amount || '0' }} {{ currency }}</DemoOutput>
</template>
