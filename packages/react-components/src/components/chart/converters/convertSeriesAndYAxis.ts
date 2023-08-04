import { useMemo, useRef } from 'react';
import { DataStream } from '@iot-app-kit/core';
import { ECharts, SeriesOption, YAXisComponentOption } from 'echarts';

import { ChartAxisOptions, ChartStyleSettingsOptions } from '../types';
import { convertDataPoint } from './convertDataPoint';
import { StyleSettingsMap, getChartStyleSettingsFromMap } from './convertStyles';
import { convertYAxis as convertChartYAxis } from './convertAxis';

const stepTypes: NonNullable<ChartStyleSettingsOptions['visualizationType']>[] = [
  'step-end',
  'step-middle',
  'step-start',
];
const convertVisualizationType = (
  visualizationType: Required<Pick<ChartStyleSettingsOptions, 'visualizationType'>>['visualizationType']
) => (stepTypes.includes(visualizationType) ? 'line' : visualizationType);

const convertStep = (
  visualizationType: Required<Pick<ChartStyleSettingsOptions, 'visualizationType'>>['visualizationType']
) => {
  if (!stepTypes.includes(visualizationType)) return false;

  let step;
  switch (visualizationType) {
    case 'step-start':
      step = 'start';
      break;
    case 'step-end':
      step = 'end';
      break;
    case 'step-middle':
      step = 'middle';
      break;
  }

  return step;
};

const convertSeries = (
  { data, id, name }: DataStream,
  { visualizationType, color, symbol, symbolColor, symbolSize, lineStyle, lineThickness }: ChartStyleSettingsOptions
) =>
  ({
    id,
    name: name,
    data: data.map(convertDataPoint),
    type: convertVisualizationType(visualizationType ?? 'line'),
    step: convertStep(visualizationType ?? 'line'),
    symbol,
    symbolSize,
    itemStyle: {
      color: symbolColor ?? color,
    },
    lineStyle: {
      color,
      type: lineStyle,
      width: lineThickness,
    },
  } as SeriesOption);

const convertYAxis = ({ color, yAxis }: ChartStyleSettingsOptions): YAXisComponentOption | undefined =>
  yAxis && {
    show: false,
    name: yAxis.yAxisLabel,
    min: yAxis.yMin,
    max: yAxis.yMax,
    position: 'right',
    alignTicks: true,
    axisLine: {
      lineStyle: {
        color: color,
      },
    },
  };

export const convertSeriesAndYAxis = (styles: ChartStyleSettingsOptions) => (dataStream: DataStream) => {
  const series = convertSeries(dataStream, styles);
  const yAxis = convertYAxis(styles);

  return {
    series,
    yAxis,
  };
};

const addYAxisIndex = <T extends SeriesOption>(series: T, yAxisIndex = 0): T => ({
  ...series,
  yAxisIndex,
});

type SeriesAndYAxis = ReturnType<ReturnType<typeof convertSeriesAndYAxis>>;

type ReducedSeriesAndYAxis = { series: SeriesAndYAxis['series'][]; yAxis: NonNullable<SeriesAndYAxis['yAxis']>[] };

export const reduceSeriesAndYAxis = (
  acc: ReducedSeriesAndYAxis,
  { series, yAxis }: SeriesAndYAxis
): ReducedSeriesAndYAxis => {
  /**
   * Link series to the y axis if it has one
   * the default axis is first in the list
   */
  const yAxisIndex = yAxis ? acc.yAxis.length : 0;

  return {
    series: [...acc.series, addYAxisIndex(series, yAxisIndex)],
    yAxis: yAxis ? [...acc.yAxis, yAxis] : [...acc.yAxis],
  };
};

const mapDatastreamsDeps = (datastreams: DataStream[]) =>
  JSON.stringify(datastreams.map((datastream) => datastream.id));

/**
 *
 * @param chartRef echarts reference
 * @param datastreams latest value for datastreams
 * @param { styleSettings, axis }
 *
 * hook to convert datastreams into echarts series option.
 * The hook also handles updating the series option on the echarts reference.
 *
 * @returns datastreams converted to echarts series
 */
export const useSeriesAndYAxis = (
  chartRef: React.MutableRefObject<ECharts | null>,
  datastreams: DataStream[],
  { styleSettings, axis }: { styleSettings: StyleSettingsMap; axis?: ChartAxisOptions }
) => {
  const defaultSeries: SeriesOption[] = [];
  const defaultYAxis: YAXisComponentOption[] = [convertChartYAxis(axis)];

  const getStyles = getChartStyleSettingsFromMap(styleSettings);
  const datastreamsDepsRef = useRef(mapDatastreamsDeps(datastreams));

  const { series, yAxis } = useMemo(() => {
    const { series: mappedSeries, yAxis: mappedYAxis } = datastreams
      .map((datastream) => convertSeriesAndYAxis(getStyles(datastream))(datastream))
      .reduce(reduceSeriesAndYAxis, { series: defaultSeries, yAxis: defaultYAxis });

    const updatedDatastreamsDeps = mapDatastreamsDeps(datastreams);

    /**
     * if the datastreams change update echarts using the replaceMerge stratgey
     * so that it is ensured that orphanced data points are removed.
     */
    const settings = datastreamsDepsRef.current !== updatedDatastreamsDeps ? { replaceMerge: ['series'] } : undefined;

    chartRef.current?.setOption(
      {
        title: {
          text: mappedSeries.length === 0 ? 'No data present' : '',
        },
        series: mappedSeries,
        yAxis: mappedYAxis,
      },
      settings
    );

    datastreamsDepsRef.current = updatedDatastreamsDeps;

    return { series: mappedSeries, yAxis: mappedYAxis };
  }, [datastreams]);

  return { series, yAxis };
};
