<script setup lang="ts">
import { TableHeader, TableBody, TableRow, TableHeadCell, TableCell } from '@vunset/vue';
import { AppTable } from '@vunset/ui';

const cities = [
  ['Tokyo', 'Japan', 'Asia', 37.4, 2194],
  ['Delhi', 'India', 'Asia', 31.0, 1484],
  ['Shanghai', 'China', 'Asia', 27.1, 6341],
  ['São Paulo', 'Brazil', 'South America', 22.0, 1521],
  ['Mexico City', 'Mexico', 'North America', 21.8, 1485],
  ['Cairo', 'Egypt', 'Africa', 20.9, 3085],
  ['Mumbai', 'India', 'Asia', 20.4, 603],
  ['Beijing', 'China', 'Asia', 20.4, 16411],
  ['Dhaka', 'Bangladesh', 'Asia', 21.0, 306],
  ['Osaka', 'Japan', 'Asia', 19.2, 225]
] as const;
</script>

<template>
  <AppTable sticky-header class="app-table-striped max-h-56 w-full max-w-md">
    <TableHeader>
      <TableRow>
        <TableHeadCell pinned="start" :width="128">City</TableHeadCell>
        <TableHeadCell>Country</TableHeadCell>
        <TableHeadCell>Continent</TableHeadCell>
        <TableHeadCell class="app-table-numeric">Millions</TableHeadCell>
        <TableHeadCell class="app-table-numeric">Area, km²</TableHeadCell>
      </TableRow>
    </TableHeader>

    <TableBody>
      <TableRow v-for="([city, country, continent, people, area], index) in cities" :key="city" :index="index">
        <TableCell pinned="start" :width="128">{{ city }}</TableCell>
        <TableCell>{{ country }}</TableCell>
        <TableCell>{{ continent }}</TableCell>
        <TableCell class="app-table-numeric">{{ people.toFixed(1) }}</TableCell>
        <TableCell class="app-table-numeric">{{ area.toLocaleString('en') }}</TableCell>
      </TableRow>
    </TableBody>
  </AppTable>
</template>
