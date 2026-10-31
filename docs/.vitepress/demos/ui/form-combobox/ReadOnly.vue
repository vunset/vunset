<script setup lang="ts">
import { FormCombobox } from '@vunset/ui';
</script>

<template>
  <FormCombobox
    label="Tags"
    multiple
    read-only
    :default-value="['design', 'devops']"
    :options="['design', 'frontend', 'devops']"
    class="w-72"
  />
</template>
