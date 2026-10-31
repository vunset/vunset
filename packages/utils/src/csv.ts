/** A value as a CSV cell: quoted when it holds a quote, comma or line break; empty for none. */
export function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * A CSV file: `headers`, then a line per row. A row's values are taken in
 * order, so an object's keys must come in the headers' order.
 */
export function formatCsv(headers: string[], rows: (Record<string, unknown> | unknown[])[]): Blob {
  const lines = rows.map((row) => {
    const values = Object.values(row);
    return headers.map((_, index) => escapeCsvValue(values[index])).join(',');
  });
  return new Blob([[headers.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
}
