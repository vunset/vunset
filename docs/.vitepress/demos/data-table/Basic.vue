<script setup lang="ts">
import { ref } from 'vue';
import { formatNumber } from '@vunset/vue';
import { DataTable, type DataTableColumn } from '@vunset/vue/data-table';
import type { SortingState } from '@tanstack/vue-table';
import '../table/table.css';
import './data-table.css';

interface Person {
  name: string;
  role: string;
  city: string;
  salary: number;
}

const people: Person[] = [
  { name: 'Ada Lovelace', role: 'Engineer', city: 'London', salary: 98000 },
  { name: 'Alan Turing', role: 'Analyst', city: 'Manchester', salary: 91000 },
  { name: 'Grace Hopper', role: 'Manager', city: 'New York', salary: 112000 },
  { name: 'Katherine Johnson', role: 'Analyst', city: 'Hampton', salary: 87000 },
  { name: 'Linus Torvalds', role: 'Engineer', city: 'Portland', salary: 104000 }
];

const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'city', header: 'City', enableSorting: false },
  { accessorKey: 'salary', header: 'Salary', meta: { class: 'demo-data-table-num' } }
];

const sorting = ref<SortingState>([{ id: 'salary', desc: true }]);

const usd = (value: unknown) => formatNumber(value as number, { currency: 'USD', maximumFractionDigits: 0 });
const sum = (values: unknown[]) => (values as number[]).reduce((total, value) => total + value, 0);
</script>

<template>
  <DataTable v-model:sorting="sorting" :data="people" :columns="columns" class="demo-table demo-data-table">
    <template #cell-salary="{ cell }">{{ usd(cell) }}</template>
    <template #foot-name>Total</template>
    <template #foot-salary="{ getValues }">{{ usd(sum(getValues())) }}</template>
  </DataTable>

  <DemoOutput>v-model:sorting: {{ JSON.stringify(sorting) }}</DemoOutput>
</template>
