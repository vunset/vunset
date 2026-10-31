# AppGroup

Controls joined into one: an input and its button, an amount and its
currency, a row of buttons, a split button. Or, as a toolbar, a row of tools
with separators between them that you move through with the arrow keys.
Built on [Group](/layout/group).

::: preview ui/app-group/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { AppButton, AppGroup, FormInput } from '@vunset/ui';
</script>

<template>
  <AppGroup label="Search">
    <FormInput v-model="query" aria-label="Search orders" />
    <AppButton variant="outline">Search</AppButton>
  </AppGroup>
</template>
```

Put any `App*` or `Form*` component with a box in it: AppButton, AppCopy, an
AppMenu or AppPopover with an AppButton trigger, FormInput, FormSelect,
FormCombobox, FormDatepicker, FormToggleGroup. Neighbors lose the corners
they share and overlap their borders. The one hovered or focused comes to
the front. An outline button takes a field's fill and border, so an input and
its button read as one box.

Give a `Form*` inside an `aria-label` rather than a `label`, because a label
would sit above its box. A text field takes up the spare room, so a full-width
group (`w-full`) widens the input, not the button.

`label` names the group for screen readers.

## Examples

### Buttons

Outline buttons share their borders. Filled ones have no border to share, so
they get a faint line between them. That's how you build a split button: an
action next to an AppMenu of the others.

::: preview ui/app-group/Buttons
:::

### Vertical

`orientation="vertical"` stacks them, joining top to bottom.

::: preview ui/app-group/Vertical
:::

### Toolbar

`variant="toolbar"` is one bordered strip with the tools spaced out inside,
all the same height. Controls look simpler there: a FormToggleGroup's toggles
lose their sunken track and look like plain buttons, with the pressed one
tinted. A `Separator` from `@vunset/vue` stands upright between tools with
no class needed, and an AppGroup inside joins a few tools together again.

The whole toolbar is one Tab stop, and the arrow keys move between its
controls. A control with arrow keys of its own, like a FormToggleGroup, counts
as one stop (see [Group](/layout/group#keyboard)).

::: preview ui/app-group/Toolbar
:::

## Styling

| Class | On |
| --- | --- |
| `app-group` | The group, with `data-variant` and `data-orientation`. As a `group`, each child's box (the child, or the box inside a `Form*`) is joined to the next; as a `toolbar`, a bordered strip with the tools apart inside it (`--app-toolbar-padding`) |

A `Separator` straight inside an AppGroup takes [`app-separator`](/ui/app-separator)'s
line without the class.

<<< ../../packages/ui/src/app/app-group.css

## API Reference

### AppGroup

::: api app/AppGroup
:::
