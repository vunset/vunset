/**
 * A stand-in for layout in jsdom, which performs none.
 *
 * Tests mutate this to place the anchor near a viewport edge and so exercise
 * real collision handling: Floating UI's own algorithm runs, it just needs
 * plausible geometry to run on.
 */
export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

const DEFAULT_BOX: Box = { x: 200, y: 200, width: 120, height: 32 };
const DEFAULT_VIEWPORT = { width: 1024, height: 768 };

export const layout = {
  box: { ...DEFAULT_BOX },
  viewport: { ...DEFAULT_VIEWPORT },
};

/** Moves the simulated anchor, e.g. hard against the right edge. */
export function setLayout(box: Partial<Box>, viewport?: Partial<typeof DEFAULT_VIEWPORT>): void {
  Object.assign(layout.box, box);
  if (viewport) {
    Object.assign(layout.viewport, viewport);
  }
}

export function resetLayout(): void {
  layout.box = { ...DEFAULT_BOX };
  layout.viewport = { ...DEFAULT_VIEWPORT };
}
