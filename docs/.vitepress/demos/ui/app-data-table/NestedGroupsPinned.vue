<script setup lang="ts">
import { ref } from 'vue';
import { formatNumber, formatDate } from '@vunset/vue';
import { AppDataTable, type DataTableColumn } from '@vunset/ui/data-table';
import { FormSwitch } from '@vunset/ui';
import type { SortingState } from '@tanstack/vue-table';

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

const people: Person[] = TEAMS.map((team, t) => ({
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

for (const team of people) team.salary = team.members!.reduce((sum, person) => sum + person.salary, 0);

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
  { accessorKey: 'salary', header: 'Salary', meta: { class: 'app-table-numeric' } }
];

const usd = (value: unknown) => formatNumber(value as number, { currency: 'USD', maximumFractionDigits: 0 });

const stickyHeader = ref(true);
const expandOnRowClick = ref(true);
const sorting = ref<SortingState>([]);
</script>

<template>
  <div class="grid w-full gap-3">
    <div class="flex gap-6">
      <FormSwitch v-model="stickyHeader" label="Sticky header" />
      <FormSwitch v-model="expandOnRowClick" label="Expand on row click" />
    </div>

    <AppDataTable
      v-model:sorting="sorting"
      class="max-h-80 w-full"
      :data="people"
      :columns="columns"
      :get-row-id="(row: Person) => row.id"
      nested-key="members"
      :sticky-header
      sticky-footer
      :expand-on-row-click
    >
      <template #cell-salary="{ cell }">{{ usd(cell) }}</template>
      <template #cell-started="{ cell, depth }">{{ depth ? formatDate(cell) : '' }}</template>
      <template #foot-name>Total</template>
      <template #foot-salary="{ getValues }">
        {{ usd((getValues() as number[]).reduce((sum, value) => sum + value, 0)) }}
      </template>
    </AppDataTable>
  </div>

  <DemoOutput>sorting: {{ JSON.stringify(sorting) }}</DemoOutput>
</template>
