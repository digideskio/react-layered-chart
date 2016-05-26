import * as _ from 'lodash';
import * as Promise from 'bluebird';
import { Range, DataPoint, DataBucket } from 'react-layered-chart';
import { v3, PointsBucket, StatisticsBucket } from '@stones/epoch-client';

import LayerType from '../model/LayerType';
import { TBySeriesId, SeriesId, SeriesData } from '../model/typedefs';
import { SeriesMetadata } from '../model/state';
import { extendRange, roundRange } from '../rangeUtils';
import { dataIsValidForRange } from '../dataUtils';

function _convertEpochBuckets(buckets: StatisticsBucket[]): DataBucket[] {
  return buckets.map(bucket => ({
    startTime: bucket.minDatumTime,
    endTime: bucket.maxDatumTime,
    minValue: bucket.minValue,
    maxValue: bucket.maxValue,
    firstValue: bucket.earliestValue,
    lastValue: bucket.latestValue
  }));
}

function _extractEpochPoints(buckets: PointsBucket[]): DataPoint[] {
  return _.flatten(buckets.map(bucket => bucket.points));
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
        return v3.summaryStatistics(seriesId, {
            startTime: xDomainToLoad.min,
            endTime: xDomainToLoad.max,
            period: Math.round((xDomainToLoad.max - xDomainToLoad.min) / chartPixelWidth)
          })
          .then(_convertEpochBuckets);

      case LayerType.POINT:
        return v3.summaryPoints(seriesId, {
            startTime: xDomainToLoad.min,
            endTime: xDomainToLoad.max,
            period: Math.round(xDomainToLoad.max - xDomainToLoad.min)
          })
          .then(_extractEpochPoints);

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
