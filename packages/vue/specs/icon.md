# Icon: layers

Where an inline icon comes from, when more than one place has it.

- Two layers, looked up by name:
  - the app's, from `configureIcons({ inline })`: a glob of files, each loaded
    the first time it's drawn;
  - defaults, from `registerDefaultIcons({ name: '<svg…>' })`: markup a library
    ships (`@vunset/ui` registers its own), ready at once.
- The app's layer wins: a name it has is drawn from its file, whatever the
  defaults hold. A name only the defaults have is drawn from them.
- A default is drawn in the same render that asks for it: no empty frame, and
  a server render includes it. An app file renders once it has loaded, as
  before.
- `registerDefaultIcons` adds to what's there, a later call's name replacing an
  earlier one's. It never touches the app's layer, and `configureIcons` never
  touches it.
- `hasIcon(name)` says whether either layer has the name. A sprite isn't
  asked: it can't say what it holds.
- A name in neither layer warns, as before, and draws nothing.
