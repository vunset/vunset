<script setup lang="ts">
import { useChartPart } from './ChartRoot.vue';

defineOptions({ name: 'ChartCrosshair' });

useChartPart('crosshair', () => ({}));
</script>

<template></template>
