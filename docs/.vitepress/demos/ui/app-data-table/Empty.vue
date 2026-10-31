<script setup lang="ts">
import { AppDataTable, type DataTableColumn } from '@vunset/ui/data-table';

interface Order {
  id: number;
  product: string;
}

const columns: DataTableColumn<Order>[] = [
  { accessorKey: 'id', header: 'Order' },
  { accessorKey: 'product', header: 'Product' }
];
</script>

<template>
  <AppDataTable :data="[]" :columns="columns" empty-text="No orders yet" class="w-full max-w-md" />
</template>
