import * as $ from 'jquery';
import * as _ from 'lodash';
import * as Promise from 'bluebird';
import { Range, DataPoint, DataBucket } from 'react-layered-chart';

import LayerType from '../model/LayerType';
import { TBySeriesId, SeriesId, SeriesData } from '../model/typedefs';
import { SeriesMetadata } from '../model/state';
import { extendRange, roundRange } from '../rangeUtils';
import { dataIsValidForRange } from '../dataUtils';

interface ChronicleRpcResponse<T> {
  status: string;
  statusMessage?: string;
  value: {
    startTime: number;
    endTime: number;
    latestPointInSourceSeries?: number;
    intervals: T[];
  };
}

interface ComputedChannelPointInterval {
  startTime: number;
  endTime: number;
  points: ComputedChannelPoint[];
}

interface ComputedChannelPoint {
  time: number;
  value: number;
}

interface ComputedChannelStatisticInterval {
  startTime: number;
  endTime: number;
  minValue: number;
  maxValue: number;
  minDatumTime: number;
  maxDatumTime: number;
  earliestValue: number;
  latestValue: number;
  timeOfMinValue: number;
  timeOfMaxValue: number;
}

function _convertComputedChannelStatistics(response: ChronicleRpcResponse<ComputedChannelStatisticInterval>): DataBucket[] {
  return response.value.intervals.map(bucket => ({
    startTime: bucket.minDatumTime,
    endTime: bucket.maxDatumTime,
    minValue: bucket.minValue,
    maxValue: bucket.maxValue,
    firstValue: bucket.earliestValue,
    lastValue: bucket.latestValue
  }));
}

function _convertComputedChannelPoints(response: ChronicleRpcResponse<ComputedChannelPointInterval>): DataPoint[] {
  return _.flatten(response.value.intervals.map(bucket => bucket.points.map(point => ({
    timestamp: point.time,
    value: point.value
  }))));
}

export default function(seriesIds: SeriesId[],
                        metadataBySeriesId: TBySeriesId<SeriesMetadata>,
                        xDomain: Range,
                        chartPixelWidth: number,
                        currentData: TBySeriesId<SeriesData>): TBySeriesId<Promise<SeriesData>> {

  function loadDataBasedOnType(seriesId) {
    const layerType = metadataBySeriesId[seriesId].layerType;
    const currentSeriesData = currentData[seriesId];

    if (dataIsValidForRange(currentSeriesData, layerType, xDomain)) {
      return Promise.resolve(currentSeriesData);
    }

    switch (layerType) {
      case LayerType.LINE:
        return Promise.resolve($.ajax({
          method: 'GET',
          dataType: 'json',
          contentType: 'application/json; charset=utf-8',
          url: 'api/chronicle/time-series-statistics',
          data: {
            id: seriesId,
            startTime: Math.round(xDomainToLoad.min),
            endTime: Math.round(xDomainToLoad.max),
            period: Math.round((xDomainToLoad.max - xDomainToLoad.min) / chartPixelWidth)
          }
        }))
        .then(_convertComputedChannelStatistics);

      case LayerType.POINT:
        return Promise.resolve($.ajax({
          method: 'GET',
          dataType: 'json',
          contentType: 'application/json; charset=utf-8',
          url: 'api/chronicle/time-series-points',
          data: {
            id: seriesId,
            startTime: Math.round(xDomainToLoad.min),
            endTime: Math.round(xDomainToLoad.max),
            period: Math.round(xDomainToLoad.max - xDomainToLoad.min)
          }
        }))
        .then(_convertComputedChannelPoints);

      default:
        return Promise.reject(new Error(`Cannot load data for series ${seriesId} because it didn't specify a known LayerType: ${layerType}.`));
    }
  }

  const xDomainToLoad = roundRange(extendRange(xDomain, 0.1));

  return (<any> _).fromPairs(seriesIds.map(seriesId => [
    seriesId,
    loadDataBasedOnType(seriesId)
  ]));
}
