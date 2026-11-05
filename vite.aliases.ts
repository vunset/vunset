import { fileURLToPath } from 'node:url';

const packages = fileURLToPath(new URL('./packages', import.meta.url));

export const sourceAliases = [
  { find: /^@vunset\/(utils|vue|ui)$/, replacement: `${packages}/$1/src/index.ts` },
  { find: /^@vunset\/(utils|vue|ui)\/(.+)$/, replacement: `${packages}/$1/src/$2` }
];
