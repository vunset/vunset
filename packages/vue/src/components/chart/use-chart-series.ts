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
  labels?: ComputedRef<string[]>;
  hidden: ComputedRef<string[]>;
  setHidden: (hidden: string[]) => void;
}

// Optional at the reader: a legend beside a chart rather than inside one takes its own props.
export const {
  provideContext: provideChartContext,
  useContext: useChartContext,
  useOptionalContext: useOptionalChartContext
} = createContext<ChartContext>('Chart');

export interface UseChartSeriesOptions {
  categories: () => string[];
  colors: () => string[] | undefined;
  paletteSize?: () => number | undefined;
  labels?: () => string[];
  hidden: () => string[] | undefined;
  /** Controlled while bound, even if `undefined`. */
  prop?: string;
  onHiddenChange: (hidden: string[]) => void;
}

export interface UseChartSeriesReturn {
  colors: ComputedRef<string[]>;
  hidden: ComputedRef<string[]>;
  visible: ComputedRef<ChartSeries[]>;
  toggle: (category: string) => void;
}

// Hiding removes a series rather than zeroing it, and colors stay keyed on the full list.
export function useChartSeries(options: UseChartSeriesOptions): UseChartSeriesReturn {
  const colors = computed(
    () => options.colors() ?? chartColors(options.categories().length, undefined, undefined, options.paletteSize?.())
  );

  const hidden = useControlled<string[]>({
    value: options.hidden,
    defaultValue: () => [],
    prop: options.prop,
    onChange: options.onHiddenChange,
    name: 'Chart',
    label: 'hidden'
  });

  const visible = computed<ChartSeries[]>(() =>
    options
      .categories()
      .map((category, index) => ({ category, index, color: colors.value[index] ?? '' }))
      .filter((series) => !hidden.value.includes(series.category))
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
    setHidden: (next) => {
      hidden.value = next;
    }
  });

  return { colors, hidden: computed(() => hidden.value), visible, toggle };
}
