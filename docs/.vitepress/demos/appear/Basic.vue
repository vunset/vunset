<script setup lang="ts">
import { ref } from 'vue';
import { Appear, Button, AlertRoot, AlertTitle, AlertDescription } from '@vunset/vue';
import './appear.css';
import '../button/button.css';
import '../alert/alert.css';

const open = ref(true);
</script>

<template>
  <div class="demo-appear-group">
    <Button class="demo-button" @click="open = !open">{{ open ? 'Hide' : 'Show' }}</Button>

    <Appear :open class="demo-appear">
      <AlertRoot class="demo-alert">
        <AlertTitle class="demo-alert-title">Draft saved!</AlertTitle>
        <AlertDescription class="demo-alert-description">Two seconds ago.</AlertDescription>
      </AlertRoot>
    </Appear>
  </div>
</template>
