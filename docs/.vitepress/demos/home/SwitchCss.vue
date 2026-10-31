<script setup lang="ts">
import { ref } from 'vue';
import { SwitchRoot, SwitchThumb } from '@vunset/vue';

const notifications = ref(true);
</script>

<template>
  <label class="label">
    <SwitchRoot v-model="notifications" class="switch">
      <SwitchThumb class="thumb" />
    </SwitchRoot>
    Notifications
  </label>
</template>

<style>
.label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.switch {
  display: inline-flex;
  width: 2.5rem;
  height: 1.375rem;
  padding: 2px;
  border: 1px solid #333;
  border-radius: 999px;
  background: #111;
  outline: none;
  transition: 150ms;
}

.switch[data-checked] {
  border-color: #a9c98f;
  background: #a9c98f;
}

.switch:focus-visible {
  box-shadow: 0 0 0 3px rgb(169 201 143 / 15%);
}

.thumb {
  aspect-ratio: 1;
  height: 100%;
  border-radius: 999px;
  background: rgb(51 51 51 / 70%);
  transition: 150ms;
}

.thumb[data-checked] {
  translate: 1.125rem 0;
  background: #fff;
  box-shadow: 0 1px 2px rgb(0 0 0 / 25%);
}
</style>
