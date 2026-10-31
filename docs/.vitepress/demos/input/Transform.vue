<script setup lang="ts">
import { ref, useId } from 'vue';
import { Input, toSeparatedList } from '@vunset/vue';
import './input.css';

const id = useId();
const tags = ref('');

const toTags = (value: string) => toSeparatedList(value.replace(/\s+/g, ','), ',', true);
</script>

<template>
  <div class="demo-input-field">
    <label :for="id">Tags</label>
    <Input :id="id" v-model="tags" :transform="toTags" placeholder="vue forms headless" class="demo-input" />
    <p class="demo-input-hint">Spaces become commas, and repeats drop, once you leave the field or press Enter.</p>
  </div>

  <DemoOutput>v-model: {{ tags }}</DemoOutput>
</template>
