import { computed, ref, toValue, type ComputedRef, type CSSProperties, type MaybeRefOrGetter, type Ref } from 'vue';
import { provideSurface } from '../../shared/surface';
import { useDialog, type DialogState, type UseDialogOptions, type UseDialogReturn } from '../../shared/use-dialog';
import { dataAttrs } from '../../shared/data-attrs';
import { popupStateAttrs } from '../../shared/popup-state-attrs';
import { createVelocity, dismissesOnRelease, resist } from '../../shared/swipe-dismiss';
import { createContext } from '../../shared/context';

export type DrawerSide = 'top' | 'right' | 'bottom' | 'left';

export interface DrawerState extends DialogState {
  /**
   * The edge it enters from.
   * @attribute `data-side="…"`
   */
  side: DrawerSide;
  /** Whether the drawer is being dragged. */
  dragging: boolean;
}

export interface UseDrawerOptions extends UseDialogOptions {
  /** Which edge the drawer enters from. */
  side?: MaybeRefOrGetter<DrawerSide | undefined>;
  /**
   * How the drawer can be swiped away: `'handle'` by its handle, `true` from
   * anywhere on it as well, `false` not at all. From anywhere, a press only
   * becomes a drag once it moves, so taps on buttons inside still land, and
   * presses in text fields never drag; content can't scroll along the axis.
   *
   * @default 'handle'
   */
  swipeable?: MaybeRefOrGetter<boolean | 'handle' | undefined>;
  /**
   * Fraction of the drawer's own size that must be traveled before releasing
   * dismisses it.
   *
   * @default 0.4
   */
  dismissThreshold?: MaybeRefOrGetter<number | undefined>;
  /**
   * Speed, in pixels per millisecond, past which a flick dismisses without
   * having to reach `dismissThreshold`. A small minimum travel still applies, so
   * a fast twitch cannot dismiss by itself.
   *
   * @default 0.4
   */
  velocityThreshold?: MaybeRefOrGetter<number | undefined>;
}

export interface UseDrawerReturn extends Omit<UseDialogReturn, 'state'> {
  state: ComputedRef<DrawerState>;
  /** Bind to the grab area. Binding it to the popup makes the whole surface draggable. */
  handleProps: ComputedRef<Record<string, unknown>>;
  /** How far the drawer has been dragged from rest, in pixels. */
  offset: Ref<number>;
  dragging: Ref<boolean>;
}

/** How far a press on the drawer moves along its axis before it is a drag rather than a tap. */
const DRAG_SLOP = 4;

/** Where a press means editing, not dragging. */
const EDITABLE = 'input, textarea, select, [contenteditable]:not([contenteditable="false"])';

const AXIS: Record<DrawerSide, { axis: 'x' | 'y'; sign: 1 | -1 }> = {
  bottom: { axis: 'y', sign: 1 },
  top: { axis: 'y', sign: -1 },
  right: { axis: 'x', sign: 1 },
  left: { axis: 'x', sign: -1 }
};

export function useDrawer(options: UseDrawerOptions = {}): UseDrawerReturn {
  const dialog = useDialog(options);

  const side = () => toValue(options.side) ?? 'bottom';
  const swipe = () => toValue(options.swipeable) ?? 'handle';
  const swipeable = () => swipe() !== false;
  const swipeAnywhere = () => swipe() === true;

  const offset = ref(0);
  const dragging = ref(false);

  let pointerId: number | null = null;
  let start = 0;
  let velocity = createVelocity(0, 0);
  // The element whose handlers run this gesture: the handle, or the drawer
  // itself. A press on the handle bubbles to the drawer, which must stand back.
  let owner: EventTarget | null = null;
  // A press on the drawer that hasn't moved far enough to be a drag yet.
  let pending = false;

  const state = computed<DrawerState>(() => ({ ...dialog.state.value, side: side(), dragging: dragging.value }));

  const hooks = computed(() =>
    dataAttrs(state.value, {
      ...popupStateAttrs,
      modal: () => null,
      side: (value) => ({ 'data-side': value }),
      dragging: (value) => (value ? { 'data-dragging': '' } : null)
    })
  );

  function coordinate(event: PointerEvent): number {
    return AXIS[side()].axis === 'y' ? event.clientY : event.clientX;
  }

  function extent(): number {
    const el = dialog.popupRef.value;

    if (!el) return 0;

    return AXIS[side()].axis === 'y' ? el.offsetHeight : el.offsetWidth;
  }

  function begin(event: PointerEvent) {
    pointerId = event.pointerId;
    start = coordinate(event);
    velocity = createVelocity(start, event.timeStamp);
    owner = event.currentTarget;
  }

  function grab(event: PointerEvent) {
    dragging.value = true;
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
  }

  function release() {
    dragging.value = false;
    pending = false;
    pointerId = null;
    owner = null;
  }

  // The handle drags from the first moment: it holds nothing to tap.
  function onPointerdown(event: PointerEvent) {
    if (!swipeable() || event.button !== 0 || owner) return;

    begin(event);
    grab(event);
  }

  // The drawer waits for movement, so a tap on a button inside is still a click.
  function onSurfacePointerdown(event: PointerEvent) {
    if (!swipeAnywhere() || event.button !== 0 || owner) return;
    if ((event.target as Element | null)?.closest(EDITABLE)) return;

    begin(event);
    pending = true;
  }

  function onPointermove(event: PointerEvent) {
    if (event.currentTarget !== owner || event.pointerId !== pointerId) return;

    if (pending) {
      if (Math.abs(coordinate(event) - start) < DRAG_SLOP) return;
      pending = false;
      grab(event);
    }

    if (!dragging.value) return;

    const position = coordinate(event);
    const traveled = (position - start) * AXIS[side()].sign;
    velocity.sample(position, event.timeStamp);

    offset.value = traveled >= 0 ? traveled : resist(traveled);
  }

  function finish(event: PointerEvent) {
    if (event.currentTarget !== owner || event.pointerId !== pointerId) return;

    // a press that never moved far enough: a tap, left to whatever was tapped
    if (!dragging.value) {
      release();
      return;
    }

    release();

    const shouldDismiss = dismissesOnRelease({
      traveled: offset.value,
      velocity: velocity.speed() * AXIS[side()].sign,
      size: extent(),
      distanceRatio: toValue(options.dismissThreshold),
      flickSpeed: toValue(options.velocityThreshold)
    });

    offset.value = 0;
    if (shouldDismiss) dialog.close();
  }

  const handleProps = computed(() =>
    swipeable()
      ? {
          'data-part': 'handle',
          style: { touchAction: 'none' as const },
          onPointerdown,
          onPointermove,
          onPointerup: finish,
          onPointercancel: finish
        }
      : { 'data-part': 'handle' }
  );

  const surfaceProps = computed(() =>
    swipeAnywhere()
      ? {
          onPointerdown: onSurfacePointerdown,
          onPointermove,
          onPointerup: finish,
          onPointercancel: finish
        }
      : {}
  );

  const popupProps = computed(() => {
    const base = dialog.popupProps.value;
    const { axis, sign } = AXIS[side()];
    const distance = offset.value * sign;

    return {
      ...base,
      ...hooks.value,
      ...surfaceProps.value,
      style: {
        ...(base.style as CSSProperties | undefined),
        // swiping from anywhere claims drags along the axis; the other one still scrolls
        ...(swipeAnywhere() ? { touchAction: axis === 'y' ? 'pan-x' : 'pan-y' } : null),
        ...(offset.value !== 0
          ? {
              transform: axis === 'y' ? `translateY(${distance}px)` : `translateX(${distance}px)`
            }
          : null),
        ...(dragging.value ? { transition: 'none' } : null)
      }
    };
  });

  provideSurface({ present: dialog.present, state, popupProps });

  return {
    ...dialog,
    state,
    popupProps,
    backdropProps: computed(() => ({ ...dialog.backdropProps.value, ...hooks.value })),
    handleProps,
    offset,
    dragging
  };
}

export const { provideContext: provideDrawerContext, useContext: useDrawerContext } =
  createContext<UseDrawerReturn>('Drawer');
