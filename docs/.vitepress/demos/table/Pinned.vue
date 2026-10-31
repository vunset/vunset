<script setup lang="ts">
import { computed, ref } from 'vue';
import { TableRoot, TableHeader, TableBody, TableRow, TableHeadCell, TableCell } from '@vunset/vue';
import './table.css';

const quarters = ['Q1', 'Q2', 'Q3', 'Q4'] as const;
const regions = [
  { name: 'North', Q1: 120, Q2: 135, Q3: 128, Q4: 160 },
  { name: 'South', Q1: 98, Q2: 102, Q3: 117, Q4: 121 },
  { name: 'East', Q1: 143, Q2: 139, Q3: 150, Q4: 171 },
  { name: 'West', Q1: 87, Q2: 95, Q3: 101, Q4: 99 }
];

type Key = (typeof quarters)[number] | 'total';
const sortBy = ref<Key>('total');
const direction = ref<'asc' | 'desc'>('desc');

const rows = computed(() =>
  regions
    .map((region) => ({ ...region, total: quarters.reduce((sum, q) => sum + region[q], 0) }))
    .sort((a, b) => (a[sortBy.value] - b[sortBy.value]) * (direction.value === 'asc' ? 1 : -1))
);

function sort(key: Key) {
  direction.value = sortBy.value === key && direction.value === 'desc' ? 'asc' : 'desc';
  sortBy.value = key;
}

const sortOf = (key: Key) => (sortBy.value === key ? direction.value : false);
</script>

<template>
  <TableRoot class="demo-table" style="width: 320px">
    <TableHeader>
      <TableRow>
        <TableHeadCell pinned="start" :width="96">Region</TableHeadCell>
        <TableHeadCell v-for="q in quarters" :key="q" :sort="sortOf(q)" :width="112" class="demo-table-num">
          <button type="button" class="demo-table-sort" @click="sort(q)">{{ q }}</button>
        </TableHeadCell>
        <TableHeadCell pinned="end" :sort="sortOf('total')" :width="96" class="demo-table-num">
          <button type="button" class="demo-table-sort" @click="sort('total')">Total</button>
        </TableHeadCell>
      </TableRow>
    </TableHeader>

    <TableBody>
      <TableRow v-for="(row, index) in rows" :key="row.name" :index="index">
        <TableCell pinned="start" :width="96">{{ row.name }}</TableCell>
        <TableCell v-for="q in quarters" :key="q" :width="112" class="demo-table-num">{{ row[q] }}</TableCell>
        <TableCell pinned="end" :width="96" class="demo-table-num">{{ row.total }}</TableCell>
      </TableRow>
    </TableBody>
  </TableRoot>
</template>
