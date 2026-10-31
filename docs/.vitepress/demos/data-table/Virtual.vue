<script setup lang="ts">
import { formatNumber } from '@vunset/vue';
import { DataTable, type DataTableColumn } from '@vunset/vue/data-table';
import '../table/table.css';
import './data-table.css';

interface Order {
  id: number;
  product: string;
  total: number;
  quantity: number;
}

const PRODUCTS = ['Keyboard', 'Monitor', 'Mouse', 'Laptop stand', 'Headphones', 'Webcam', 'Dock', 'Cable'];

const orders: Order[] = Array.from({ length: 10000 }, (_, index) => ({
  id: 100000 + index,
  product: PRODUCTS[index % PRODUCTS.length]!,
  total: 18 + ((index * 37) % 980),
  quantity: 1 + ((index * 13) % 10)
}));

const columns: DataTableColumn<Order>[] = [
  { accessorKey: 'id', header: 'Order' },
  { accessorKey: 'product', header: 'Product' },
  { accessorKey: 'total', header: 'Total', meta: { class: 'demo-data-table-num' } },
  { accessorKey: 'quantity', header: 'Quantity', meta: { class: 'demo-data-table-num' } }
];
</script>

<template>
  <DataTable
    :data="orders"
    :columns="columns"
    :get-row-id="(order: Order) => String(order.id)"
    sticky-header
    virtual
    class="demo-table demo-data-table"
    style="max-height: 288px"
  >
    <template #cell-total="{ cell }">{{ formatNumber(cell, { currency: 'USD' }) }}</template>
  </DataTable>
</template>
