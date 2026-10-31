<script setup lang="ts">
import { ScrollArea } from '@vunset/vue';
import './scroll-area.css';

const columns = ['Component', 'Parts', 'Portal', 'Anchored', 'Dismissable', 'Animated'];
const rows = [
  ['Dialog', '6', 'yes', 'no', 'yes', 'yes'],
  ['Drawer', '7', 'yes', 'no', 'yes', 'yes'],
  ['Popover', '6', 'yes', 'yes', 'yes', 'yes'],
  ['Menu', '10', 'yes', 'yes', 'yes', 'yes'],
  ['Select', '10', 'yes', 'yes', 'yes', 'yes'],
  ['Tooltip', '4', 'yes', 'yes', 'no', 'yes'],
  ['Range', '7', 'no', 'no', 'no', 'no'],
  ['Toast', '5', 'no', 'no', 'yes', 'yes']
];
</script>

<template>
  <div class="demo-scroll-frame">
    <ScrollArea fade class="demo-scroll-area demo-scroll-area-grid">
      <table class="demo-scroll-area-table">
        <thead>
          <tr>
            <th v-for="column in columns" :key="column">{{ column }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row[0]">
            <td v-for="(cell, index) in row" :key="index">{{ cell }}</td>
          </tr>
        </tbody>
      </table>
    </ScrollArea>
  </div>
</template>
