# Testing

Vitest + `@vue/test-utils`, one file per feature area in each package's
`test/`. `@vunset/utils`' tests run in a `node` environment.

- jsdom performs no layout — `packages/vue/test/layout.ts` fakes plausible
  geometry where a test needs it, and `test/setup.ts` stubs `ResizeObserver`,
  `PointerEvent`, WAAPI, and element geometry getters that jsdom doesn't
  implement.
- Mutate a fix and confirm the matching test fails before trusting it; jsdom
  gaps (`scrollHeight`, `offsetWidth`, `pointerType`, ...) have silently made
  assertions vacuous before.
- So has Vue: it drops an event stamped no later than the millisecond its
  listener was attached, so a click straight after `mount` on an element with
  two Vue listeners (a `Button`) is sometimes ignored. Wait a couple of
  milliseconds before such a click.
- A new case is a docs demo on the component's page, which the SSR suite
  (`packages/vue/test/ssr.test.ts`, see `.agents/docs.md`) renders and hydrates.
