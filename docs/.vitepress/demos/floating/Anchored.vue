<script setup lang="ts">
import { ref } from 'vue';
import { Button, FloatingRoot, Portal, Popup, FloatingHeader, FloatingTitle, FloatingClose } from '@vunset/vue';
import '../button/button.css';
import './floating.css';

const open = ref(false);
</script>

<template>
  <Button class="demo-button" @click="open = !open">{{ open ? 'Close' : 'Open' }} notes</Button>

  <FloatingRoot v-model:open="open" :right="24" :bottom="24">
    <Portal>
      <Popup class="demo-floating">
        <FloatingHeader class="demo-floating-header">
          <FloatingTitle class="demo-floating-title">Notes</FloatingTitle>
          <FloatingClose class="demo-floating-close">×</FloatingClose>
        </FloatingHeader>

        <div class="demo-floating-body">
          <p>Opens 24px from the bottom-right corner, and stays there as the window resizes, until it is dragged.</p>
        </div>
      </Popup>
    </Portal>
  </FloatingRoot>
</template>
