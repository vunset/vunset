// Tags the committed version `v<version>` and pushes the tag, which starts the
// release workflow. Run after `npm run bump` and the changelog are committed.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const fail = (message) => {
  console.error(message);
  process.exit(1);
};

const { version } = JSON.parse(readFileSync('packages/vue/package.json', 'utf8'));
const tag = `v${version}`;

// The tag marks HEAD, so what it names must be what's committed.
if (git('status', '--porcelain')) fail('Commit or stash your changes first: the tag marks HEAD.');
if (git('tag', '--list', tag)) fail(`${tag} already exists.`);
if (!readFileSync('CHANGELOG.md', 'utf8').includes(`## ${version}\n`)) fail(`CHANGELOG.md has no "## ${version}" entry.`);

execFileSync('git', ['tag', '-a', tag, '-m', tag], { stdio: 'inherit' });
execFileSync('git', ['push', 'origin', tag], { stdio: 'inherit' });
console.log(`Pushed ${tag}; the release workflow publishes it.`);
