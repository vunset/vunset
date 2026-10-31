<script setup lang="ts">
import { ref } from 'vue';
import {
  TableCaption,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHeadCell,
  TableCell,
  formatNumber
} from '@vunset/vue';
import { AppTable } from '@vunset/ui';

const invoices = [
  { id: 'INV-1042', client: 'Northwind', amount: 1250 },
  { id: 'INV-1043', client: 'Globex', amount: 830 },
  { id: 'INV-1044', client: 'Initech', amount: 2400 },
  { id: 'INV-1045', client: 'Umbrella', amount: 515 }
];

const selected = ref('INV-1043');

const usd = (value: number) => formatNumber(value, { currency: 'USD' });
</script>

<template>
  <AppTable class="w-full max-w-md">
    <TableCaption>Invoices this month</TableCaption>
    <TableHeader>
      <TableRow>
        <TableHeadCell>Invoice</TableHeadCell>
        <TableHeadCell>Client</TableHeadCell>
        <TableHeadCell class="app-table-numeric">Amount</TableHeadCell>
      </TableRow>
    </TableHeader>

    <TableBody>
      <TableRow
        v-for="(invoice, index) in invoices"
        :key="invoice.id"
        :index="index"
        :selected="invoice.id === selected"
        @click="selected = invoice.id"
      >
        <TableCell>{{ invoice.id }}</TableCell>
        <TableCell>{{ invoice.client }}</TableCell>
        <TableCell class="app-table-numeric">{{ usd(invoice.amount) }}</TableCell>
      </TableRow>
    </TableBody>

    <TableFooter>
      <TableRow>
        <TableCell colspan="2">Total</TableCell>
        <TableCell class="app-table-numeric">
          {{ usd(invoices.reduce((sum, invoice) => sum + invoice.amount, 0)) }}
        </TableCell>
      </TableRow>
    </TableFooter>
  </AppTable>

  <DemoOutput>selected: {{ selected }}</DemoOutput>
</template>
