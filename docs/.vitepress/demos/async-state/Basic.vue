<script setup lang="ts">
import { ref } from 'vue';
import { AsyncState, Button, type AsyncStatus } from '@vunset/vue';
import '../button/button.css';
import './async-state.css';

const people = [
  { id: 1, name: 'Ada Lovelace', role: 'Admin' },
  { id: 2, name: 'Alan Turing', role: 'Editor' },
  { id: 3, name: 'Grace Hopper', role: 'Viewer' }
];

const status = ref<AsyncStatus>('idle');
const users = ref<typeof people>([]);

function load(outcome: 'rows' | 'empty' | 'error') {
  status.value = 'pending';
  users.value = [];
  setTimeout(() => {
    if (outcome === 'error') {
      status.value = 'error';
      return;
    }
    users.value = outcome === 'rows' ? people : [];
    status.value = 'success';
  }, 900);
}
</script>

<template>
  <div class="demo-async-group">
    <div class="demo-async-actions">
      <Button class="demo-button" @click="load('rows')">Load</Button>
      <Button class="demo-button" @click="load('empty')">Load nothing</Button>
      <Button class="demo-button" @click="load('error')">Fail</Button>
    </div>

    <AsyncState :status="status" :data="users" class="demo-async">
      <ul class="demo-async-list">
        <li v-for="user in users" :key="user.id">
          {{ user.name }} <span>{{ user.role }}</span>
        </li>
      </ul>

      <template #idle>Press Load to fetch the team.</template>
      <template #pending>Loading…</template>
      <template #empty>Nobody here yet.</template>
      <template #error>The team couldn’t be loaded.</template>
    </AsyncState>
  </div>

  <DemoOutput>status: {{ status }}</DemoOutput>
</template>
