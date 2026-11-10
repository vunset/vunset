<script lang="ts">
import type { ComputedRef } from 'vue';
import { createContext } from '../../shared/context';

export type AvatarStatus = 'idle' | 'loading' | 'loaded' | 'error';

export interface AvatarState {
  /** `idle` with no image given, `loading`, `loaded` once it can be shown, or `error` when it can't. */
  status: AvatarStatus;
}

/** What `AvatarImage` asks the root to load. */
export interface AvatarSource {
  src?: string;
  srcset?: string;
  sizes?: string;
  crossorigin?: '' | 'anonymous' | 'use-credentials';
  referrerpolicy?: ReferrerPolicy;
}

interface AvatarContext {
  state: ComputedRef<AvatarState>;
  showImage: ComputedRef<boolean>;
  showFallback: ComputedRef<boolean>;
  imageProps: ComputedRef<Record<string, unknown>>;
  fallbackProps: ComputedRef<Record<string, unknown>>;
  setSource: (source: AvatarSource | null) => void;
}

export const { provideContext, useContext: useAvatarContext } = createContext<AvatarContext>('Avatar');
</script>

<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, useAttrs, watch } from 'vue';
import { dataAttrs } from '../../shared/data-attrs';
import { mergeProps } from '../../shared/merge-props';

defineOptions({ name: 'AvatarRoot', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** How long, in milliseconds, the fallback waits before showing, so an image that loads quickly never flashes it. */
    delay?: number;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { delay: 0, as: 'span' }
);

const emit = defineEmits<{
  /** The image started loading, loaded or failed. */
  statusChange: [status: AvatarStatus];
}>();

defineSlots<{
  default(props: AvatarState): unknown;
}>();

const source = shallowRef<AvatarSource | null>(null);
const result = ref<'loading' | 'loaded' | 'error'>('loading');
const mounted = ref(false);
const waiting = ref(props.delay > 0);

const hasImage = (value: AvatarSource | null) => !!value && !!(value.src || value.srcset);

const status = computed<AvatarStatus>(() => {
  if (!source.value) return 'idle';
  return hasImage(source.value) ? result.value : 'error';
});

let probe: HTMLImageElement | null = null;

function stopProbe() {
  if (probe) probe.onload = probe.onerror = null;
  probe = null;
}

// Loaded off-screen first, so a broken image is never shown. Only in the browser: the server renders the fallback.
watch([source, mounted], () => {
  stopProbe();
  result.value = 'loading';
  const value = source.value;
  if (!mounted.value || !value || !hasImage(value)) return;

  const image = new Image();
  if (value.crossorigin !== undefined) image.crossOrigin = value.crossorigin;
  if (value.referrerpolicy) image.referrerPolicy = value.referrerpolicy;
  // `srcset` and `sizes` before `src`, or the browser may start fetching `src` alone.
  if (value.sizes) image.sizes = value.sizes;
  if (value.srcset) image.srcset = value.srcset;
  image.onload = () => (result.value = 'loaded');
  image.onerror = () => (result.value = 'error');
  if (value.src) image.src = value.src;
  probe = image;

  // A cached image is ready at once: shown without a frame of fallback.
  if (image.complete && image.naturalWidth > 0) result.value = 'loaded';
});

watch(status, (next) => emit('statusChange', next));

let timer: ReturnType<typeof setTimeout> | undefined;

onMounted(() => {
  mounted.value = true;
  if (waiting.value) timer = setTimeout(() => (waiting.value = false), props.delay);
});

onBeforeUnmount(() => {
  clearTimeout(timer);
  stopProbe();
});

const state = computed<AvatarState>(() => ({ status: status.value }));
const hooks = computed(() => dataAttrs(state.value));

provideContext({
  state,
  showImage: computed(() => status.value === 'loaded'),
  showFallback: computed(() => status.value !== 'loaded' && !waiting.value),
  imageProps: computed(() => ({ ...hooks.value, 'data-part': 'image' })),
  fallbackProps: computed(() => ({ ...hooks.value, 'data-part': 'fallback' })),
  setSource: (value) => (source.value = value)
});

const attrs = useAttrs();
const rootProps = computed(() => mergeProps({ ...hooks.value, 'data-part': 'avatar' }, attrs));
</script>

<template>
  <Part :as="props.as" v-bind="rootProps">
    <slot v-bind="state" />
  </Part>
</template>
