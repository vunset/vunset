<script setup lang="ts">
import { CollapsibleRoot, CollapsibleTrigger, CollapsiblePanel } from '@vunset/vue';
import './collapsible.css';
</script>

<template>
  <CollapsibleRoot v-slot="{ open }" class="demo-collapsible">
    <CollapsibleTrigger class="demo-collapsible-trigger">{{ open ? 'Hide' : 'Show' }} details</CollapsibleTrigger>

    <CollapsiblePanel class="demo-collapsible-panel">
      Shipped from Paris on 2 October. Two parcels; the second follows in a few days.
    </CollapsiblePanel>
  </CollapsibleRoot>
</template>
