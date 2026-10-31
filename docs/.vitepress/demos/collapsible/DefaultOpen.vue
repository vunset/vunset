<script setup lang="ts">
import { CollapsibleRoot, CollapsibleTrigger, CollapsiblePanel } from '@vunset/vue';
import './collapsible.css';
</script>

<template>
  <CollapsibleRoot v-slot="{ open }" default-open class="demo-collapsible">
    <CollapsibleTrigger class="demo-collapsible-trigger">{{ open ? 'Hide' : 'Show' }} order summary</CollapsibleTrigger>

    <CollapsiblePanel class="demo-collapsible-panel">Two items, shipped together. Arrives Thursday.</CollapsiblePanel>
  </CollapsibleRoot>
</template>
