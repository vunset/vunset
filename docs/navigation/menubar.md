# Menubar

A row of menus, like an application's File, Edit and View. You build it from
the same parts as a [Menu](/navigation/menu). Each `MenuRoot` you put inside
becomes one of the bar's menus.

::: preview menubar/Basic
:::

## Anatomy

```vue
<script setup lang="ts">
import { MenubarRoot, MenuRoot, MenuTrigger, Portal, Positioner, Popup, MenuItem } from '@vunset/vue';
</script>

<template>
  <MenubarRoot>
    <MenuRoot>
      <MenuTrigger />
      <Portal>
        <Positioner>
          <Popup>
            <MenuItem />
          </Popup>
        </Positioner>
      </Portal>
    </MenuRoot>
  </MenubarRoot>
</template>
```

Everything inside a menu works as it does in a [Menu](/navigation/menu):
checkbox and radio items, groups, separators and submenus.

## Examples

### Open on hover

By default nothing opens until you click a menu. After that, pointing at
another menu opens it. `open-on-hover` skips the first click.

::: preview menubar/Hover
:::

### Links

`MenubarLink` puts a link in the bar, next to the menus. It renders an `<a>`,
or your router's link through `as`. The arrow keys reach it like any menu,
and landing on it, with a key or the pointer, closes the menu that's open.

A disabled link cancels the press. A router link can't be stopped that way,
so when you disable one, leave out its `to` as well.

```vue
<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <MenubarRoot>
    <MenuRoot>…</MenuRoot>
    <MenubarLink :as="RouterLink" to="/logger">Logger</MenubarLink>
  </MenubarRoot>
</template>
```

For a link inside a menu, give a `MenuItem` an `as`. Enter follows it and
closes the menu, as a click does.

### Nested submenus

Submenus three levels deep, opening to the side you pick. Moving the pointer
across into a submenu keeps it open, and the arrow keys walk in and out of
each level.

::: preview menubar/Submenus
:::

## Keyboard

Tab reaches every menu's trigger until you open one. While the bar is in use,
only the current menu's trigger is a tab stop.

| Key | On a trigger in the bar | In an open menu |
| --- | --- | --- |
| <kbd>←</kbd> <kbd>→</kbd> | Previous or next menu | Previous or next menu, opened, with focus on its trigger |
| <kbd>Home</kbd> <kbd>End</kbd> | First or last menu | First or last item |
| <kbd>↓</kbd> <kbd>Enter</kbd> <kbd>Space</kbd> | Open, focusing the first item | |

Everything else in an open menu works as in a [Menu](/navigation/menu#keyboard).

## API Reference

### MenubarRoot

The element carries `data-part="menubar"` and `role="menubar"`. Its menus'
triggers carry `role="menuitem"` and the state attributes of their
[MenuRoot](/navigation/menu#menuroot).

::: api menu/MenubarRoot
:::

### MenubarLink

The element carries `data-part="menubar-link"`, `role="menuitem"` and, while
disabled, `data-disabled`.

::: api menu/MenubarLink
:::
