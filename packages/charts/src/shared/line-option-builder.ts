// packages/charts/src/shared/line-option-builder.ts

export type LineChartSeries = {
  name: string;
  data: (number | [number | string, number] | null)[];
};

export type MarkLineSpec = {
  value: number;
  label?: string;
  color?: string;
};

export type LineOptionProps = {
  smooth?: boolean | number;
  zoom?: boolean;
  markLines?: MarkLineSpec[];
  stacked?: boolean;   // area chart only — ignored in 'line' mode
  opacity?: number;    // area chart only — default 0.6
};

export function buildLineOption(
  series: LineChartSeries[],
  props: LineOptionProps,
  mode: 'line' | 'area'
): Record<string, unknown> {
  const isArea = mode === 'area';

  const echartsSeriesArray = series.map((s, i) => ({
    name: s.name,
    type: 'line' as const,
    data: s.data,
    smooth: props.smooth ?? false,
    // Area mode: add areaStyle with semi-transparency for readability
    areaStyle: isArea ? { opacity: props.opacity ?? 0.6 } : undefined,
    // Stacking: all series share the same group string — boolean true would NOT work (ECharts pitfall)
    stack: isArea && props.stacked ? 'total' : undefined,
    // markLine only on the first series to prevent duplicate threshold lines per series
    markLine:
      i === 0 && props.markLines?.length
        ? {
            silent: false,
            data: props.markLines.map((ml) => ({
              yAxis: ml.value,
              name: ml.label ?? '',
              lineStyle: ml.color ? { color: ml.color } : undefined,
            })),
          }
        : undefined,
  }));

  const option: Record<string, unknown> = {
    legend: { show: series.length > 1 },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', boundaryGap: false },
    yAxis: { type: 'value' },
    series: echartsSeriesArray,
  };

  if (props.zoom) {
    option['dataZoom'] = [
      { type: 'inside', xAxisIndex: 0 },
      { type: 'slider', xAxisIndex: 0, bottom: 0 },
    ];
  }

  return option;
}
