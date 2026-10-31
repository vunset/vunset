export type InputModality = 'pointer' | 'keyboard';

/** How the user most recently interacted, used to decide whether focus deserves a visible response. */
let modality: InputModality = 'keyboard';
let listening = false;

function onPointer() {
  modality = 'pointer';
}

function onKeydown(event: KeyboardEvent) {
  if (event.metaKey || event.altKey || event.ctrlKey) return;
  modality = 'keyboard';
}

function ensureListening() {
  if (listening || typeof document === 'undefined') return;
  listening = true;
  document.addEventListener('pointerdown', onPointer, true);
  document.addEventListener('keydown', onKeydown, true);
}

export function getInputModality(): InputModality {
  ensureListening();
  return modality;
}

export function isKeyboardFocus(): boolean {
  return getInputModality() === 'keyboard';
}
