import { fileURLToPath } from 'node:url';

const packages = fileURLToPath(new URL('./packages', import.meta.url));

// The docs (kitchen sink included) and the tests run every package from source; only
// `build:lib` goes through `dist/`.
export const sourceAliases = [
  { find: /^@vunset\/(utils|vue|ui)$/, replacement: `${packages}/$1/src/index.ts` },
  { find: /^@vunset\/(utils|vue|ui)\/(.+)$/, replacement: `${packages}/$1/src/$2` }
];
