<script setup lang="ts">
import { FloatingRoot, FloatingHeader, FloatingTitle, FloatingClose, FloatingResizer, Portal, Popup } from '../../src';
</script>

<template>
  <FloatingRoot v-slot="{ handles }" default-open resize="both" :left="40" :top="120">
    <Portal>
      <Popup>
        <FloatingHeader>
          <FloatingTitle>Inspector</FloatingTitle>
          <FloatingClose>×</FloatingClose>
        </FloatingHeader>
        <FloatingResizer v-for="handle in handles" :key="handle" :value="handle" />
      </Popup>
    </Portal>
  </FloatingRoot>
</template>
