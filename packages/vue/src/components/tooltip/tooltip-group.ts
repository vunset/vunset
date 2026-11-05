export interface TooltipGroupOptions {
  delay: number;
  closeDelay: number;
  timeout: number;
}

export interface TooltipGroup {
  options: () => TooltipGroupOptions;
  isInstant: () => boolean;
  openCount: () => number;
  onOpen: (close: () => void) => void;
  onClose: (close: () => void) => void;
}

export const DEFAULT_GROUP_OPTIONS: TooltipGroupOptions = {
  delay: 600,
  closeDelay: 0,
  timeout: 400,
};

// While one is open, and briefly after, the rest open instantly; that window outlives any one tooltip.
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

// For tooltips with no `TooltipGroup` above them.
export const defaultTooltipGroup = createTooltipGroup(() => DEFAULT_GROUP_OPTIONS);
