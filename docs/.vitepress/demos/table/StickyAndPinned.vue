<script setup lang="ts">
import { ref } from 'vue';
import {
  TableRoot,
  TableCaption,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHeadCell,
  TableCell,
  formatNumber
} from '@vunset/vue';
import './table.css';

const COLUMNS = ['Region', 'Q1', 'Q2', 'Q3', 'Q4', 'Orders', 'Returns', 'Margin', 'Growth', 'Target'];

const rows = Array.from({ length: 40 }, (_, index) => ({
  id: index,
  region: `Region ${String(index + 1).padStart(2, '0')}`,
  values: COLUMNS.slice(1).map((_, column) => Math.round(1200 + Math.sin(index * 3 + column) * 900 + column * 40))
}));

const stickyHeader = ref(true);
const stickyFooter = ref(true);
const pinFirst = ref(true);
</script>

<template>
  <TableRoot
    :sticky-header="stickyHeader"
    :sticky-footer="stickyFooter"
    class="demo-table demo-table-wide"
    style="max-height: 320px"
  >
    <TableCaption>Sales by region</TableCaption>

    <TableHeader>
      <TableRow>
        <TableHeadCell
          v-for="(column, index) in COLUMNS"
          :key="column"
          :pinned="index === 0 && pinFirst ? 'start' : undefined"
          :width="index === 0 ? 140 : undefined"
          :sort="index === 1 ? 'desc' : undefined"
          :class="{ num: index > 0 }"
        >
          {{ column }}
        </TableHeadCell>
      </TableRow>
    </TableHeader>

    <TableBody>
      <TableRow v-for="(row, index) in rows" :key="row.id" :index="index">
        <TableCell :pinned="pinFirst ? 'start' : undefined">{{ row.region }}</TableCell>
        <TableCell v-for="(value, column) in row.values" :key="column" class="demo-table-num">
          {{ formatNumber(value) }}
        </TableCell>
      </TableRow>
    </TableBody>

    <TableFooter>
      <TableRow>
        <TableCell :pinned="pinFirst ? 'start' : undefined">Total</TableCell>
        <TableCell v-for="(_, column) in COLUMNS.slice(1)" :key="column" class="demo-table-num">
          {{ formatNumber(rows.reduce((sum, row) => sum + row.values[column]!, 0)) }}
        </TableCell>
      </TableRow>
    </TableFooter>
  </TableRoot>

  <DemoOutput>
    <span class="demo-table-options">
      <label class="demo-table-option"><input v-model="stickyHeader" type="checkbox" /> Sticky header</label>
      <label class="demo-table-option"><input v-model="stickyFooter" type="checkbox" /> Sticky footer</label>
      <label class="demo-table-option"><input v-model="pinFirst" type="checkbox" /> Pin first column</label>
    </span>
  </DemoOutput>
</template>
