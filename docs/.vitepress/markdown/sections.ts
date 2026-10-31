export interface Section {
  /** Index of the `## <title>` line. */
  start: number;
  /** Index of the next `#` or `##` heading, or the page's length. */
  end: number;
  /** Lines between the `##` and the first `###`. */
  lead: string[];
  /** One per `###`, its heading line first. */
  items: { label: string; lines: string[] }[];
}

// a page's `## <title>` section, cut at its `###` headings (not those in fenced code)
export function section(lines: string[], title: string): Section | null {
  const fenced = fences(lines);
  const heading = new RegExp(`^##\\s+${title}\\s*$`);

  const start = lines.findIndex((line, index) => !fenced[index] && heading.test(line));
  if (start === -1) return null;
  let end = lines.findIndex((line, index) => index > start && !fenced[index] && /^#{1,2}\s/.test(line));
  if (end === -1) end = lines.length;

  const lead: string[] = [];
  const items: Section['items'] = [];
  for (let index = start + 1; index < end; index++) {
    const match = !fenced[index] && lines[index].match(/^###\s+(.*?)\s*$/);
    if (match) items.push({ label: match[1].replace(/`/g, ''), lines: [] });
    (items.at(-1)?.lines ?? lead).push(lines[index]);
  }

  return { start, end, lead, items };
}

// which lines sit inside fenced code, the markers included
function fences(lines: string[]): boolean[] {
  let fence: string | null = null;
  return lines.map((line) => {
    const marker = line.match(/^(`{3,}|~{3,})/)?.[1];
    if (marker && !fence) {
      fence = marker;
      return true;
    }
    if (fence && line.trim() === fence) {
      fence = null;
      return true;
    }
    return fence !== null;
  });
}

// a label as a JS string inside a double-quoted Vue attribute
export const quote = (text: string) =>
  `'${text.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;')}'`;
