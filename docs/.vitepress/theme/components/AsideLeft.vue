<template>
  <div class="sticky top-(--header-height) h-[calc(100vh-var(--header-height))]">
    <SidebarNav class="pl-6 pr-4 py-8 h-full" />
  </div>
</template>

<script setup lang="ts">
import SidebarNav from './SidebarNav.vue';
</script>
