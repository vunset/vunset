import { computed, ref, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue';
import { createContext } from './context';

export type GaugeRole = 'progressbar' | 'meter';

export type GaugeStatus = 'indeterminate' | 'progressing' | 'complete';

export const GAUGE_PERCENTAGE_VAR = '--gauge-percentage';
export const GAUGE_VALUE_VAR = '--gauge-value';
export const GAUGE_MIN_VAR = '--gauge-min';
export const GAUGE_MAX_VAR = '--gauge-max';

export interface GaugeState {
  /** `indeterminate` with no value and `complete` at `max` (a progress bar only), `progressing` otherwise. */
  status: GaugeStatus;
  /**
   * How far along the range the value is, 0–100; `null` while indeterminate.
   * @attribute `--gauge-percentage` (a CSS variable, with a `%`)
   */
  percentage: number | null;
  /**
   * The value, kept inside the range; `null` while indeterminate.
   * @attribute `--gauge-value` (a CSS variable)
   */
  value: number | null;
  /**
   * The lower end of the range.
   * @attribute `--gauge-min` (a CSS variable)
   */
  min: number;
  /**
   * The upper end of the range.
   * @attribute `--gauge-max` (a CSS variable)
   */
  max: number;
  /**
   * The value through `format`, as the value part shows it.
   * @attribute none
   */
  formattedValue: string;
}

export interface UseGaugeOptions {
  /** Decided by the root, not by the caller. See {@link GaugeRole}. */
  role: GaugeRole;
  /** `null` is indeterminate, which only a progress bar can be. */
  value?: MaybeRefOrGetter<number | null | undefined>;
  /** @default 0 */
  min?: MaybeRefOrGetter<number | undefined>;
  /** @default 100 */
  max?: MaybeRefOrGetter<number | undefined>;
  /** Passed to `Intl.NumberFormat`. Omit it and the number is used as-is. */
  format?: MaybeRefOrGetter<Intl.NumberFormatOptions | undefined>;
  /** Defaults to the runtime's locale. */
  locale?: MaybeRefOrGetter<Intl.LocalesArgument | undefined>;
  /**
   * Replaces the text read out for the value. Receives the formatted value and
   * the raw one — "3 of 7 steps" rather than "3".
   */
  getValueText?: (formattedValue: string, value: number | null) => string;
}

export interface UseGaugeReturn {
  state: ComputedRef<GaugeState>;
  /** Bind to the element that carries the role. */
  rootProps: ComputedRef<Record<string, unknown>>;
  /** Bind to the groove the fill runs along. */
  trackProps: ComputedRef<Record<string, unknown>>;
  /** Bind to the fill itself. Draws from the variables, never from a width set here. */
  indicatorProps: ComputedRef<Record<string, unknown>>;
  /** Bind to the visible readout. */
  valueProps: ComputedRef<Record<string, unknown>>;
  registerLabel: (id: string) => () => void;
}

export function useGauge(options: UseGaugeOptions): UseGaugeReturn {
  const min = () => toValue(options.min) ?? 0;
  const max = () => toValue(options.max) ?? 100;

  const labelId = ref<string>();

  const state = computed<GaugeState>(() => {
    const lower = min();
    const upper = max();
    const raw = toValue(options.value);

    const indeterminate = raw == null || !Number.isFinite(raw);

    if (indeterminate && options.role === 'progressbar') {
      return {
        status: 'indeterminate',
        percentage: null,
        value: null,
        min: lower,
        max: upper,
        formattedValue: ''
      };
    }

    const value = clamp(indeterminate ? lower : (raw as number), lower, upper);
    const span = upper - lower;
    const percentage = span > 0 ? ((value - lower) / span) * 100 : 0;

    return {
      status: options.role === 'progressbar' && value === upper ? 'complete' : 'progressing',
      percentage,
      value,
      min: lower,
      max: upper,
      formattedValue: format(value, toValue(options.format), toValue(options.locale))
    };
  });

  const valueText = computed(() => {
    const current = state.value;
    const fallback = current.status === 'indeterminate' ? 'indeterminate' : current.formattedValue;
    return options.getValueText?.(current.formattedValue, current.value) ?? fallback;
  });

  const rootProps = computed(() => {
    const current = state.value;

    return {
      'data-part': 'gauge',
      'data-status': current.status,
      role: options.role,
      'aria-valuemin': current.min,
      'aria-valuemax': current.max,
      'aria-valuenow': current.value ?? undefined,
      'aria-valuetext': valueText.value,
      'aria-labelledby': labelId.value,
      style: {
        ...(current.percentage === null
          ? null
          : {
              [GAUGE_PERCENTAGE_VAR]: `${current.percentage}%`,
              [GAUGE_VALUE_VAR]: current.value
            }),
        [GAUGE_MIN_VAR]: current.min,
        [GAUGE_MAX_VAR]: current.max
      }
    };
  });

  const trackProps = computed(() => ({ 'data-part': 'track', 'data-status': state.value.status }));
  const indicatorProps = computed(() => ({ 'data-part': 'indicator', 'data-status': state.value.status }));
  const valueProps = computed(() => ({ 'data-part': 'value', 'aria-hidden': true as const }));

  function registerLabel(id: string) {
    labelId.value = id;
    return () => {
      if (labelId.value === id) {
        labelId.value = undefined;
      }
    };
  }

  return { state, rootProps, trackProps, indicatorProps, valueProps, registerLabel };
}

function clamp(value: number, lower: number, upper: number): number {
  return Math.min(Math.max(value, lower), upper);
}

function format(
  value: number,
  options: Intl.NumberFormatOptions | undefined,
  locale: Intl.LocalesArgument | undefined
): string {
  if (!options) return String(value);

  return new Intl.NumberFormat(locale as Intl.LocalesArgument, options).format(value);
}

export const { provideContext: provideGaugeContext, useContext: useGaugeContext } =
  createContext<UseGaugeReturn>('Gauge');
