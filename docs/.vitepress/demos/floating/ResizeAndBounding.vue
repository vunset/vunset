<script setup lang="ts">
import { ref } from 'vue';
import {
  Button,
  FloatingRoot,
  FloatingHeader,
  FloatingTitle,
  FloatingClose,
  FloatingResizer,
  Portal,
  Popup,
  ScrollArea,
  type FloatingResize
} from '@vunset/vue';
import '../button/button.css';
import './floating.css';

const open = ref(false);
const bounding = ref(true);
const resize = ref<FloatingResize>('both');
const modes: FloatingResize[] = ['none', 'x', 'y', 'both'];

const lastEvent = ref('—');

function onDrag(left: number, top: number) {
  lastEvent.value = `drag(${Math.round(left)}, ${Math.round(top)})`;
}

function onResize(width: number | null, height: number | null) {
  const size = (value: number | null) => (value === null ? 'auto' : Math.round(value));
  lastEvent.value = `resize(${size(width)}, ${size(height)})`;
}
</script>

<template>
  <div class="demo-floating-stack">
    <Button class="demo-button" @click="open = !open">{{ open ? 'Close' : 'Open' }} panel</Button>

    <fieldset class="demo-floating-controls">
      <legend>Resize</legend>
      <label v-for="mode in modes" :key="mode"><input v-model="resize" type="radio" :value="mode" /> {{ mode }}</label>
    </fieldset>

    <label class="demo-floating-option"
      ><input v-model="bounding" type="checkbox" /> Keep inside the window</label
    >
  </div>

  <FloatingRoot
    v-slot="{ handles }"
    v-model:open="open"
    :resize="resize"
    :bounding="bounding"
    :left="160"
    :top="140"
    :min-width="220"
    :min-height="140"
    @drag="onDrag"
    @resize="onResize"
  >
    <Portal>
      <Popup class="demo-floating">
        <FloatingHeader class="demo-floating-header">
          <FloatingTitle class="demo-floating-title">Inspector</FloatingTitle>
          <FloatingClose class="demo-floating-close">×</FloatingClose>
        </FloatingHeader>

        <ScrollArea class="demo-floating-body" axis="y" fade="y">
          <p>
            The panel is positioned with a <code>transform</code>, so dragging moves a composited layer rather than
            asking for layout on every pointer event.
          </p>
          <p>
            Its size is left to this content until an edge is pulled. Until then the panel is only <em>capped</em> at
            the room it has, which is what lets it open at its natural size and still never run off the screen.
          </p>
          <p>
            The four sides are anchors rather than coordinates: resize the window and a panel that was never dragged
            keeps its distance from the edge it was given.
          </p>
          <p>Drag it, then resize the window again: the anchors are gone, and it is only pulled back inside.</p>
        </ScrollArea>

        <FloatingResizer v-for="handle in handles" :key="handle" :value="handle" class="demo-floating-resizer" />
      </Popup>
    </Portal>
  </FloatingRoot>

  <DemoOutput>last event: {{ lastEvent }}</DemoOutput>
</template>
