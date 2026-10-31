<script setup lang="ts">
import { AppDataTable, type DataTableColumn } from '@vunset/ui/data-table';

interface Item {
  id: string;
  name: string;
  size: number;
  children?: Item[];
}

const files: Item[] = [
  {
    id: 'src',
    name: 'src',
    size: 0,
    children: [
      {
        id: 'src/components',
        name: 'components',
        size: 0,
        children: [
          { id: 'src/components/Button.vue', name: 'Button.vue', size: 4 },
          { id: 'src/components/Dialog.vue', name: 'Dialog.vue', size: 11 }
        ]
      },
      { id: 'src/index.ts', name: 'index.ts', size: 2 }
    ]
  },
  { id: 'docs', name: 'docs', size: 0, children: [{ id: 'docs/index.md', name: 'index.md', size: 3 }] },
  { id: 'package.json', name: 'package.json', size: 1 }
];

const total = (item: Item): number =>
  item.children ? item.children.reduce((sum, child) => sum + total(child), 0) : item.size;

const columns: DataTableColumn<Item>[] = [
  { accessorKey: 'name', header: 'Name' },
  { id: 'size', accessorFn: total, header: 'Size', meta: { class: 'app-table-numeric' } }
];
</script>

<template>
  <AppDataTable
    :data="files"
    :columns="columns"
    :get-row-id="(item: Item) => item.id"
    nested-key="children"
    expand-on-row-click
    class="w-full max-w-md"
  >
    <template #cell-size="{ cell }">{{ cell }} KB</template>
  </AppDataTable>
</template>
