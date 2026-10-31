<script setup lang="ts">
import { TableRoot, TableHeader, TableBody, TableFooter, TableRow, TableHeadCell, TableCell } from '@vunset/vue';
import './table.css';

const cities = [
  ['Tokyo', 'Japan', 37.4],
  ['Delhi', 'India', 31.0],
  ['Shanghai', 'China', 27.1],
  ['São Paulo', 'Brazil', 22.0],
  ['Mexico City', 'Mexico', 21.8],
  ['Cairo', 'Egypt', 20.9],
  ['Mumbai', 'India', 20.4],
  ['Beijing', 'China', 20.4],
  ['Dhaka', 'Bangladesh', 21.0],
  ['Osaka', 'Japan', 19.2]
] as const;

const total = cities.reduce((sum, [, , people]) => sum + people, 0).toFixed(1);
</script>

<template>
  <TableRoot sticky-header sticky-footer class="demo-table" style="max-height: 224px">
    <TableHeader>
      <TableRow>
        <TableHeadCell>City</TableHeadCell>
        <TableHeadCell>Country</TableHeadCell>
        <TableHeadCell class="demo-table-num">Millions</TableHeadCell>
      </TableRow>
    </TableHeader>

    <TableBody>
      <TableRow v-for="([city, country, people], index) in cities" :key="city" :index="index">
        <TableCell>{{ city }}</TableCell>
        <TableCell>{{ country }}</TableCell>
        <TableCell class="demo-table-num">{{ people }}</TableCell>
      </TableRow>
    </TableBody>

    <TableFooter>
      <TableRow>
        <TableCell colspan="2">Total</TableCell>
        <TableCell class="demo-table-num">{{ total }}</TableCell>
      </TableRow>
    </TableFooter>
  </TableRoot>
</template>
