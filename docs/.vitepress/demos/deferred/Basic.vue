<script setup lang="ts">
import { Deferred, PopoverRoot, PopoverTrigger, Portal, Positioner, Popup } from '@vunset/vue';
import './deferred.css';

const regions = ['North', 'South', 'East', 'West'];
</script>

<template>
  <ul class="demo-deferred-list">
    <li v-for="region in regions" :key="region" class="demo-deferred-row">
      {{ region }}

      <Deferred>
        <template #default="{ pressed }">
          <PopoverRoot :default-open="pressed">
            <PopoverTrigger class="demo-deferred-trigger">Edit</PopoverTrigger>

            <Portal>
              <Positioner>
                <Popup class="demo-deferred-popup">Editing {{ region }}</Popup>
              </Positioner>
            </Portal>
          </PopoverRoot>
        </template>

        <template #placeholder>
          <button type="button" class="demo-deferred-trigger">Edit</button>
        </template>
      </Deferred>
    </li>
  </ul>
</template>
