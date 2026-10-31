import type { ComputedRef, Ref } from 'vue';
import { createContext } from './context';

/**
 * The nearest dismissable surface: a dialog, drawer, popover, menu, tooltip or
 * listbox popup.
 *
 * Every such composable publishes its parts here under one shared key, which is
 * what lets a single `<Portal>`, `<Positioner>` and `<Popup>` serve all of them.
 * Without it each component needs its own three components whose only
 * distinguishing feature is which context they read — eleven files that differed
 * by one identifier.
 *
 * `inject` resolves to the nearest provider, so a menu inside a dialog gets the
 * menu's surface rather than the dialog's, which is what nesting should mean.
 */
export interface SurfaceContext {
  /** Whether the surface belongs in the DOM. */
  present: Ref<boolean>;
  /** The surface's own state, handed to every part's slot. */
  state: ComputedRef<object>;
  /** The animated surface. */
  popupProps: ComputedRef<Record<string, unknown>>;
  /** The box that owns the position. */
  positionerProps?: ComputedRef<Record<string, unknown>>;
  /** The pointer towards the anchor, on surfaces that draw one. */
  arrowProps?: ComputedRef<Record<string, unknown>>;
}

export const {
  provideContext: provideSurface,
  useContext: useSurface,
  useOptionalContext: useOptionalSurface
} = createContext<SurfaceContext>('Surface');
