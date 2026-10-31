import type { Component, HTMLAttributes, VNode } from 'vue';
import { defaultLink, type MenuRadioValue } from '@vunset/vue';

/** A plain item: chosen, it runs `onSelect`. With `items`, it opens a submenu instead. */
export interface AppMenuAction {
  type?: 'item';
  label: string;
  /** An icon before the label: an AppIcon name, or a component or `h()` drawn as it is. */
  icon?: string | Component | VNode;
  /** Text at the end, such as `⌘S`. Shown only; the shortcut itself is the page's to bind. */
  shortcut?: string;
  /** `danger` for an action that destroys something. */
  tone?: 'danger';
  disabled?: boolean;
  /** Whether choosing it closes the menu. */
  closeOnClick?: boolean;
  onSelect?: (event: Event) => void;
  /** Makes it a link: the `href`, or a route for the menu's `link` (`RouterLink`, `NuxtLink`). */
  to?: unknown;
  /** A submenu. */
  items?: AppMenuEntry[];
  /** Classes for this item alone. */
  class?: HTMLAttributes['class'];
}

export interface AppMenuSeparator {
  type: 'separator';
}

/** Items under a heading. */
export interface AppMenuGroup {
  type: 'group';
  label: string;
  items: AppMenuEntry[];
}

/** An item that toggles. Controlled while it has `checked` (even `undefined`), with `onChange`; on its own without. */
export interface AppMenuCheckbox {
  type: 'checkbox';
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  closeOnClick?: boolean;
}

/** Items of which one is chosen. Controlled while it has `value` (even `undefined`), with `onChange`; on its own without. */
export interface AppMenuRadio {
  type: 'radio';
  /** A heading over the choices. */
  label?: string;
  value?: MenuRadioValue;
  options: { value: MenuRadioValue; label: string; disabled?: boolean }[];
  onChange?: (value: MenuRadioValue) => void;
  disabled?: boolean;
  closeOnClick?: boolean;
}

export type AppMenuEntry = AppMenuAction | AppMenuSeparator | AppMenuGroup | AppMenuCheckbox | AppMenuRadio;

/** One menu of an AppMenubar: its trigger's text and its items. */
export interface AppMenubarMenu {
  label: string;
  items: AppMenuEntry[];
  disabled?: boolean;
}

/** A link in an AppMenubar, beside its menus. */
export interface AppMenubarLink {
  label: string;
  /** The `href`, or a route for the bar's `link` (`RouterLink`, `NuxtLink`). */
  to: unknown;
  disabled?: boolean;
  /** Classes for this link alone. */
  class?: HTMLAttributes['class'];
}

/** One entry of an AppMenubar's `items`: a menu, or a link. */
export type AppMenubarEntry = AppMenubarMenu | AppMenubarLink;

/**
 * What an entry with `to` renders as: `link` (else `configureLink`'s) with `to`, or an `<a>` with `href`.
 * A disabled one is an `<a>` with nowhere to go, since a router link can't render without its `to`.
 */
export function linkProps(link: string | Component | undefined, to: unknown, disabled?: boolean) {
  if (disabled) return { as: 'a' };
  const tag = link ?? defaultLink();
  return tag === 'a' ? { as: 'a', href: to } : { as: tag, to };
}
