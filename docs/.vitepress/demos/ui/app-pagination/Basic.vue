<script setup lang="ts">
import { ref } from 'vue';
import { AppPagination } from '@vunset/ui';

const page = ref(3);
const perPage = ref(10);
const total = 230;
</script>

<template>
  <AppPagination v-model="page" v-model:per-page="perPage" :total="total" />

  <DemoOutput>
    page {{ page }} · items {{ (page - 1) * perPage + 1 }}–{{ Math.min(page * perPage, total) }} of {{ total }}
  </DemoOutput>
</template>
