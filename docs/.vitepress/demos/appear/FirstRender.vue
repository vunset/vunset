<script setup lang="ts">
import { ref } from 'vue';
import { Appear, Button, AlertRoot, AlertTitle } from '@vunset/vue';
import './appear.css';
import '../button/button.css';
import '../alert/alert.css';

const key = ref(0);
</script>

<template>
  <div class="demo-appear-group">
    <Button class="demo-button" @click="key++">Mount again</Button>

    <div :key class="demo-appear-group">
      <Appear class="demo-appear">
        <AlertRoot class="demo-alert">
          <AlertTitle class="demo-alert-title">Animates in</AlertTitle>
        </AlertRoot>
      </Appear>

      <Appear :appear="false" class="demo-appear">
        <AlertRoot class="demo-alert">
          <AlertTitle class="demo-alert-title">Just there</AlertTitle>
        </AlertRoot>
      </Appear>
    </div>
  </div>
</template>
