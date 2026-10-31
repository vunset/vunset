<script setup lang="ts">
import { ref } from 'vue';
import { AsyncState, Button, Icon, type AsyncStatus } from '@vunset/vue';
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

    <AsyncState :status="status" :data="users" soft-loading class="demo-async demo-async-flush">
      <template #default="{ status: current }">
        <p v-if="current === 'error'" class="demo-async-banner">Reload failed: showing what was there before.</p>

        <table class="demo-async-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.name }}</td>
              <td>{{ user.role }}</td>
            </tr>
          </tbody>
        </table>
      </template>

      <template #idle>
        <div class="demo-async-message">
          <h3>Nothing loaded yet</h3>
          <p>Press Load to fetch the team.</p>
        </div>
      </template>

      <template #pending>
        <div class="demo-async-message">
          <span class="demo-async-spinner" />
          <h3>Please wait</h3>
        </div>
      </template>

      <template #empty>
        <div class="demo-async-message">
          <Icon name="search" inline class="demo-async-icon" />
          <h3>No one found</h3>
          <p>Nobody matches.</p>
        </div>
      </template>

      <template #error>
        <div class="demo-async-message">
          <Icon name="times" inline class="demo-async-icon" />
          <h3>Something went wrong</h3>
          <p>The team couldn’t be loaded.</p>
        </div>
      </template>

      <template #overlay>
        <span class="demo-async-spinner" />
      </template>
    </AsyncState>
  </div>

  <DemoOutput>status: {{ status }}</DemoOutput>
</template>
