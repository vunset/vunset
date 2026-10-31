// Sets one version on every package and pins their cross-dependencies to it.
// Usage: npm run bump -- 1.0.0
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const version = process.argv[2];
if (!/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(version)) {
  console.error('Usage: npm run bump -- <version>');
  process.exit(1);
}

for (const name of ['utils', 'vue', 'ui', 'nuxt']) {
  const file = `packages/${name}/package.json`;
  const pkg = JSON.parse(readFileSync(file, 'utf8'));
  pkg.version = version;
  for (const dep of Object.keys(pkg.dependencies ?? {}))
    if (dep.startsWith('@vunset/')) pkg.dependencies[dep] = version;
  pkg.publishConfig = { access: 'public' };
  writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n');
}

execFileSync('npm', ['install', '--package-lock-only', '--silent'], { stdio: 'inherit' });
console.log(version);
