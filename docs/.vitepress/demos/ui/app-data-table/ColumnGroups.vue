<script setup lang="ts">
import { formatNumber } from '@vunset/vue';
import { AppDataTable, type DataTableColumn } from '@vunset/ui/data-table';

interface Order {
  id: number;
  city: string;
  country: string;
  quantity: number;
  total: number;
}

const orders: Order[] = [
  { id: 1042, city: 'Lisbon', country: 'Portugal', quantity: 3, total: 240 },
  { id: 1043, city: 'Berlin', country: 'Germany', quantity: 1, total: 89 },
  { id: 1044, city: 'Osaka', country: 'Japan', quantity: 12, total: 1180 },
  { id: 1045, city: 'Toronto', country: 'Canada', quantity: 5, total: 415 }
];

const columns: DataTableColumn<Order>[] = [
  { accessorKey: 'id', header: 'Order' },
  {
    id: 'shipping',
    header: 'Ships to',
    columns: [
      { accessorKey: 'city', header: 'City' },
      { accessorKey: 'country', header: 'Country' }
    ]
  },
  {
    id: 'amount',
    header: 'Amount',
    columns: [
      { accessorKey: 'quantity', header: 'Qty', meta: { class: 'app-table-numeric' } },
      { accessorKey: 'total', header: 'Total', meta: { class: 'app-table-numeric' } }
    ]
  }
];
</script>

<template>
  <AppDataTable :data="orders" :columns="columns" :get-row-id="(order: Order) => String(order.id)" class="w-full max-w-lg">
    <template #cell-total="{ cell }">{{ formatNumber(cell, { currency: 'USD' }) }}</template>
  </AppDataTable>
</template>
