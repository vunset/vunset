<script setup lang="ts">
import { TabsRoot, TabsList, TabsTab, TabsPanel } from '@vunset/vue';
import './tabs.css';
</script>

<template>
  <TabsRoot default-value="overview" class="demo-tabs">
    <TabsList class="demo-tabs-list">
      <TabsTab value="overview" class="demo-tabs-tab">Overview</TabsTab>
      <TabsTab value="activity" disabled class="demo-tabs-tab">Activity</TabsTab>
      <TabsTab value="settings" class="demo-tabs-tab">Settings</TabsTab>
    </TabsList>

    <div class="demo-tabs-panels">
      <TabsPanel value="overview" class="demo-tabs-panel">The project at a glance.</TabsPanel>
      <TabsPanel value="activity" class="demo-tabs-panel">What changed, and who changed it.</TabsPanel>
      <TabsPanel value="settings" class="demo-tabs-panel">Name, visibility and members.</TabsPanel>
    </div>
  </TabsRoot>
</template>
