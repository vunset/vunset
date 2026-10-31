<script setup lang="ts">
import { provide } from 'vue';
import { formatNumber, routeQueryKey } from '@vunset/vue';
import { DataTable, type DataTableColumn } from '@vunset/vue/data-table';
import { useQuery } from '../query';
import '../table/table.css';
import './data-table.css';

interface Order {
  id: number;
  customer: string;
  product: string;
  quantity: number;
  total: number;
  status: string;
}

const PRODUCTS = ['Keyboard', 'Monitor', 'Mouse', 'Laptop stand', 'Headphones', 'Webcam', 'Dock', 'Cable'];
const STATUSES = ['Paid', 'Shipped', 'Pending', 'Refunded'];

const orders: Order[] = Array.from({ length: 10000 }, (_, index) => ({
  id: 100000 + index,
  customer: `Customer ${(index * 7919) % 2400}`,
  product: PRODUCTS[index % PRODUCTS.length]!,
  quantity: 1 + ((index * 13) % 9),
  total: 18 + ((index * 37) % 980),
  status: STATUSES[(index * 3) % STATUSES.length]!
}));

const columns: DataTableColumn<Order>[] = [
  { accessorKey: 'id', header: 'Order', size: 90, meta: { pin: 'start' } },
  { accessorKey: 'customer', header: 'Customer' },
  { accessorKey: 'product', header: 'Product' },
  { accessorKey: 'quantity', header: 'Qty', meta: { class: 'demo-data-table-num' } },
  { accessorKey: 'total', header: 'Total', meta: { class: 'demo-data-table-num' } },
  { accessorKey: 'status', header: 'Status' }
];

// VitePress has no router: the table reaches the URL through query.ts.
const { query, push } = useQuery();
provide(routeQueryKey, {
  get: (key) => query.value[key],
  set: (key, value) => push({ ...query.value, [key]: value }),
  setMany: (entries) => push({ ...query.value, ...entries })
});
</script>

<template>
  <DataTable
    :data="orders"
    :columns="columns"
    :get-row-id="(order: Order) => String(order.id)"
    sort-query="orders"
    sticky-header
    virtual
    class="demo-table demo-data-table demo-data-table-edges"
    style="max-height: 320px"
  >
    <template #cell-total="{ cell }">{{ formatNumber(cell, { currency: 'USD' }) }}</template>
  </DataTable>

  <DemoOutput>?orders={{ query.orders ?? '' }}</DemoOutput>
</template>
