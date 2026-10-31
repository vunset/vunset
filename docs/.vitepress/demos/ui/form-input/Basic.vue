<script setup lang="ts">
import { ref } from 'vue';
import { FormInput } from '@vunset/ui';

const name = ref('');
</script>

<template>
  <FormInput v-model="name" label="Name" help="As it appears on your card." placeholder="Ada Lovelace" class="w-72" />

  <DemoOutput>v-model: {{ name }}</DemoOutput>
</template>
