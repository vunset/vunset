<script setup lang="ts">
import { ref } from 'vue';
import { Appear, Input, FieldRoot, FieldLabel } from '@vunset/vue';
import './appear.css';
import '../field/field.css';

const query = ref('');
const documents = ['Invoices', 'Receipts', 'Statements', 'Refunds'];

const matches = (name: string) => name.toLowerCase().includes(query.value.trim().toLowerCase());
</script>

<template>
  <div class="demo-appear-group">
    <FieldRoot class="demo-field">
      <FieldLabel class="demo-field-label">Filter</FieldLabel>
      <Input v-model="query" placeholder="Try “re”" class="demo-field-input" />
    </FieldRoot>

    <div class="demo-appear-list">
      <Appear v-for="name in documents" :key="name" :open="matches(name)" class="demo-appear demo-appear-panel">
        {{ name }}
      </Appear>
    </div>
  </div>
</template>
