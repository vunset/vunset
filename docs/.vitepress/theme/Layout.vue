<template>
  <Home v-if="frontmatter.layout === 'home'" />
  <NotFound v-else-if="page.isNotFound" />
  <Article v-else />
</template>

<script setup lang="ts">
import Home from './pages/Home.vue';
import NotFound from './pages/NotFound.vue';
import Article from './pages/Article.vue';
import { useData } from 'vitepress';

const { frontmatter, page } = useData();
</script>
