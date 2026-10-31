<script setup lang="ts">
import { ref, useId } from 'vue';
import { Textarea } from '@vunset/vue';
import './textarea.css';

const id = useId();
const message = ref('');
</script>

<template>
  <div class="demo-textarea-field">
    <label :for="id">Message</label>
    <Textarea :id="id" v-model="message" autosize :rows="1" :max-rows="5" placeholder="Write a message" class="demo-textarea" />
    <p class="demo-textarea-hint">Grows up to five lines, then scrolls.</p>
  </div>
</template>
