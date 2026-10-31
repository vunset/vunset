import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// The sizes live in base.css's tokens; a component's sheet takes them as they
// are, so changing a token changes every component that draws it.
const src = join(__dirname, '../src');
const sheets = readdirSync(src, { recursive: true, encoding: 'utf8' }).filter(
  (file) => file.endsWith('.css') && file !== 'base.css'
);

const SIZED = /^\s*((?:--[\w-]+-)?font-size|border(?:-[a-z]+)*-radius)\s*:\s*([^;]+);/;
const OWN_VAR = /var\(--(?!ui-(font-size|radius))[\w-]+\)/;

function allowed(value: string): boolean {
  // A sum is fine when it brings in a size of its own (a toolbar's padding), not a number.
  if (value.startsWith('calc(')) return OWN_VAR.test(value);
  return value
    .split(/\s+/)
    .every((part) => /^(0|50%|inherit|[\d.]+em|var\(--[\w-]+\))$/.test(part));
}

describe('size tokens', () => {
  it('finds the sheets', () => {
    expect(sheets.length).toBeGreaterThan(30);
  });

  it('draws every font size and radius from a token, never a number or a sum on one', () => {
    const offenders = sheets.flatMap((file) =>
      readFileSync(join(src, file), 'utf8')
        .split('\n')
        .flatMap((line, index) => {
          const match = SIZED.exec(line);
          return match && !allowed(match[2]!.trim()) ? [`${file}:${index + 1}  ${line.trim()}`] : [];
        })
    );

    expect(offenders, 'use a --ui-font-size-* or --ui-radius-* step from base.css').toEqual([]);
  });

  it('catches what it is meant to', () => {
    expect(allowed('calc(var(--ui-radius) - 0.125rem)')).toBe(false);
    expect(allowed('0.75rem')).toBe(false);
    expect(allowed('999px')).toBe(false);
    expect(allowed('var(--ui-radius-3xl) var(--ui-radius-3xl) 0 0')).toBe(true);
    expect(allowed('calc(var(--ui-radius) + var(--app-toolbar-padding))')).toBe(true);
    expect(allowed('var(--ui-range-track)')).toBe(true);
    expect(allowed('0.8em')).toBe(true);
  });
});
