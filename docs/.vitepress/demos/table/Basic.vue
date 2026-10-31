<script setup lang="ts">
import {
  TableRoot,
  TableCaption,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHeadCell,
  TableCell
} from '@vunset/vue';
import './table.css';

const invoices = [
  { id: 'INV-1042', client: 'Northwind', amount: 1250 },
  { id: 'INV-1043', client: 'Globex', amount: 830 },
  { id: 'INV-1044', client: 'Initech', amount: 2400 },
  { id: 'INV-1045', client: 'Umbrella', amount: 515 }
];

const money = (value: number) => value.toLocaleString('en', { style: 'currency', currency: 'USD' });
</script>

<template>
  <TableRoot class="demo-table" style="width: 384px">
    <TableCaption>Invoices this month</TableCaption>
    <TableHeader>
      <TableRow>
        <TableHeadCell>Invoice</TableHeadCell>
        <TableHeadCell>Client</TableHeadCell>
        <TableHeadCell class="demo-table-num">Amount</TableHeadCell>
      </TableRow>
    </TableHeader>

    <TableBody>
      <TableRow v-for="(invoice, index) in invoices" :key="invoice.id" :index="index">
        <TableCell>{{ invoice.id }}</TableCell>
        <TableCell>{{ invoice.client }}</TableCell>
        <TableCell class="demo-table-num">{{ money(invoice.amount) }}</TableCell>
      </TableRow>
    </TableBody>

    <TableFooter>
      <TableRow>
        <TableCell colspan="2">Total</TableCell>
        <TableCell class="demo-table-num">{{ money(invoices.reduce((sum, invoice) => sum + invoice.amount, 0)) }}</TableCell>
      </TableRow>
    </TableFooter>
  </TableRoot>
</template>
