import * as React from 'react';
import * as Promise from 'bluebird';

import { SeriesMetadata } from './state';
import { LayerCakeChartState } from '../export-only/exportableState';

export interface Range {
  min: number;
  max: number;
}

export interface DataPoint {
  timestamp: number;
  value: number;
}

export interface DataBucket {
  startTime: number;
  endTime: number;
  minValue: number;
  maxValue: number;
  firstValue: number;
  lastValue: number;
}

export type BooleanMouseEventHandler = (event: React.MouseEvent) => boolean;
export type ScaleFunction = Function;
export type Color = string;
export type SeriesId = string;
export type ChartId = string;
export type SeriesData = any[];
export type TBySeriesId<T> = { [seriesId: string]: T };
export type StateSelector<T> = (state: LayerCakeChartState) => T;
export type DataLoader = (seriesIds: SeriesId[],
                          metadataBySeriesId: TBySeriesId<SeriesMetadata>,
                          xDomain: Range,
                          chartPixelWidth: number,
                          currentData: TBySeriesId<SeriesData>) => TBySeriesId<Promise<SeriesData>>;
