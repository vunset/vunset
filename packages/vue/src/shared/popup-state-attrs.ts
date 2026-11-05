import type { DataAttrsMapping } from './data-attrs';
import type { TransitionStatus } from './use-transition-status';

// `open` emits both ways so CSS needs no `:not()`; `idle` emits nothing, being the resting state.
export const popupStateAttrs = {
  open: (value: boolean) => (value ? { 'data-open': '' } : { 'data-closed': '' }),
  transitionStatus: (value: TransitionStatus) => {
    if (value === 'enter') return { 'data-enter-from': '' };
    if (value === 'leave') return { 'data-leave-to': '' };
    return null;
  }
} satisfies DataAttrsMapping<{ open: boolean; transitionStatus: TransitionStatus }>;

export const anchoredStateAttrs = {
  ...popupStateAttrs,
  side: (value: string) => ({ 'data-side': value }),
  align: (value: string) => ({ 'data-align': value })
} satisfies DataAttrsMapping<{
  open: boolean;
  transitionStatus: TransitionStatus;
  side: string;
  align: string;
}>;
