<script setup lang="ts">
import { useClipboard } from '@vunset/vue';
import '../button/button.css';
import './copy.css';

const keys = [
  { id: 1, key: 'pk_live_51Hx9eF2rQ' },
  { id: 2, key: 'pk_test_77aB3kLw0m' }
];

// one instance for the whole list: copiedId says which row it was
const { copy, copiedId } = useClipboard();
</script>

<template>
  <div v-for="row in keys" :key="row.id" class="demo-copy-field">
    <code>{{ row.key }}</code>

    <button type="button" class="demo-copy" @click="copy(row.key, row.id)">
      {{ copiedId === row.id ? 'Copied' : 'Copy' }}
    </button>
  </div>
</template>
