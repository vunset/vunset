export type DismissReason = 'escape-key' | 'outside-press' | 'focus-out';

export interface DismissLayer {
  /** Elements that count as "inside" this layer. */
  elements: () => (HTMLElement | null)[];
  dismiss: (reason: DismissReason) => void;
  escapeKey: () => boolean;
  outsidePress: () => boolean;
  /** Whether this layer covers everything beneath it. */
  modal: () => boolean;
}

/** Open dismissable layers, outermost first. */
const stack: DismissLayer[] = [];
let listening = false;

function contains(layer: DismissLayer, target: Node): boolean {
  return layer.elements().some((el) => el?.contains(target));
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || stack.length === 0) return;

  const top = stack[stack.length - 1];
  if (!top.escapeKey()) return;

  event.stopPropagation();
  top.dismiss('escape-key');
}

function onPointerDown(event: PointerEvent) {
  const target = event.target as Node | null;
  if (!target || !target.isConnected) return;

  for (let i = stack.length - 1; i >= 0; i -= 1) {
    const layer = stack[i];
    if (contains(layer, target)) break;
    if (!layer.outsidePress()) break;

    layer.dismiss('outside-press');

    if (layer.modal()) break;
  }
}

function sync() {
  const shouldListen = stack.length > 0;
  if (shouldListen === listening) return;

  listening = shouldListen;

  if (shouldListen) {
    document.addEventListener('keydown', onKeydown, true);
    document.addEventListener('pointerdown', onPointerDown, true);
  } else {
    document.removeEventListener('keydown', onKeydown, true);
    document.removeEventListener('pointerdown', onPointerDown, true);
  }
}

export function pushDismissLayer(layer: DismissLayer): () => void {
  stack.push(layer);
  sync();

  return () => {
    const index = stack.indexOf(layer);
    if (index !== -1) stack.splice(index, 1);

    sync();
  };
}

/** Whether an event along `path` landed inside an open layer, its portaled popup included. */
export function isInsideDismissLayer(path: EventTarget[]): boolean {
  return stack.some((layer) => layer.elements().some((el) => !!el && path.includes(el)));
}

export function isTopLayer(layer: DismissLayer): boolean {
  return stack[stack.length - 1] === layer;
}
