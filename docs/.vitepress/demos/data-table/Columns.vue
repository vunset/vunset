<script setup lang="ts">
import { ref } from 'vue';
import { Toggle, ToggleGroup } from '@vunset/vue';
import { DataTable, type DataTableColumn } from '@vunset/vue/data-table';
import '../toggle-group/toggle.css';
import '../table/table.css';
import './data-table.css';

interface Order {
  id: number;
  customer: string;
  product: string;
  quantity: number;
  status: string;
}

const orders: Order[] = [
  { id: 1001, customer: 'Northwind', product: 'Keyboard', quantity: 3, status: 'Paid' },
  { id: 1002, customer: 'Globex', product: 'Monitor', quantity: 1, status: 'Shipped' },
  { id: 1003, customer: 'Initech', product: 'Dock', quantity: 12, status: 'Pending' },
  { id: 1004, customer: 'Umbrella', product: 'Webcam', quantity: 5, status: 'Refunded' }
];

const columns: DataTableColumn<Order>[] = [
  { accessorKey: 'id', header: 'Order', size: 80, meta: { pin: 'start' } },
  { accessorKey: 'customer', header: 'Customer', size: 140, enableResizing: true },
  { accessorKey: 'product', header: 'Product', size: 140, enableResizing: true },
  { accessorKey: 'quantity', header: 'Qty', meta: { class: 'demo-data-table-num' } },
  { accessorKey: 'status', header: 'Status', size: 100, meta: { pin: 'end' } }
];

const visibility = ref({ customer: true, product: true, quantity: false });
</script>

<template>
  <div class="demo-table-group">
    <div aria-label="Columns" class="demo-toggle-group">
      <Toggle v-model="visibility.customer" aria-label="Customer" class="demo-toggle">Customer</Toggle>
      <Toggle v-model="visibility.product" aria-label="Product" class="demo-toggle">Product</Toggle>
      <Toggle v-model="visibility.quantity" aria-label="Quantity" class="demo-toggle">Quantity</Toggle>
    </div>

    <DataTable
      v-model:column-visibility="visibility"
      :data="orders"
      :columns="columns"
      class="demo-table demo-data-table"
    />
  </div>

  <DemoOutput>visibility: {{ visibility }}</DemoOutput>
</template>
