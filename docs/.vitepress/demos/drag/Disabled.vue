<script setup lang="ts">
import { ref } from 'vue';
import { DragRoot, DragItem } from '@vunset/vue';
import './drag.css';

const steps = ref(['Sign in', 'Pick a plan', 'Invite the team', 'Connect a repository', 'Done']);
</script>

<template>
  <DragRoot v-model="steps" class="demo-drag">
    <DragItem v-for="step in steps" :key="step" :value="step" :disabled="step === 'Sign in'" class="demo-drag-item">
      {{ step }}
    </DragItem>
  </DragRoot>
</template>
