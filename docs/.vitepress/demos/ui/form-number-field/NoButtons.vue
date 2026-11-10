<script setup lang="ts">
import { FormNumberField } from '@vunset/ui';
</script>

<template>
  <FormNumberField label="Year" :buttons="false" :min="1900" :max="2100" :format="{ useGrouping: false }" placeholder="2026" class="w-56" />
</template>
