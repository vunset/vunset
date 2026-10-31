export interface TooltipGroupOptions {
  /** How long the pointer must rest before the first tooltip opens. */
  delay: number;
  /** How long after the pointer leaves before a tooltip hides. */
  closeDelay: number;
  /**
   * How long after the last tooltip closes that the group keeps skipping the
   * open delay.
   */
  timeout: number;
}

export interface TooltipGroup {
  options: () => TooltipGroupOptions;
  /** Whether the next tooltip should skip its open delay. */
  isInstant: () => boolean;
  /** How many members are currently open. */
  openCount: () => number;
  /** Called when a member opens, with how to close it when a neighbor takes over. */
  onOpen: (close: () => void) => void;
  /** Called when a member closes. */
  onClose: (close: () => void) => void;
}

export const DEFAULT_GROUP_OPTIONS: TooltipGroupOptions = {
  delay: 600,
  closeDelay: 0,
  timeout: 400,
};

/**
 * Shared timing for a set of tooltips.
 *
 * A lone tooltip should wait before appearing, or pointers merely crossing the
 * screen would flash tooltips everywhere. But once one is showing, the user has
 * clearly asked for them, and making each neighbor re-serve the full delay
 * feels broken — so while any member is open, and briefly after the last one
 * closes, the rest open instantly.
 *
 * That "briefly after" window is why this cannot live in a single tooltip: the
 * state has to outlive the component that created it.
 */
export function createTooltipGroup(getOptions: () => TooltipGroupOptions): TooltipGroup {
  const open = new Set<() => void>();
  let instant = false;
  let graceTimer: ReturnType<typeof setTimeout> | undefined;

  return {
    options: getOptions,
    isInstant: () => instant,
    openCount: () => open.size,
    onOpen(close) {
      open.add(close);
      instant = true;
      clearTimeout(graceTimer);
      graceTimer = undefined;
      // Only one shows at a time: the one being left goes now, not after its close delay.
      for (const other of [...open]) {
        if (other !== close) other();
      }
    },
    onClose(close) {
      open.delete(close);
      if (open.size > 0) {
        return;
      }
      clearTimeout(graceTimer);
      graceTimer = setTimeout(() => {
        instant = false;
        graceTimer = undefined;
      }, getOptions().timeout);
    },
  };
}

/**
 * The group used by tooltips with no `TooltipGroup` above them. Shared across the app
 * so that unrelated tooltips still cooperate, which is what users expect.
 */
export const defaultTooltipGroup = createTooltipGroup(() => DEFAULT_GROUP_OPTIONS);
