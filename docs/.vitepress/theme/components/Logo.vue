<script setup lang="ts">
import { onUnmounted, ref, useId } from 'vue';

const MARK = { x: 0.4, y: 0.4, width: 40.8, height: 31.2 };

const gradient = useId();
const svg = ref<SVGSVGElement | null>(null);
const REST = { x: MARK.x + MARK.width / 2, y: MARK.y + MARK.height / 2 };
const center = ref({ ...REST });

let target = { ...center.value };
let frame = 0;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const step = () => {
  const { x, y } = center.value;
  const dx = target.x - x;
  const dy = target.y - y;

  if (Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05) {
    center.value = target;
    frame = 0;
    return;
  }

  center.value = { x: x + dx * 0.15, y: y + dy * 0.15 };
  frame = requestAnimationFrame(step);
};

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

const moveTo = (point: { x: number; y: number }) => {
  target = point;
  frame ||= requestAnimationFrame(step);
};

const follow = (event: PointerEvent) => {
  const matrix = svg.value?.getScreenCTM()?.inverse();
  if (!matrix || reduced()) return;

  const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix);
  moveTo({
    x: clamp(point.x, MARK.x, MARK.x + MARK.width),
    y: clamp(point.y, MARK.y, MARK.y + MARK.height)
  });
};

const settle = () => moveTo({ ...REST });

onUnmounted(() => cancelAnimationFrame(frame));
</script>

<template>
  <svg
    ref="svg"
    @pointermove="follow"
    @pointerleave="settle"
    width="129"
    height="32"
    viewBox="0 0 129 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M28.1 23.5L20.8 31.2V16.6L28.1 12.4V23.5Z M40.8 9.8L30 21.3L30.2 11.2L40.8 5V9.8Z"
      fill="currentColor"
      fill-opacity="var(--face)"
      :style="{ '--face': 0.2 }"
    />

    <path
      d="M20.8 16.6V31.2L0.8 9.8V5L20.8 16.6Z M30.3 11.2L30 21.3L28.1 20.1V12.5L22.9 9.4V6.9L30.3 11.2Z"
      fill="currentColor"
      fill-opacity="var(--face)"
      :style="{ '--face': 0.3 }"
    />

    <path
      d="M28.1 12.4L20.8 16.6L0.8 5L8.1 0.8L28.1 12.4Z M40.8 5L30.2 11.2L22.9 6.9L33.4 0.8L40.8 5Z"
      fill="currentColor"
      fill-opacity="var(--face)"
      :style="{ '--face': 0.5 }"
    />

    <path
      d="M33.3 0.4C33.4 0.4 33.5 0.4 33.6 0.4L40.9 4.6L40.9 4.6L40.9 4.6C41 4.7 41 4.7 41.1 4.7C41.1 4.8 41.1 4.9 41.1 5V9.8C41.1 9.8 41.1 9.9 41 10L30.3 21.5C30.2 21.6 30.1 21.6 30 21.6C30 21.6 30 21.6 30 21.6C30 21.6 30 21.6 29.9 21.6C29.9 21.6 29.9 21.6 29.9 21.6C29.9 21.6 29.9 21.6 29.9 21.6C29.9 21.6 29.8 21.6 29.8 21.6L28.5 20.8V23.5C28.5 23.6 28.5 23.7 28.4 23.7L21.1 31.5C21 31.5 21 31.6 20.9 31.6C20.9 31.6 20.9 31.6 20.9 31.6C20.9 31.6 20.9 31.6 20.8 31.6C20.8 31.6 20.8 31.6 20.8 31.6H20.8C20.7 31.6 20.7 31.6 20.7 31.6C20.7 31.6 20.6 31.6 20.6 31.6C20.6 31.6 20.6 31.6 20.6 31.6C20.6 31.5 20.5 31.5 20.5 31.5L0.5 10.1C0.4 10 0.4 9.9 0.4 9.8V5C0.4 4.9 0.5 4.8 0.6 4.7L0.6 4.7L7.9 0.5L8 0.5C8.1 0.5 8.2 0.5 8.3 0.5L22.5 8.7V6.9C22.5 6.8 22.6 6.7 22.7 6.6C22.7 6.6 22.7 6.6 22.7 6.6L33.3 0.4L33.3 0.4ZM21.2 16.8V30.3L27.7 23.3V13.1L21.2 16.8ZM1.1 9.7L20.4 30.3V16.8L1.1 5.7V9.7ZM23.2 9.2L23.6 9.4L28.3 12.1C28.4 12.2 28.5 12.3 28.5 12.4V12.4C28.5 12.5 28.5 12.5 28.5 12.5V19.9L29.7 20.6L29.9 11.4L23.2 7.6V9.2ZM30.6 11.4L30.4 20.3L40.4 9.6V5.6L30.6 11.4ZM1.5 5L20.8 16.2L27.3 12.4L23.2 10L8.1 1.3L1.5 5ZM23.6 6.9L30.2 10.8L40 5L33.4 1.2L23.6 6.9Z"
      fill-rule="evenodd"
      clip-rule="evenodd"
      :fill="`url(#${gradient})`"
    />

    <path
      d="M56.8 23L51.6 9.3H53.7L58.3 21.8H57.7L62.3 9.3H64.3L59.1 23H56.8ZM71.4 23.2C69.7 23.2 68.3 22.7 67.4 21.7C66.4 20.6 66 19.2 66 17.3V9.3H68V17.5C68 18.8 68.3 19.8 68.9 20.5C69.5 21.1 70.3 21.5 71.4 21.5C72.5 21.5 73.4 21.1 74 20.5C74.6 19.8 74.9 18.8 74.9 17.5V9.3H76.9V17.3C76.9 19.2 76.4 20.6 75.4 21.7C74.5 22.7 73.2 23.2 71.4 23.2ZM79.6 23V9.3H81.9L89.1 21L88.7 21.1V9.3H90.6V23H88.3L81 11.3L81.5 11.2V23H79.6ZM98.4 23.2C96.8 23.2 95.4 22.8 94.5 22C93.5 21.2 92.9 20.1 92.7 18.6H94.7C94.8 19.6 95.2 20.3 95.8 20.8C96.5 21.3 97.3 21.5 98.4 21.5C99.4 21.5 100.1 21.4 100.5 21C101 20.7 101.3 20.2 101.3 19.6C101.3 19 101.1 18.5 100.8 18.2C100.5 17.9 100 17.6 99.3 17.4L96.9 16.6C95.7 16.2 94.8 15.7 94.2 15.1C93.7 14.5 93.4 13.8 93.4 12.9C93.4 12.1 93.6 11.4 93.9 10.9C94.3 10.3 94.9 9.9 95.6 9.6C96.3 9.3 97.1 9.1 98 9.1C99.5 9.1 100.6 9.5 101.5 10.2C102.4 10.9 102.9 11.9 103 13.2H101C100.9 12.4 100.6 11.7 100.1 11.4C99.6 10.9 98.9 10.7 98 10.7C97.1 10.7 96.5 10.9 96 11.2C95.5 11.6 95.3 12 95.3 12.6C95.3 13.1 95.5 13.5 95.8 13.8C96.1 14.2 96.6 14.4 97.3 14.7L99.8 15.5C101 15.8 101.8 16.3 102.4 17C102.9 17.6 103.2 18.4 103.2 19.4C103.2 20.6 102.8 21.5 101.9 22.2C101.1 22.8 99.9 23.2 98.4 23.2ZM105.3 23V9.3H107.3V23H105.3ZM106.3 23V21.3H114.8V23H106.3ZM106.3 16.7V15.1H114.1V16.7H106.3ZM106.3 11V9.3H114.6V11H106.3ZM120.9 23V11H116.3V9.3H127.6V11H122.9V23H120.9Z"
      fill="currentColor"
    />

    <defs>
      <radialGradient :id="gradient" :cx="center.x" :cy="center.y" r="30" gradientUnits="userSpaceOnUse">
        <stop class="duration-300" stop-color="currentColor" stop-opacity="0.8" />
        <stop class="duration-300" offset="1" stop-color="currentColor" stop-opacity="0.2" />
      </radialGradient>
    </defs>
  </svg>
</template>

<style>
@reference '../style.css';

html:not(.dark) svg path {
  fill-opacity: calc(var(--face) * 0.15);
}

svg:hover radialGradient {
  color: var(--color-docs-accent);
}
</style>
