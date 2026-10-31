<script lang="ts">
export interface DeferredState {
  /** It was mounted by a press, not a pointer arriving: what it holds should open at once. */
  pressed: boolean;
}
</script>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Part } from '../../shared/part';
import { onRecycle } from '../../shared/recycle';

defineOptions({ name: 'Deferred' });

const props = defineProps<{
  /** Mounts the content now, without waiting. Once mounted it stays. */
  eager?: boolean;
}>();

defineSlots<{
  /** Mounted when a pointer enters the placeholder or it is pressed, in its place. */
  default(props: DeferredState): unknown;
  /** One element or component standing in until then. It takes the listeners; it renders no wrapper. */
  placeholder?(): unknown;
}>();

const ready = ref(props.eager);
const pressed = ref(false);

watch(
  () => props.eager,
  (eager) => {
    if (eager) ready.value = true;
  }
);

onRecycle(() => {
  ready.value = props.eager;
  pressed.value = false;
});

// A pointer arrives before it presses, so the press lands on the real content.
function onPointerenter(): void {
  ready.value = true;
}

// Pressed with no pointer first: a key, or a script. The content opens as it mounts.
function onClick(): void {
  pressed.value = true;
  ready.value = true;
}
</script>

<template>
  <slot v-if="ready" :pressed="pressed" />
  <Part v-else as="child" data-part="deferred" @pointerenter="onPointerenter" @click="onClick">
    <slot name="placeholder" />
  </Part>
</template>
