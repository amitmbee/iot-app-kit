import React, { useMemo, useState } from 'react';
import { useECharts } from '../../hooks/useECharts';
import { ChartOptions } from './types';
import { useVisualizedDataStreams } from './useVisualizedDataStreams';
import { convertOptions } from './converters/convertOptions';
import { SeriesOption, YAXisComponentOption } from 'echarts';
import { convertYAxis } from './converters/convertAxis';
import { convertSeriesAndYAxis, reduceSeriesAndYAxis } from './converters/convertSeriesAndYAxis';
import { HotKeys, KeyMap } from 'react-hotkeys';
import useTrendCursors from './useTrendCursors';

const keyMap: KeyMap = {
  commandDown: { sequence: 'command', action: 'keydown' },
  commandUp: { sequence: 'command', action: 'keyup' },
};

/**
 * Base chart to display Line, Scatter, and Bar charts.
 */
const Chart = ({ viewport, queries, size, ...options }: ChartOptions) => {
  const { isLoading, dataStreams } = useVisualizedDataStreams(queries, viewport);
  const { axis } = options;
  const defaultSeries: SeriesOption[] = [];
  const defaultYAxis: YAXisComponentOption[] = [convertYAxis(axis)];
  // Need series data for the calculation of Y for rendering a circle at TS and series lines intersections
  const { series, yAxis } = useMemo(
    () =>
      dataStreams
        .map(convertSeriesAndYAxis(options as ChartOptions))
        .reduce(reduceSeriesAndYAxis, { series: defaultSeries, yAxis: defaultYAxis }),
    [dataStreams]
  );
  const [trendCursors, setTrendCursors] = useState(options.graphic ?? []);
  const [isInCursorAddMode, setIsInCursorAddMode] = useState(false);
  const option = {
    ...convertOptions({
      ...options,
      viewport,
      queries,
      size,
      seriesLength: series.length,
    }),
    series,
    yAxis,
    graphic: trendCursors,
  };

  const { ref } = useECharts({
    option,
    loading: isLoading,
    size,
  });

  useTrendCursors(ref, trendCursors, size, isInCursorAddMode, setTrendCursors, viewport);

  const handlers = {
    commandDown: () => setIsInCursorAddMode(true),
    commandUp: () => setIsInCursorAddMode(false),
  };

  return (
    <HotKeys keyMap={keyMap} handlers={handlers}>
      <div ref={ref} style={{ width: size?.width, height: size?.height }} />
    </HotKeys>
  );
};

export default Chart;
