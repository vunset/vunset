import type { ComputedRef, Ref } from 'vue';
import { createContext } from './context';

// The nearest dismissable surface. One key lets a single Portal, Positioner and Popup serve them all; the nearest provider wins.
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
