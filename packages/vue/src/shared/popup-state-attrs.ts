import type { DataAttrsMapping } from './data-attrs';
import type { TransitionStatus } from './use-transition-status';

/**
 * The `data-*` mapping every dismissable surface shares.
 *
 * `open` is emitted in both positions so CSS needs no `:not()` selector, and the
 * transition phases become the "from" hooks an enter or exit animation needs.
 * `idle` deliberately emits nothing — it is the resting state, not a phase.
 */
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
