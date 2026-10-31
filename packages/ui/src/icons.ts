// The icons ui's own components draw, registered under the app's: an app icon of
// the same name, in `configureIcons({ inline })`, replaces one everywhere.
const stroke = (body: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

const path = (d: string) => stroke(`<path d="${d}"/>`);

const CIRCLE = 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z';
const CHECK = path('M6 13l4 4 9-10');
const CHEVRON_RIGHT = path('M9 4l8 8-8 8');
const CHEVRONS_UP_DOWN = path('M8 9l4-4 4 4M16 15l-4 4-4-4');

// prettier-ignore
export const UI_ICONS = {
  search: path('M16 16l4 4M18 11a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z'),
  close: path('M18 6L6 18M6 6l12 12'),
  check: CHECK,
  'checkbox-checked': CHECK,
  'checkbox-mixed': path('M6 12h12'),
  copy: stroke('<rect x="8" y="8" width="13" height="13" rx="2.5"/><path d="M16 8V5.5A2.5 2.5 0 0 0 13.5 3h-8A2.5 2.5 0 0 0 3 5.5v8A2.5 2.5 0 0 0 5.5 16H8"/>'),
  'copy-done': CHECK,
  'listbox-indicator': CHEVRONS_UP_DOWN,
  'chevron-down': path('M20 9l-8 8-8-8'),
  'chevron-up': path('M4 15l8-8 8 8'),
  'chevron-left': path('M15 4l-8 8 8 8'),
  'chevron-right': CHEVRON_RIGHT,
  calendar: stroke('<rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>'),
  clock: path(`${CIRCLE}M12 7v5l3 2`),
  swap: path('M4 8h15l-3.5-3.5M20 16H5l3.5 3.5'),
  dot: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="4.5"/></svg>',
  spinner: path('M12 3.75a8.25 8.25 0 1 1-8.25 8.25'),
  'alert-info': path(`${CIRCLE}M12 11v5M12 7.5v.01`),
  'alert-success': path(`${CIRCLE}M8 12.5l2.5 2.5L16 9.5`),
  'alert-warning': path('M10.27 4.2 2.6 17.5a2 2 0 0 0 1.73 3h15.34a2 2 0 0 0 1.73-3L13.73 4.2a2 2 0 0 0-3.46 0ZM12 9.5v4M12 17v.01'),
  'alert-danger': path(`${CIRCLE}M15 9l-6 6M9 9l6 6`)
} satisfies Record<string, string>;

/** A name ui draws an icon by. */
export type UiIconName = keyof typeof UI_ICONS;
