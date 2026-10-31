<script setup lang="ts">
import { usePartProps } from '../../shared/use-part-props';

defineOptions({ name: 'TableCaption', inheritAttrs: false });

const merged = usePartProps({ 'data-part': 'table-caption' });
</script>

<template>
  <caption v-bind="merged">
    <slot />
  </caption>
</template>
