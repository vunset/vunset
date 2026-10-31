<script setup lang="ts">
import { TableHeader, TableBody, TableRow, TableHeadCell, TableCell } from '@vunset/vue';
import { AppTabs, AppTable } from '@vunset/ui';

const tabs = [
  { value: 'asia', label: 'Asia' },
  { value: 'europe', label: 'Europe' }
];

const cities = {
  asia: ['Tokyo', 'Delhi', 'Shanghai', 'Mumbai', 'Beijing', 'Dhaka', 'Osaka', 'Karachi', 'Chongqing', 'Manila', 'Tianjin', 'Jakarta'],
  europe: ['Istanbul', 'Moscow', 'Paris', 'London', 'Madrid', 'Barcelona', 'Saint Petersburg', 'Rome', 'Berlin', 'Milan', 'Athens', 'Kyiv']
};
</script>

<template>
  <div class="flex h-72 w-full max-w-sm flex-col">
    <AppTabs :tabs="tabs" class="app-tabs-fill">
      <template #panel="{ tab }">
        <AppTable sticky-header class="app-table-striped min-h-0 flex-1">
          <TableHeader>
            <TableRow>
              <TableHeadCell>City</TableHeadCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            <TableRow v-for="(city, index) in cities[tab.value as keyof typeof cities]" :key="city" :index="index">
              <TableCell>{{ city }}</TableCell>
            </TableRow>
          </TableBody>
        </AppTable>
      </template>
    </AppTabs>
  </div>
</template>
