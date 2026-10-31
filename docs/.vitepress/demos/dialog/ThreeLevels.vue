<script setup lang="ts">
import { ref } from 'vue';
import {
  DialogRoot,
  DialogTrigger,
  Portal,
  DialogBackdrop,
  Popup,
  DialogTitle,
  DialogDescription,
  DialogClose
} from '@vunset/vue';
import '../button/button.css';
import '../input/input.css';
import './dialog.css';

const name = ref('');
</script>

<template>
  <DialogRoot outside-press>
    <DialogTrigger class="demo-button">Rename project</DialogTrigger>

    <Portal>
      <DialogBackdrop class="demo-dialog-backdrop" />
      <Popup class="demo-dialog">
        <DialogTitle class="demo-dialog-title">Rename project</DialogTitle>
        <DialogDescription class="demo-dialog-description">
          The backdrop closes this level only. Esc closes the one in front.
        </DialogDescription>

        <input v-model="name" class="demo-input demo-dialog-input" aria-label="New name" placeholder="New name" />

        <div class="demo-dialog-actions">
          <DialogRoot>
            <DialogTrigger class="demo-button">Cancel</DialogTrigger>

            <Portal>
              <Popup class="demo-dialog">
                <DialogTitle class="demo-dialog-title">Discard changes?</DialogTitle>
                <DialogDescription class="demo-dialog-description"
                  >The name you typed will not be saved.</DialogDescription
                >

                <div class="demo-dialog-actions">
                  <DialogRoot>
                    <DialogTrigger class="demo-button">Discard?</DialogTrigger>

                    <Portal>
                      <Popup class="demo-dialog">
                        <DialogTitle class="demo-dialog-title">Are you really sure?</DialogTitle>

                        <div class="demo-dialog-actions">
                          <DialogClose class="demo-button">Go back</DialogClose>
                          <DialogClose class="demo-button" close-all>Discard</DialogClose>
                        </div>
                      </Popup>
                    </Portal>
                  </DialogRoot>

                  <DialogClose class="demo-button">Keep editing</DialogClose>
                  <DialogClose class="demo-button" close-all>Discard</DialogClose>
                </div>
              </Popup>
            </Portal>
          </DialogRoot>

          <DialogClose class="demo-button">Save</DialogClose>
        </div>
      </Popup>
    </Portal>
  </DialogRoot>

  <DemoOutput>name: {{ name || '—' }}</DemoOutput>
</template>
