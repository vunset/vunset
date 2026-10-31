<script setup lang="ts">
import { ref } from 'vue';
import {
  PaginationRoot,
  PaginationPrev,
  PaginationItem,
  PaginationEllipsis,
  PaginationNext,
  Icon
} from '@vunset/vue';
import './pagination.css';

const page = ref(1);
</script>

<template>
  <PaginationRoot v-slot="{ items }" v-model="page" :total-pages="20" class="demo-pagination">
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

  <DemoOutput>v-model: {{ page }}</DemoOutput>
</template>
