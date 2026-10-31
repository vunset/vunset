<script setup lang="ts">
import { ref } from 'vue';
import { DialogRoot, Portal, DialogBackdrop, Popup, DialogTitle, DialogDescription, DialogClose } from '@vunset/vue';
import '../button/button.css';
import '../input/input.css';
import './dialog.css';

interface User {
  id: number;
  name: string;
  role: string;
}

const users = ref<User[]>([
  { id: 1, name: 'Ada Lovelace', role: 'Owner' },
  { id: 2, name: 'Linus Torvalds', role: 'Maintainer' },
  { id: 3, name: 'Grace Hopper', role: 'Member' }
]);

const editing = ref<User | null>(null);
const open = ref(false);
const draft = ref('');

function edit(user: User) {
  editing.value = user;
  draft.value = user.name;
  open.value = true;
}

function save() {
  if (editing.value) editing.value.name = draft.value;
}
</script>

<template>
  <table class="demo-dialog-table">
    <tbody>
      <tr v-for="user in users" :key="user.id">
        <td>{{ user.name }}</td>
        <td>{{ user.role }}</td>
        <td>
          <!-- one dialog for every row: the row's button opens it through v-model:open -->
          <button class="demo-button" aria-haspopup="dialog" @click="edit(user)">Edit</button>
        </td>
      </tr>
    </tbody>
  </table>

  <DialogRoot v-model:open="open">
    <Portal>
      <DialogBackdrop class="demo-dialog-backdrop" />
      <Popup class="demo-dialog">
        <DialogTitle class="demo-dialog-title">Edit {{ editing?.name }}</DialogTitle>
        <DialogDescription class="demo-dialog-description"
          >Renaming affects every mention of this person.</DialogDescription
        >

        <input v-model="draft" class="demo-input demo-dialog-input" aria-label="Name" />

        <div class="demo-dialog-actions">
          <DialogClose class="demo-button">Cancel</DialogClose>
          <DialogClose class="demo-button" @click="save">Save</DialogClose>
        </div>
      </Popup>
    </Portal>
  </DialogRoot>

  <DemoOutput>v-model:open: {{ open }}</DemoOutput>
</template>
