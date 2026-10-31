<script setup lang="ts">
import { ref } from 'vue';
import { AsyncState, Button, type AsyncStatus } from '@vunset/vue';
import '../button/button.css';
import './async-state.css';

const status = ref<AsyncStatus>('success');
const rates = ref([
  { code: 'EUR', rate: 0.92 },
  { code: 'GBP', rate: 0.79 },
  { code: 'JPY', rate: 149.6 }
]);

function refresh(fails = false) {
  status.value = 'pending';
  setTimeout(() => {
    if (fails) {
      status.value = 'error';
      return;
    }
    rates.value = rates.value.map((row) => ({ ...row, rate: +(row.rate * (0.98 + Math.random() * 0.04)).toFixed(2) }));
    status.value = 'success';
  }, 900);
}
</script>

<template>
  <div class="demo-async-group">
    <div class="demo-async-actions">
      <Button class="demo-button" @click="refresh()">Refresh</Button>
      <Button class="demo-button" @click="refresh(true)">Refresh and fail</Button>
    </div>

    <AsyncState :status="status" :data="rates" soft-loading class="demo-async">
      <template #default="{ status: current }">
        <p v-if="current === 'error'" class="demo-async-banner">Refresh failed: these may be out of date.</p>

        <ul class="demo-async-list">
          <li v-for="row in rates" :key="row.code">
            USD → {{ row.code }} <span>{{ row.rate }}</span>
          </li>
        </ul>
      </template>

      <template #overlay>Refreshing…</template>
    </AsyncState>
  </div>
</template>
