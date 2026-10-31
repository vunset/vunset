<script setup lang="ts">
import { ref } from 'vue';
import { formatDate, formatNumber } from '@vunset/vue';
import { DataTable, type DataTableColumn } from '@vunset/vue/data-table';
import '../table/table.css';
import './data-table.css';

interface Person {
  id: string;
  name: string;
  role: string;
  city: string;
  country: string;
  salary: number;
  started: string;
  members?: Person[];
}

const CITIES = [
  ['Berlin', 'Germany'],
  ['Lisbon', 'Portugal'],
  ['Toronto', 'Canada'],
  ['Osaka', 'Japan'],
  ['Austin', 'USA']
] as const;

const TEAMS = ['Platform', 'Design', 'Growth', 'Support'];
const ROLES = ['Engineer', 'Designer', 'Analyst', 'Manager', 'Writer'];

const data: Person[] = TEAMS.map((team, t) => ({
  id: `team-${t}`,
  name: team,
  role: 'Team',
  city: '—',
  country: '—',
  salary: 0,
  started: '2020-01-01',
  members: Array.from({ length: 4 + t }, (_, m) => {
    const [city, country] = CITIES[(t + m) % CITIES.length]!;
    return {
      id: `p-${t}-${m}`,
      name: `${team} person ${m + 1}`,
      role: ROLES[(t * 2 + m) % ROLES.length]!,
      city,
      country,
      salary: 52000 + ((t * 7 + m * 13) % 11) * 4100,
      started: `20${18 + ((t + m) % 7)}-0${1 + (m % 9)}-1${m % 9}`
    };
  })
}));

for (const team of data) team.salary = team.members!.reduce((sum, person) => sum + person.salary, 0);

const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'name', header: 'Name', size: 200, enableResizing: true, meta: { pin: 'start' } },
  { accessorKey: 'role', header: 'Role' },
  {
    id: 'location',
    header: 'Location',
    columns: [
      { accessorKey: 'city', header: 'City' },
      { accessorKey: 'country', header: 'Country' }
    ]
  },
  { accessorKey: 'started', header: 'Started', sortFn: 'datetime' },
  { accessorKey: 'salary', header: 'Salary', meta: { class: 'demo-data-table-num' } }
];

const usd = (value: unknown) => formatNumber(value as number, { currency: 'USD', maximumFractionDigits: 0 });
const sum = (values: unknown[]) => (values as number[]).reduce((total, value) => total + value, 0);

const stickyHeader = ref(true);
const stickyFooter = ref(true);
const expandOnRowClick = ref(true);
</script>

<template>
  <DataTable
    :data="data"
    :columns="columns"
    :get-row-id="(row: Person) => row.id"
    nested-key="members"
    :sticky-header="stickyHeader"
    :sticky-footer="stickyFooter"
    :expand-on-row-click="expandOnRowClick"
    class="demo-table demo-data-table demo-data-table-edges"
    style="max-height: 320px"
  >
    <template #cell-salary="{ cell }">{{ usd(cell) }}</template>
    <template #cell-started="{ cell, depth }">{{ depth ? formatDate(cell) : '' }}</template>
    <template #foot-name>Total</template>
    <template #foot-salary="{ getValues }">{{ usd(sum(getValues())) }}</template>
  </DataTable>

  <DemoOutput>
    <span class="demo-data-table-options">
      <label class="demo-data-table-option"><input v-model="stickyHeader" type="checkbox" /> Sticky header</label>
      <label class="demo-data-table-option"><input v-model="stickyFooter" type="checkbox" /> Sticky footer</label>
      <label class="demo-data-table-option">
        <input v-model="expandOnRowClick" type="checkbox" /> Expand on row click
      </label>
    </span>
  </DemoOutput>
</template>
