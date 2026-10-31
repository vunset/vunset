<script setup lang="ts">
import { ref, useId } from 'vue';
import { Textarea } from '@vunset/vue';
import './textarea.css';

const id = useId();
const bio = ref('');
</script>

<template>
  <div class="demo-textarea-field">
    <label :for="id">Bio</label>
    <Textarea :id="id" v-model="bio" :rows="3" :max-length="160" placeholder="A line or two about you" class="demo-textarea" />
    <p class="demo-textarea-hint">{{ bio.length }}/160</p>
  </div>
</template>
