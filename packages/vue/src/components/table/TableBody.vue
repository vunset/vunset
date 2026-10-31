<script setup lang="ts">
import { usePartProps } from '../../shared/use-part-props';

defineOptions({ name: 'TableBody', inheritAttrs: false });

const merged = usePartProps({ 'data-part': 'table-body' });
</script>

<template>
  <tbody v-bind="merged">
    <slot />
  </tbody>
</template>
