<script setup lang="ts">
import { computed, ref } from 'vue';
import { CheckboxRoot, CheckboxIndicator } from '@vunset/vue';
import './checkbox.css';

const all = ['cheese', 'basil', 'chilli'];
const toppings = ref(['cheese']);

const allChecked = computed({
  get: () => toppings.value.length === all.length,
  set: (on: boolean) => (toppings.value = on ? [...all] : [])
});
const someChecked = computed(() => toppings.value.length > 0 && toppings.value.length < all.length);
</script>

<template>
  <div class="demo-checkbox-group">
    <label class="demo-checkbox-label">
      <CheckboxRoot v-model="allChecked" :indeterminate="someChecked" class="demo-checkbox">
        <CheckboxIndicator class="demo-checkbox-indicator" />
      </CheckboxRoot>
      All toppings
    </label>

    <label v-for="topping in all" :key="topping" class="demo-checkbox-label">
      <CheckboxRoot v-model="toppings" :value="topping" class="demo-checkbox">
        <CheckboxIndicator class="demo-checkbox-indicator" />
      </CheckboxRoot>
      {{ topping }}
    </label>
  </div>
</template>
