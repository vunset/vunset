<script setup lang="ts">
import { applyModelModifiers, type InputModelModifiers } from '../../shared/model-modifiers';
import { Part } from '../../shared/part';
import { onBeforeUnmount, toRef, watch } from 'vue';
import { usePartProps } from '../../shared/use-part-props';
import { useInput, provideInputContext, type FieldFilter } from '../../shared/use-input';

defineOptions({ name: 'Textarea', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The value, bound with `v-model`. Always emitted as a string. */
    modelValue?: string | number | null;
    /** `v-model.optional` writes `undefined` once emptied; `.trim` and `.number` work as on an `<input>`. */
    modelModifiers?: InputModelModifiers;
    /** The value at first, when no `v-model` owns it. */
    defaultValue?: string | number;
    /** Ignores interaction. Inside a `FieldRoot`, follows the field. */
    disabled?: boolean;
    /** Can be read and selected but not edited. Inside a `FieldRoot`, follows the field. */
    readOnly?: boolean;
    /** Needs a value. Announced and styled, not enforced. Inside a `FieldRoot`, follows the field. */
    required?: boolean;
    /** Sets `aria-invalid` and `data-invalid`. Inside a `FieldRoot`, follows the field. */
    invalid?: boolean;
    /** The textarea's id. Inside a `FieldRoot`, the field's control id. */
    id?: string;
    /** The form field name. Inside a `FieldRoot`, the field's name. */
    name?: string;
    /** The native `minlength`. */
    minLength?: number;
    /** The native `maxlength`, also enforced while typing and pasting. */
    maxLength?: number;
    /** What may be typed at all, checked on every keystroke and paste: a regex source, a RegExp or a function. */
    filter?: FieldFilter;
    /** Rewrites the typed text once it's committed: on blur, or Enter in an input. Not applied to `v-model`'s own writes. */
    transform?: (value: string) => string;
    /** Grows and shrinks with its content. `rows` is the least it shrinks to. */
    autosize?: boolean;
    /** With `autosize`, the most rows it grows to before it scrolls. */
    maxRows?: number;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { modelValue: undefined, defaultValue: undefined, autosize: false, as: 'textarea' }
);

const emit = defineEmits<{
  /** The new value, for `v-model`. */
  'update:modelValue': [value: string | undefined];
}>();

const api = useInput({
  value: toRef(() => props.modelValue),
  defaultValue: toRef(() => props.defaultValue),
  disabled: toRef(() => props.disabled ?? false),
  readOnly: toRef(() => props.readOnly ?? false),
  required: toRef(() => props.required ?? false),
  invalid: toRef(() => props.invalid ?? false),
  id: toRef(() => props.id),
  name: toRef(() => props.name),
  minLength: toRef(() => props.minLength),
  maxLength: toRef(() => props.maxLength),
  filter: toRef(() => props.filter),
  transform: toRef(() => props.transform),
  onChange: (value) => emit('update:modelValue', applyModelModifiers(value, props.modelModifiers))
});

provideInputContext(api);
defineExpose(api);

// `data-autosize`, so a stylesheet can drop the resize handle the height would fight.
const merged = usePartProps(() => ({ ...api.controlProps.value, 'data-part': 'textarea', 'data-autosize': props.autosize || undefined }));


const px = (value: string) => parseFloat(value) || 0;

// Collapse to `rows`, then take the content's height: `scrollHeight` is never
// less than the box, so `rows` stays the floor.
function resize() {
  const el = api.controlRef.value;
  if (!el) return;

  if (!props.autosize) {
    el.style.removeProperty('height');
    el.style.removeProperty('overflow-y');
    return;
  }

  const style = getComputedStyle(el);
  const padding = px(style.paddingTop) + px(style.paddingBottom);
  const border = px(style.borderTopWidth) + px(style.borderBottomWidth);
  const outer = style.boxSizing === 'border-box' ? border : -padding;
  const line = px(style.lineHeight) || px(style.fontSize) * 1.2;

  el.style.height = 'auto';
  const content = el.scrollHeight + outer;
  const max = props.maxRows ? props.maxRows * line + padding + outer : Infinity;

  el.style.height = `${Math.min(content, max)}px`;
  el.style.overflowY = content > max ? 'auto' : 'hidden';
}

watch([api.value, () => props.autosize, () => props.maxRows, api.controlRef], resize, { flush: 'post' });

// A narrower box wraps more lines. Only width counts: the height is ours.
let width = 0;
const observer =
  typeof ResizeObserver === 'undefined'
    ? null
    : new ResizeObserver((entries) => {
        const next = entries[0]?.contentRect.width ?? 0;
        if (next === width) return;
        width = next;
        resize();
      });

watch(api.controlRef, (el, previous) => {
  if (previous) observer?.unobserve(previous);
  if (el) observer?.observe(el);
});

onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <Part :as="props.as" v-bind="merged" />
</template>
