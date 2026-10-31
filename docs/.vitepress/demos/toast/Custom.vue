<script setup lang="ts">
import { h } from 'vue';
import {
  Button,
  createToastStore,
  useToast,
  ToastViewport,
  ToastRoot,
  ToastTitle,
  ToastDescription,
  ToastClose
} from '@vunset/vue';
import '../button/button.css';
import './toast.css';

const store = createToastStore();
const { setToast } = useToast(store);

function mention() {
  setToast({
    title: 'Ada mentioned you',
    text: '“Can you check the Q4 numbers?”',
    // the parts inside still read this toast's title and text
    slot: () =>
      h(ToastRoot, { class: 'demo-toast demo-toast-custom' }, () => [
        h('span', { class: 'demo-toast-avatar', 'aria-hidden': 'true' }, 'AL'),
        h('div', null, [
          h(ToastTitle, { class: 'demo-toast-title' }),
          h(ToastDescription, { class: 'demo-toast-description' })
        ]),
        h(ToastClose, { class: 'demo-toast-close' }, () => '×')
      ])
  });
}

function save() {
  setToast({ title: 'Changes saved' });
}
</script>

<template>
  <div class="demo-button-row">
    <Button class="demo-button" @click="mention">Mention</Button>
    <Button class="demo-button" @click="save">Save</Button>
  </div>

  <ToastViewport :store="store" class="demo-toast-viewport">
    <ToastRoot class="demo-toast">
      <div>
        <ToastTitle class="demo-toast-title" />
        <ToastDescription class="demo-toast-description" />
      </div>
      <ToastClose class="demo-toast-close">×</ToastClose>
    </ToastRoot>
  </ToastViewport>
</template>
