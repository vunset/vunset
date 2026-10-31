<script setup lang="ts">
import { computed, ref } from 'vue';
import { FormField } from '@vunset/ui';
import { FieldGroup, Input } from '@vunset/vue';

const username = ref('');
const error = computed(() => (username.value.length < 3 ? 'At least three characters.' : undefined));
</script>

<template>
  <FormField label="Username" required :error="error" class="w-72">
    <FieldGroup class="form-control form-input">
      <Input v-model="username" class="form-input-control" placeholder="ada-l" />
    </FieldGroup>
  </FormField>

  <DemoOutput>v-model: {{ username }}</DemoOutput>
</template>
