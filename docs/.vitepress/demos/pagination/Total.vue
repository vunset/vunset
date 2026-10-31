<script setup lang="ts">
import {
  PaginationRoot,
  PaginationPrev,
  PaginationItem,
  PaginationEllipsis,
  PaginationNext,
  Icon
} from '@vunset/vue';
import './pagination.css';
</script>

<template>
  <PaginationRoot v-slot="{ items }" :total="95" :per-page="10" class="demo-pagination">
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
  </PaginationRoot>
</template>
