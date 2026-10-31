import { computed, ref, shallowRef, toValue, type ComputedRef, type MaybeRefOrGetter, type Ref } from 'vue';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  arrow as arrowMiddleware,
  size,
  hide,
  limitShift,
  type Placement,
  type Middleware
} from '@floating-ui/vue';

export type Side = 'top' | 'right' | 'bottom' | 'left';
export type Align = 'start' | 'center' | 'end';

export interface UsePositioningOptions {
  /** Which side of the anchor to place the popup on. */
  side?: MaybeRefOrGetter<Side | undefined>;
  /** How the popup aligns along that side. */
  align?: MaybeRefOrGetter<Align | undefined>;
  /** Distance from the anchor, in pixels. */
  sideOffset?: MaybeRefOrGetter<number | undefined>;
  /** Shift along the alignment axis, in pixels. */
  alignOffset?: MaybeRefOrGetter<number | undefined>;
  /** Minimum distance from the viewport edge. */
  collisionPadding?: MaybeRefOrGetter<number | undefined>;
  /** Keep the popup anchored even when it would overflow, rather than flipping. */
  sticky?: MaybeRefOrGetter<boolean | undefined>;
  /** Sides to try, in order, when the preferred one does not fit. */
  fallbackSides?: MaybeRefOrGetter<Side[] | undefined>;
  /** Whether a popup may move to the perpendicular axis as a last resort @default true */
  fallbackAxis?: MaybeRefOrGetter<boolean | undefined>;
  /** `fixed` escapes clipping ancestors; `absolute` performs better. */
  positionMethod?: MaybeRefOrGetter<'absolute' | 'fixed' | undefined>;
  /** Distance the arrow keeps from the popup's corners. */
  arrowPadding?: MaybeRefOrGetter<number | undefined>;
  /** Whether positioning is active. Disabled while closed to avoid needless work. */
  enabled?: MaybeRefOrGetter<boolean | undefined>;
}

export interface VirtualAnchor {
  getBoundingClientRect: () => DOMRect;
}

export interface UsePositioningReturn {
  anchorRef: Ref<HTMLElement | null>;
  /** Anchors to a point instead. Pass `null` to go back to the element. */
  setVirtualAnchor: (anchor: VirtualAnchor | null) => void;
  popupRef: Ref<HTMLElement | null>;
  arrowRef: Ref<HTMLElement | null>;
  /** Bind to the element that owns the position. Keep animations off this one. */
  positionerProps: ComputedRef<Record<string, unknown>>;
  arrowProps: ComputedRef<Record<string, unknown>>;
  /** The side actually used, which may differ from the request after a flip. */
  renderedSide: ComputedRef<Side>;
  renderedAlign: ComputedRef<Align>;
  /** Whether the anchor has been scrolled out of view. */
  hidden: ComputedRef<boolean>;
  /** Whether the popup has been placed yet. */
  isPositioned: Readonly<Ref<boolean>>;
}

export function usePositioning(options: UsePositioningOptions = {}): UsePositioningReturn {
  const anchorRef = ref<HTMLElement | null>(null);
  const virtualAnchor = shallowRef<VirtualAnchor | null>(null);

  const reference = computed<HTMLElement | VirtualAnchor | null>(() => virtualAnchor.value ?? anchorRef.value);
  const popupRef = ref<HTMLElement | null>(null);
  const arrowRef = ref<HTMLElement | null>(null);

  const side = () => toValue(options.side) ?? 'bottom';
  const align = () => toValue(options.align) ?? 'center';
  const padding = () => toValue(options.collisionPadding) ?? 8;

  const placement = computed<Placement>(() => {
    const a = align();
    return (a === 'center' ? side() : `${side()}-${a}`) as Placement;
  });

  const middleware = computed<Middleware[]>(() => {
    const list: Middleware[] = [
      offset({
        mainAxis: toValue(options.sideOffset) ?? 0,
        crossAxis: toValue(options.alignOffset) ?? 0
      })
    ];

    if (!toValue(options.sticky)) {
      const fallbackSides = toValue(options.fallbackSides);
      const a = align();

      list.push(
        flip({
          padding: padding(),
          ...(fallbackSides
            ? {
                fallbackPlacements: fallbackSides.map((side) => (a === 'center' ? side : (`${side}-${a}` as Placement)))
              }
            : {
                fallbackAxisSideDirection:
                  (toValue(options.fallbackAxis) ?? true) ? ('end' as const) : ('none' as const)
              })
        })
      );
    }

    list.push(shift({ padding: padding(), limiter: limitShift() }));

    list.push(
      size({
        padding: padding(),
        apply({ availableWidth, availableHeight, elements, rects }) {
          elements.floating.style.setProperty('--available-width', `${Math.round(availableWidth)}px`);
          elements.floating.style.setProperty('--available-height', `${Math.round(availableHeight)}px`);
          elements.floating.style.setProperty('--anchor-width', `${Math.round(rects.reference.width)}px`);
          elements.floating.style.setProperty('--anchor-height', `${Math.round(rects.reference.height)}px`);
        }
      })
    );

    if (arrowRef.value) {
      list.push(arrowMiddleware({ element: arrowRef.value, padding: toValue(options.arrowPadding) ?? 4 }));
    }

    // No padding: an anchor narrower than it at a clipping edge would count as hidden.
    list.push(hide());

    return list;
  });

  const {
    floatingStyles,
    middlewareData,
    placement: finalPlacement,
    isPositioned
  } = useFloating(reference, popupRef, {
    placement,
    middleware,
    strategy: computed(() => toValue(options.positionMethod) ?? 'absolute'),
    whileElementsMounted: autoUpdate,
    open: computed(() => toValue(options.enabled) ?? true)
  });

  const renderedSide = computed(() => finalPlacement.value.split('-')[0] as Side);
  const renderedAlign = computed(() => (finalPlacement.value.split('-')[1] as Align | undefined) ?? 'center');
  const hidden = computed(() => middlewareData.value.hide?.referenceHidden ?? false);

  const positionerProps = computed(() => ({
    'data-part': 'positioner',
    style: {
      ...floatingStyles.value,
      // A variable, so a stylesheet can lift or lower every anchored popup at once.
      zIndex: 'var(--positioner-z-index, 50)',
      visibility: !isPositioned.value || hidden.value ? ('hidden' as const) : undefined
    },
    'data-side': renderedSide.value,
    'data-align': renderedAlign.value,
    ref: (el: unknown) => {
      popupRef.value = (el as HTMLElement) ?? null;
    }
  }));

  const arrowProps = computed(() => {
    const data = middlewareData.value.arrow;
    const side = renderedSide.value;

    return {
      'data-part': 'arrow',
      'data-side': side,
      style: {
        position: 'absolute' as const,
        left: data?.x != null ? `${data.x}px` : '',
        top: data?.y != null ? `${data.y}px` : '',
        right: '',
        bottom: '',
        [side]: '100%'
      },
      ref: (el: unknown) => {
        arrowRef.value = (el as HTMLElement) ?? null;
      }
    };
  });

  return {
    anchorRef,
    setVirtualAnchor(anchor: VirtualAnchor | null) {
      virtualAnchor.value = anchor;
    },
    popupRef,
    arrowRef,
    positionerProps,
    arrowProps,
    renderedSide,
    renderedAlign,
    hidden,
    isPositioned
  };
}
