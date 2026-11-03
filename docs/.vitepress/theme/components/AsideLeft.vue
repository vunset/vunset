<template>
  <div class="sticky top-(--header-height) h-[calc(100vh-var(--header-height))]">
    <SidebarNav class="px-3.5 py-6 h-full" />
  </div>
</template>

<script setup lang="ts">
import SidebarNav from './SidebarNav.vue';
</script>
