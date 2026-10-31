// Listbox presets under load, for the FormSelect and FormCombobox examples:
// 620 options, 320+ presets in one folded group, and titles long enough to wrap,
// or with no space to wrap at.

const SYLLABLES = ['ad', 'ma', 'ri', 'flux', 'zen', 'tor', 'via', 'net', 'pix', 'lo', 'quo', 'sky', 'dex', 'nova'];

// The same names on every load, so a case can be found again.
const name = (index: number) =>
  SYLLABLES[index % SYLLABLES.length]! +
  SYLLABLES[(index * 7 + 3) % SYLLABLES.length]! +
  (index % 3 === 0 ? SYLLABLES[(index * 5 + 1) % SYLLABLES.length]! : '');

const LONG_NAMES = [
  'Programmatic Guaranteed – EMEA premium video inventory, Q4 2026 renewal',
  'adserver_integration_partner_with_an_unbroken_identifier_that_never_wraps_0001',
  'A publisher whose display name is long enough to need two or three lines in a narrow column'
];

export const MANY_OPTIONS = Array.from({ length: 620 }, (_, index) => ({
  value: `c${index}`,
  label: `${LONG_NAMES[index] ?? name(index)} (ID: ${index + 100})`
}));

const ids = (from: number, to: number) => MANY_OPTIONS.slice(from, to).map((option) => option.value);

export const MANY_PRESETS = [
  { label: 'Top 10', values: ids(0, 10) },
  { label: 'Every one of the 620', values: ids(0, 620) },
  { label: 'Everything in EMEA premium video, including the Q4 2026 renewals and the contracts still pending', values: ids(0, 40) },
  { label: 'Retired', values: ids(600, 610), disabled: true },
  {
    label: 'Categories',
    presets: [
      { label: 'Human', values: ids(10, 60) },
      { label: 'Pixalate', values: ids(60, 90) },
      { label: 'DV', values: ids(90, 140) },
      { label: 'Brand-safety verified by two independent vendors, with a manual review on top', values: ids(140, 160) }
    ]
  },
  {
    label: 'Companies',
    collapsed: true,
    presets: MANY_OPTIONS.slice(0, 320).map((option, index) => ({
      label: option.label,
      // Every tenth takes its neighbors too, so a preset can be more than one value.
      values: index % 10 === 0 ? ids(index, index + 3) : [option.value]
    }))
  }
];
