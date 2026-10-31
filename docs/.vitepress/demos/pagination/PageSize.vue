<script setup lang="ts">
import { computed, ref, useId } from 'vue';
import {
  PaginationRoot,
  PaginationPrev,
  PaginationItem,
  PaginationEllipsis,
  PaginationNext,
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
import './pagination.css';
import '../select/select.css';

const TOTAL = 137;

const labelId = useId();
const page = ref(1);
const perPage = ref(10);

const shown = computed(() => {
  const first = (page.value - 1) * perPage.value + 1;
  return `${first}–${Math.min(first + perPage.value - 1, TOTAL)} of ${TOTAL}`;
});
</script>

<template>
  <PaginationRoot
    v-slot="{ items, setPerPage }"
    v-model="page"
    v-model:per-page="perPage"
    :total="TOTAL"
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

      <SelectRoot
        :model-value="perPage"
        :options="[10, 20, 50]"
        @update:model-value="(size) => setPerPage(Number(size))"
      >
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

  <DemoOutput>v-model: {{ page }}, v-model:per-page: {{ perPage }} (rows {{ shown }})</DemoOutput>
</template>
