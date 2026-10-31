import { computed, useAttrs } from 'vue';

/** A `Form*`'s attrs, split: `class` and `style` dress the field, the rest land on its control. */
export function useFieldAttrs() {
  const attrs = useAttrs();

  return {
    fieldAttrs: computed(() => ({ class: attrs.class, style: attrs.style })),
    controlAttrs: computed(() => {
      const { class: _class, style: _style, ...rest } = attrs;
      return rest;
    })
  };
}
