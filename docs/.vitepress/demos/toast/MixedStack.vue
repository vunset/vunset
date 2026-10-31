<script setup lang="ts">
import { h, ref } from 'vue';
import {
  Button,
  createToastStore,
  useToast,
  ToastViewport,
  ToastRoot,
  ToastTitle,
  ToastDescription,
  ToastClose,
  type ToastPosition
} from '@vunset/vue';
import '../button/button.css';
import './toast.css';

// Toasts of every kind and height in one stack, at any of the six positions.
const store = createToastStore();
const { setToast, updateToast, clearToasts } = useToast(store);

const positions: ToastPosition[] = [
  'top-start',
  'top-center',
  'top-end',
  'bottom-start',
  'bottom-center',
  'bottom-end'
];
const position = ref<ToastPosition>('bottom-end');

const messages: Record<string, { title: string; text: string }> = {
  success: { title: 'Changes saved', text: 'Revision 3 is live.' },
  error: { title: 'Upload failed', text: 'The connection dropped halfway through.' },
  info: { title: 'Heads up', text: 'A new version is available.' },
  warning: { title: 'Storage almost full', text: 'You are using 92% of your quota.' }
};

function notify(type: string) {
  setToast({ ...messages[type], type });
}

function notifyTall() {
  setToast({
    title: 'A taller toast',
    text: 'Toasts are measured, so the stack works with whatever height each one happens to be. This one wraps onto several lines to show the offsets adjusting around it.',
    type: 'info'
  });
}

function notifySticky() {
  setToast({
    title: 'Waiting on you',
    text: 'manualClose keeps this one up until it is dismissed.',
    type: 'warning',
    manualClose: true
  });
}

function notifyRepeat() {
  setToast({ id: 'offline', title: 'No connection', text: 'Retrying…', type: 'error' });
}

async function notifyReplace() {
  setToast({ id: 'upload', title: 'Uploading…', text: 'Sending 24 files.', manualClose: true });
  await new Promise((resolve) => setTimeout(resolve, 1600));
  setToast({ id: 'upload', title: 'Upload complete', text: '24 files sent.', type: 'success' });
}

async function notifyLoading() {
  const id = setToast({ title: 'Uploading…', text: 'Sending 24 files.', type: 'loading' });
  await new Promise((resolve) => setTimeout(resolve, 1600));
  updateToast(id, { title: 'Upload complete', text: '24 files sent.', type: 'success' });
}

function notifyCustom() {
  setToast({
    title: 'Rendered by hand',
    text: 'This one passed its own slot to setToast.',
    slot: () =>
      h(ToastRoot, { class: 'demo-toast demo-toast-custom' }, () => [
        h('span', { class: 'demo-toast-avatar', 'aria-hidden': 'true' }, '◆'),
        h('div', null, [
          h(ToastTitle, { class: 'demo-toast-title' }),
          h(ToastDescription, { class: 'demo-toast-description' })
        ]),
        h(ToastClose, { class: 'demo-toast-close' }, () => '×')
      ])
  });
}
</script>

<template>
  <div class="demo-toast-stack">
    <div class="demo-button-row">
      <Button v-for="type in Object.keys(messages)" :key="type" class="demo-button" @click="notify(type)">{{
        type
      }}</Button>
      <Button class="demo-button" @click="notifyTall">Tall one</Button>
      <Button class="demo-button" @click="notifySticky">Manual close</Button>
      <Button class="demo-button" @click="notifyRepeat">Repeat same id</Button>
      <Button class="demo-button" @click="notifyReplace">Replace by id</Button>
      <Button class="demo-button" @click="notifyLoading">Loading, then update</Button>
      <Button class="demo-button" @click="notifyCustom">Custom slot</Button>
      <Button class="demo-button" @click="clearToasts">Clear</Button>
    </div>

    <label class="demo-toast-option">
      Position
      <select v-model="position">
        <option v-for="option in positions" :key="option" :value="option">{{ option }}</option>
      </select>
    </label>
  </div>

  <ToastViewport :store="store" :position="position" class="demo-toast-viewport">
    <ToastRoot class="demo-toast">
      <div>
        <ToastTitle class="demo-toast-title" />
        <ToastDescription class="demo-toast-description" />
      </div>
      <ToastClose class="demo-toast-close">×</ToastClose>
    </ToastRoot>
  </ToastViewport>
</template>
