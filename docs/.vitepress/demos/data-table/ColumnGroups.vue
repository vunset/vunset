<script setup lang="ts">
import { formatNumber } from '@vunset/vue';
import { DataTable, type DataTableColumn } from '@vunset/vue/data-table';
import '../table/table.css';
import './data-table.css';

interface Person {
  name: string;
  city: string;
  country: string;
  salary: number;
  bonus: number;
}

const people: Person[] = [
  { name: 'Ada Lovelace', city: 'London', country: 'UK', salary: 98000, bonus: 9000 },
  { name: 'Alan Turing', city: 'Manchester', country: 'UK', salary: 91000, bonus: 6000 },
  { name: 'Grace Hopper', city: 'New York', country: 'USA', salary: 112000, bonus: 12000 },
  { name: 'Linus Torvalds', city: 'Portland', country: 'USA', salary: 104000, bonus: 8000 }
];

const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'name', header: 'Name' },
  {
    id: 'location',
    header: 'Location',
    columns: [
      { accessorKey: 'city', header: 'City' },
      { accessorKey: 'country', header: 'Country' }
    ]
  },
  {
    id: 'pay',
    header: 'Pay',
    columns: [
      { accessorKey: 'salary', header: 'Salary', meta: { class: 'demo-data-table-num' } },
      { accessorKey: 'bonus', header: 'Bonus', meta: { class: 'demo-data-table-num' } }
    ]
  }
];

const usd = (value: unknown) => formatNumber(value as number, { currency: 'USD', maximumFractionDigits: 0 });
</script>

<template>
  <DataTable :data="people" :columns="columns" class="demo-table demo-data-table">
    <template #cell-salary="{ cell }">{{ usd(cell) }}</template>
    <template #cell-bonus="{ cell }">{{ usd(cell) }}</template>
  </DataTable>
</template>
