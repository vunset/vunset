<script setup lang="ts">
import { ref } from 'vue';
import { formatNumber } from '@vunset/vue';
import { AppDataTable, type DataTableColumn } from '@vunset/ui/data-table';
import type { ColumnSizingState, SortingState } from '@tanstack/vue-table';

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
  { accessorKey: 'name', header: 'Name', size: 180, enableResizing: true },
  { accessorKey: 'role', header: 'Role', enableResizing: true },
  { accessorKey: 'city', header: 'City', enableSorting: false },
  { accessorKey: 'salary', header: 'Salary', meta: { class: 'app-table-numeric' } }
];

const sorting = ref<SortingState>([{ id: 'salary', desc: true }]);
const sizing = ref<ColumnSizingState>({});

const usd = (value: unknown) => formatNumber(value as number, { currency: 'USD', maximumFractionDigits: 0 });
const sum = (values: unknown[]) => (values as number[]).reduce((total, value) => total + value, 0);
</script>

<template>
  <AppDataTable v-model:sorting="sorting" v-model:column-sizing="sizing" :data="people" :columns="columns" class="w-full">
    <template #cell-salary="{ cell }">{{ usd(cell) }}</template>
    <template #foot-name>Total</template>
    <template #foot-salary="{ getValues }">{{ usd(sum(getValues())) }}</template>
  </AppDataTable>

  <DemoOutput>
    v-model:sorting: {{ JSON.stringify(sorting) }}<br />
    v-model:column-sizing: {{ JSON.stringify(sizing) }}
  </DemoOutput>
</template>
