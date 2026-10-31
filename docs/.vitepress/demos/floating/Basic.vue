<script setup lang="ts">
import { ref } from 'vue';
import {
  Button,
  FloatingRoot,
  Portal,
  Popup,
  FloatingHeader,
  FloatingTitle,
  FloatingClose,
  FloatingResizer
} from '@vunset/vue';
import '../button/button.css';
import './floating.css';

const open = ref(false);
const at = ref('—');
</script>

<template>
  <Button class="demo-button" @click="open = !open">{{ open ? 'Close' : 'Open' }} inspector</Button>

  <FloatingRoot
    v-slot="{ handles }"
    v-model:open="open"
    resize="both"
    :left="40"
    :top="120"
    :min-width="220"
    :min-height="140"
    @drag="(left, top) => (at = `${Math.round(left)}, ${Math.round(top)}`)"
  >
    <Portal>
      <Popup class="demo-floating">
        <FloatingHeader class="demo-floating-header">
          <FloatingTitle class="demo-floating-title">Inspector</FloatingTitle>
          <FloatingClose class="demo-floating-close">×</FloatingClose>
        </FloatingHeader>

        <div class="demo-floating-body">
          <p>Drag the header to move the panel; double-click it to put it back.</p>
          <p>Pull any edge or corner to resize it.</p>
        </div>

        <FloatingResizer v-for="handle in handles" :key="handle" :value="handle" class="demo-floating-resizer" />
      </Popup>
    </Portal>
  </FloatingRoot>

  <DemoOutput>v-model:open: {{ open }} · @drag: {{ at }}</DemoOutput>
</template>
