<script setup lang="ts">
import { computed } from 'vue';

defineOptions({ name: 'AppNumberFlow' });

const props = defineProps<{
  /** The value, as shown: a number, or text already formatted (`$1,234.56`). */
  value: number | string;
  /** Whether the first value animates in too. */
  appear?: boolean;
}>();

const text = computed(() => String(props.value));
</script>

<template>
  <!-- Read once, whole; the characters that animate are hidden from assistive technology. -->
  <span class="app-number-flow">
    <span class="app-number-flow-text">{{ text }}</span>
    <TransitionGroup tag="span" name="app-number-flow" class="app-number-flow-chars" aria-hidden="true" :appear="appear">
      <span
        v-for="(char, index) in text"
        :key="text + index"
        class="app-number-flow-char"
        :style="{ '--app-number-flow-index': index }"
        >{{ char }}</span
      >
    </TransitionGroup>
  </span>
</template>
