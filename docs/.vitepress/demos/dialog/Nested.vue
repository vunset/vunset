<script setup lang="ts">
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
import './dialog.css';
</script>

<template>
  <DialogRoot>
    <DialogTrigger class="demo-button">Settings</DialogTrigger>

    <Portal>
      <DialogBackdrop class="demo-dialog-backdrop" />
      <Popup class="demo-dialog">
        <DialogTitle class="demo-dialog-title">Settings</DialogTitle>
        <DialogDescription class="demo-dialog-description">Account, billing and members.</DialogDescription>

        <div class="demo-dialog-actions">
          <DialogClose class="demo-button">Close</DialogClose>

          <!-- a dialog opened from inside another stacks on top of it -->
          <DialogRoot>
            <DialogTrigger class="demo-button">Invite someone</DialogTrigger>

            <Portal>
              <Popup class="demo-dialog">
                <DialogTitle class="demo-dialog-title">Invite someone</DialogTitle>
                <DialogDescription class="demo-dialog-description">
                  The settings dialog steps back while this one is open.
                </DialogDescription>

                <div class="demo-dialog-actions">
                  <DialogClose class="demo-button">Back</DialogClose>
                  <DialogClose close-all class="demo-button">Done</DialogClose>
                </div>
              </Popup>
            </Portal>
          </DialogRoot>
        </div>
      </Popup>
    </Portal>
  </DialogRoot>
</template>
