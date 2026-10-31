<template>
  <ScrollArea as="nav" fade="y" class="space-y-4 outline-none scrollbar-thumb-current/10 scrollbar-thin">
    <div v-for="item in sidebar" :key="item.text">
      <div class="side-title">{{ item.text }}</div>

      <div class="flex flex-col">
        <a
          v-for="subItem in item.items"
          :key="subItem.link"
          :href="withBase(subItem.link)"
          class="side-link"
          :data-active="isActive(subItem.link) || undefined"
          v-html="path.startsWith('/ui/') ? formatText(subItem.text) : subItem.text"
        />
      </div>
    </div>
  </ScrollArea>
</template>

<script setup lang="ts">
import { withBase } from 'vitepress';
import { ScrollArea } from '@vunset/vue';
import { formatText, useSidebar } from '../sidebar';

const { groups: sidebar, path } = useSidebar();

const isActive = (link: string) => link === path.value;
</script>
