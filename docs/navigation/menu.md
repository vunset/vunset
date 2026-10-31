# Menu

A button that opens a list of actions: plain items, checkbox and radio items,
groups, and submenus. The keyboard and the pointer both move focus through the
items, and every part carries its state as `data-*` attributes for styling.

::: preview menu/Basic
:::

## Anatomy

```vue
<script setup lang="ts">
import {
  MenuRoot,
  MenuTrigger,
  Portal,
  Positioner,
  Popup,
  MenuArrow,
  MenuItem,
  MenuGroup,
  MenuGroupLabel,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuItemIndicator,
  Separator
} from '@vunset/vue';
</script>

<template>
  <MenuRoot>
    <MenuTrigger />

    <Portal>
      <Positioner>
        <Popup>
          <MenuArrow />
          <MenuItem />
          <Separator />
          <MenuGroup>
            <MenuGroupLabel />
            <MenuCheckboxItem>
              <MenuItemIndicator />
            </MenuCheckboxItem>
          </MenuGroup>
          <MenuRadioGroup>
            <MenuRadioItem>
              <MenuItemIndicator />
            </MenuRadioItem>
          </MenuRadioGroup>
        </Popup>
      </Positioner>
    </Portal>
  </MenuRoot>
</template>
```

`Portal`, `Positioner` and `Popup` are shared with every overlay, documented
under [Overlay parts](/utilities/overlay); here the popup carries the menu's
state attributes. `Separator` is under [Separator](/utilities/separator).

## Examples

### Checkbox items

`MenuCheckboxItem` toggles with `v-model`. The menu stays open after a click
by default, so you can set several in one go (`close-on-click` changes that). `MenuItemIndicator` shows while it is checked;
`keep-mounted` keeps it in place so the labels line up.

::: preview menu/CheckboxItems
:::

### Radio items

A `MenuRadioGroup` holds one value, chosen by its `MenuRadioItem`s. Like
checkbox items, they leave the menu open after a click by default.

::: preview menu/RadioItems
:::

### Submenu

A `MenuRoot` inside a menu's popup is a submenu: its `MenuTrigger` becomes one
of the items, and opens it on hover, ArrowRight, Enter or Space. Choosing in a
submenu closes the whole chain.

::: preview menu/Submenu
:::

### Open on hover

`open-on-hover` opens the menu when the pointer rests on the trigger for
`delay` ms (100 by default). It closes `close-delay` ms (150 by default) after
the pointer leaves both the trigger and the menu. A click keeps it open.

::: preview menu/Hover
:::

### Arrow

`MenuArrow` points at the trigger, from whichever side the menu ended up on.

::: preview menu/Arrow
:::

## Keyboard

| Key | On the trigger | In the menu |
| --- | --- | --- |
| <kbd>↓</kbd> <kbd>Enter</kbd> <kbd>Space</kbd> | Open, focusing the first item | |
| <kbd>↓</kbd> <kbd>↑</kbd> | | Next or previous item, wrapping at the ends unless `loop` is off |
| <kbd>Home</kbd> <kbd>End</kbd> | | First or last item |
| <kbd>Enter</kbd> <kbd>Space</kbd> | | Choose the item |
| <kbd>→</kbd> <kbd>Enter</kbd> <kbd>Space</kbd> | | On a submenu's trigger: open it |
| <kbd>←</kbd> | | In a submenu: close it, back to its trigger |
| <kbd>Esc</kbd> | | Close, back to the trigger |
| <kbd>Tab</kbd> | | Close, and move on |
| A letter | | The next item starting with it |

## API Reference

### MenuRoot

Renders no element: the trigger and the popup carry its state.

::: api menu/MenuRoot
:::

### MenuTrigger

The element carries `data-part="trigger"`, `aria-haspopup="menu"` and
`aria-expanded`. Inside a menu it also has `role="menuitem"`.

::: api menu/MenuTrigger
:::

### MenuItem

The element carries `data-part="item"`, `role="menuitem"` and `data-disabled`.

::: api menu/MenuItem
:::

### MenuCheckboxItem

The element carries `data-part="checkbox-item"`, `role="menuitemcheckbox"` and
`aria-checked`.

::: api menu/MenuCheckboxItem
:::

### MenuRadioGroup

The element carries `data-part="radio-group"` and `role="group"`, named by
a `MenuGroupLabel` inside it.

::: api menu/MenuRadioGroup
:::

### MenuRadioItem

The element carries `data-part="radio-item"`, `role="menuitemradio"` and
`aria-checked`.

::: api menu/MenuRadioItem
:::

### MenuItemIndicator

The element carries `data-part="item-indicator"`, hidden from assistive
technology: the item's `aria-checked` already says it.

::: api menu/MenuItemIndicator
:::

### MenuGroup

The element carries `data-part="group"` and `role="group"`, named by a
`MenuGroupLabel` inside it.

::: api menu/MenuGroup
:::

### MenuGroupLabel

The element carries `data-part="group-label"`.

::: api menu/MenuGroupLabel
:::

### MenuArrow

The element carries `data-part="arrow"`. It's positioned for you, on the side
the menu ended up on.

::: api menu/MenuArrow
:::
