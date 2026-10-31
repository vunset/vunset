<script setup lang="ts">
import { computed, nextTick, useId, watch } from 'vue';
import {
  PaginationRoot,
  PaginationPrev,
  PaginationNext,
  PaginationItem,
  PaginationEllipsis,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectIndicator,
  SelectList,
  Portal,
  Positioner,
  Popup,
  Icon
} from '@vunset/vue';
import { QueryLink, useQuery } from '../query';
import './pagination.css';
import '../select/select.css';

const ROWS = 137;
const PER_PAGE = 10;

const labelId = useId();
const rowsId = useId();
const { query, push } = useQuery();

const page = computed(() => Math.max(1, Number(query.value.page) || 1));

const perPage = computed({
  get: () => Number(query.value.perPage) || PER_PAGE,
  set: (next) => push({ ...query.value, perPage: next === PER_PAGE ? undefined : next, page: undefined })
});

// Page 1 stays out of the URL.
const to = (next: number) => ({ ...query.value, page: next === 1 ? undefined : next });

const rows = computed(() => {
  const start = (page.value - 1) * perPage.value + 1;
  return Array.from({ length: Math.max(0, Math.min(perPage.value, ROWS - start + 1)) }, (_, i) => start + i);
});

watch(page, async () => {
  await nextTick();
  document.getElementById(rowsId)?.scrollIntoView({ behavior: 'smooth' });
});
</script>

<template>
  <div :id="rowsId" class="demo-pagination-rows">
    <span v-for="row in rows" :key="row">Row {{ row }}</span>
  </div>

  <PaginationRoot
    v-slot="{ items }"
    :model-value="page"
    :total="ROWS"
    :per-page="perPage"
    :link="QueryLink"
    :to
    class="demo-pagination"
  >
    <PaginationPrev class="demo-pagination-button">
      <Icon name="chevron-left" />
    </PaginationPrev>

    <template v-for="item in items" :key="item.key">
      <PaginationItem v-if="item.type === 'page'" :value="item.page" class="demo-pagination-button" />
      <PaginationEllipsis v-else class="demo-pagination-ellipsis" />
    </template>

    <PaginationNext class="demo-pagination-button">
      <Icon name="chevron-right" />
    </PaginationNext>

    <div class="demo-pagination-size">
      <span :id="labelId">Rows per page</span>

      <SelectRoot v-model="perPage" :options="[10, 20, 50]">
        <SelectTrigger :aria-labelledby="labelId" class="demo-select-trigger">
          <SelectValue class="demo-select-value" />
          <SelectIndicator class="demo-select-indicator" :as="Icon" name="grabber" />
        </SelectTrigger>

        <Portal>
          <Positioner>
            <Popup class="demo-select-popup">
              <SelectList :aria-labelledby="labelId" class="demo-select-list" />
            </Popup>
          </Positioner>
        </Portal>
      </SelectRoot>
    </div>
  </PaginationRoot>

  <DemoOutput>query: {{ JSON.stringify(query) }}</DemoOutput>
</template>
