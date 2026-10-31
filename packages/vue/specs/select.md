# Select and Combobox — keyboard

What `useListbox` does with the keyboard, for `SelectRoot` (`mode: 'select'`)
and `ComboboxRoot` (`mode: 'combobox'`). Neither does anything while disabled
or read-only. Escape is the dismiss stack's: it closes the innermost open layer.

## Where focus is

- **Select:** on the trigger. With `searchable`, opening moves it to the
  `SelectSearch` box, and it stays there while open.
- **Combobox:** on the input, always.

Focus never moves onto an option. The highlight travels by
`aria-activedescendant`, so typing keeps working.

## Closed

| Key | Select (trigger) | Combobox (input) |
| --- | --- | --- |
| ↓ | Opens, highlighting the selected option, else the first | Same |
| ↑ | Opens, highlighting the selected option, else the last | Same |
| Enter, Space | Opens, like ↓ | Nothing: Enter submits the form, Space is typed |
| A character | Nothing | Typed, and opens the popup |
| Backspace | Nothing | With `multiple` and an empty input, takes back the last chip |

## Open

| Key | Does |
| --- | --- |
| ↓ / ↑ | Next or previous enabled option, wrapping with `loop` (on by default) |
| Home / End | First or last enabled option. In a combobox too: the input's caret doesn't move |
| Enter | Takes the highlighted option. Single: chooses it and closes. Multiple: toggles it and stays open. A combobox's create row creates its text |
| Space | Select without a search box: as Enter. Otherwise typed |
| A character | Select without a search box: typeahead, to the next option starting with what has been typed lately. Otherwise typed, filtering the list, and the highlight moves to the first match |
| Backspace | With `multiple`, a search box or an input, and nothing typed: takes back the last choice |
| Tab | Closes, and focus moves on as usual |
| Escape | Closes |

After a choice in a combobox the input shows the chosen label (single), or
empties for the next one (multiple). A select's search clears when it closes.
