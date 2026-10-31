import { computed, type ComputedRef } from 'vue';
import { createContext } from '../../shared/context';
import { useControlled } from '../../shared/use-controlled';
import { chartColors } from '@vunset/utils';

/** One plotted key, with the color and position it keeps whatever is hidden. */
export interface ChartSeries {
  category: string;
  /** Position in the full list, which is what the color is keyed on. */
  index: number;
  color: string;
}

export interface ChartContext {
  categories: ComputedRef<string[]>;
  colors: ComputedRef<string[]>;
  /** What each category is called, where the chart names them. */
  labels?: ComputedRef<string[]>;
  /** The categories currently not drawn. */
  hidden: ComputedRef<string[]>;
  toggle: (category: string) => void;
}

/**
 * Lets a `ChartLegend` nested in a chart drive it without being handed the
 * categories twice. Optional at the reader: a legend placed beside a chart
 * rather than inside one takes its own props instead.
 */
export const {
  provideContext: provideChartContext,
  useContext: useChartContext,
  useOptionalContext: useOptionalChartContext,
} = createContext<ChartContext>('Chart');

export interface UseChartSeriesOptions {
  categories: () => string[];
  colors: () => string[] | undefined;
  labels?: () => string[];
  /** Supplying this makes the hidden list controlled. */
  hidden: () => string[] | undefined;
  /** The prop `hidden` comes from, controlled while bound even if `undefined`. */
  prop?: string;
  onHiddenChange: (hidden: string[]) => void;
}

export interface UseChartSeriesReturn {
  colors: ComputedRef<string[]>;
  hidden: ComputedRef<string[]>;
  /** What to draw, in order, each keeping its original color. */
  visible: ComputedRef<ChartSeries[]>;
  toggle: (category: string) => void;
}

/**
 * The categories a chart draws, and which of them are switched off.
 *
 * Hiding removes a series rather than zeroing it, so a hidden band leaves no
 * flat line along the axis and the remaining ones keep the colors they had —
 * the color is keyed on a category's position in the full list, not in what
 * happens to be showing.
 */
export function useChartSeries(options: UseChartSeriesOptions): UseChartSeriesReturn {
  const colors = computed(() => options.colors() ?? chartColors(options.categories().length));

  const hidden = useControlled<string[]>({
    value: options.hidden,
    defaultValue: () => [],
    prop: options.prop,
    onChange: options.onHiddenChange,
    name: 'Chart',
    label: 'hidden',
  });

  const visible = computed<ChartSeries[]>(() =>
    options
      .categories()
      .map((category, index) => ({ category, index, color: colors.value[index] ?? '' }))
      .filter((series) => !hidden.value.includes(series.category)),
  );

  function toggle(category: string): void {
    hidden.value = hidden.value.includes(category)
      ? hidden.value.filter((entry) => entry !== category)
      : [...hidden.value, category];
  }

  const categories = computed(() => options.categories());

  provideChartContext({
    categories,
    colors,
    labels: options.labels && computed(options.labels),
    hidden: computed(() => hidden.value),
    toggle,
  });

  return { colors, hidden: computed(() => hidden.value), visible, toggle };
}
