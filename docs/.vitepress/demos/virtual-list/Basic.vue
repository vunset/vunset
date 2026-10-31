<script setup lang="ts">
import { ref } from 'vue';
import { Button, useVirtualList, formatNumber } from '@vunset/vue';
import '../button/button.css';
import './virtual-list.css';

const COUNT = 10000;
// 2.25rem, as the row's CSS draws it.
const ROW_HEIGHT = 36;

const people = Array.from({ length: COUNT }, (_, index) => ({
  id: index + 1,
  name: ['Ada', 'Grace', 'Alan', 'Edsger', 'Barbara', 'Donald'][index % 6]
}));

const scroller = ref<HTMLElement>();
const list = ref<HTMLElement>();

const { visible, before, after, start, end, scrollToIndex } = useVirtualList({
  items: people,
  itemHeight: ROW_HEIGHT,
  scroller,
  list
});
</script>

<template>
  <div class="demo-virtual-list-stack">
    <Button class="demo-button" @click="scrollToIndex(4999)">Go to row 5,000</Button>
    <div ref="scroller" class="demo-virtual-scroller">
      <ul ref="list" class="demo-virtual-list" :style="{ paddingTop: `${before}px`, paddingBottom: `${after}px` }">
        <li v-for="person in visible" :key="person.id" class="demo-virtual-row">
          <b>{{ formatNumber(person.id) }}</b>{{ person.name }}
        </li>
      </ul>
    </div>
  </div>
  <DemoOutput>drawn: rows {{ start + 1 }}–{{ end }} of {{ formatNumber(COUNT) }}</DemoOutput>
</template>
