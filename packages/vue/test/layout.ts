// Fake layout for jsdom; tests move the anchor near an edge to exercise Floating UI's real collision handling.
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
