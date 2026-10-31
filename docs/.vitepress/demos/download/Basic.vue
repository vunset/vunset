<script setup lang="ts">
import { Button, useDownload, useExportCsv } from '@vunset/vue';
import '../button/button.css';

const orders = [
  { id: 1001, customer: 'Ada Lovelace', total: 120 },
  { id: 1002, customer: 'Grace Hopper, USN', total: 75.5 },
  { id: 1003, customer: 'Alan Turing', total: 42 }
];
</script>

<template>
  <div class="demo-button-row">
    <Button class="demo-button" @click="useExportCsv(orders, 'orders')">Export CSV</Button>
    <Button class="demo-button" @click="useDownload(orders, 'orders.json')">Download JSON</Button>
  </div>
</template>
