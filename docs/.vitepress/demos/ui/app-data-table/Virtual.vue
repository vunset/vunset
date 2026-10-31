<script setup lang="ts">
import { ref } from 'vue';
import { CheckboxRoot, CheckboxIndicator, formatNumber } from '@vunset/vue';
import { AppBadge, AppButton, AppConfirm, AppCopy, AppIcon, AppPopover, FormInput } from '@vunset/ui';
import { AppDataTable, type DataTableColumn } from '@vunset/ui/data-table';

interface Item {
  id: number;
  name: string;
  url: string;
  category: string;
  active: boolean;
  price: number;
}

const CATEGORIES = ['Alpha', 'Beta', 'Gamma'];

const items = ref<Item[]>(
  Array.from({ length: 10000 }, (_, index) => ({
    id: 1000 + index,
    name: `item_${index}_${CATEGORIES[index % 3]!.toLowerCase()}`,
    url: `https://example.com/items/${1000 + index}?view=details&format=json`,
    category: CATEGORIES[index % 3]!,
    active: index % 4 !== 0,
    price: (index * 37) % 2000
  }))
);

const columns: DataTableColumn<Item>[] = [
  { accessorKey: 'id', header: '#', size: 70, enableResizing: true, meta: { pin: 'start' } },
  { accessorKey: 'name', header: 'Name', size: 260 },
  { accessorKey: 'url', header: 'URL' },
  { accessorKey: 'category', header: 'Category', size: 100 },
  { accessorKey: 'active', header: 'Active', size: 80 },
  {
    accessorKey: 'price',
    header: 'Price',
    size: 110,
    cell: ({ getValue }) => formatNumber(getValue<number>(), { currency: 'USD' })
  },
  { id: 'actions', header: '' }
];
</script>

<template>
  <AppDataTable
    :data="items"
    :columns="columns"
    :get-row-id="(row: Item) => String(row.id)"
    virtual
    sticky-header
    striped
    class="max-h-96 w-full"
  >
    <template #cell-name="{ row }">
      <div class="flex items-center gap-2">
        <AppCopy :value="row.name" size="sm" variant="outline" />
        <span class="truncate">{{ row.name }}</span>
      </div>
    </template>

    <template #cell-url="{ cell }">
      <AppButton size="sm" variant="outline">
        <span class="max-w-40 truncate">{{ cell }}</span>
      </AppButton>
    </template>

    <template #cell-category="{ cell }">
      <AppBadge size="sm">{{ cell }}</AppBadge>
    </template>

    <template #cell-active="{ row }">
      <CheckboxRoot v-model="row.active" class="form-checkbox" aria-label="Active">
        <CheckboxIndicator class="form-checkbox-indicator">
          <AppIcon name="checkbox-checked" class="form-icon" />
        </CheckboxIndicator>
      </CheckboxRoot>
    </template>

    <template #cell-price="{ row }">
      <AppPopover lazy :as="AppButton" variant="outline" size="sm" class="w-full">
        <template #trigger>{{ formatNumber(row.price, { currency: 'USD' }) }}</template>

        <template #default="{ close }">
          <form class="flex gap-2" @submit.prevent="close()">
            <FormInput v-model.number="row.price" type="number" aria-label="Price" control-class="w-28" />
            <AppButton variant="solid" tone="accent" type="submit">Save</AppButton>
          </form>
        </template>
      </AppPopover>
    </template>

    <template #cell-actions="{ row }">
      <AppConfirm lazy :title="`Delete ${row.name}?`" confirm-text="Delete">
        <AppButton variant="outline" size="sm" title="Delete" square>
          <AppIcon name="trash" />
        </AppButton>
      </AppConfirm>
    </template>
  </AppDataTable>
</template>
