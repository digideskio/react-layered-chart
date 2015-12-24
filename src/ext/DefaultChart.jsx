import React from 'react';
import PureRender from 'pure-render-decorator';
import _ from 'lodash';
import memoize from 'memoizee';

import BrushLayer from '../core/layers/BrushLayer';
import InteractionCaptureLayer from '../core/layers/InteractionCaptureLayer';
import HoverLayer from '../core/layers/HoverLayer';
import YAxisLayer from '../core/layers/YAxisLayer';
import XAxisLayer from '../core/layers/XAxisLayer';
import Stack from '../core/Stack';
import corePropTypes from '../core/propTypes';
import propTypes from './propTypes';

import MetadataDrivenDataLayer from './layers/MetadataDrivenDataLayer';
import { mergeRangesOfSameType } from './util';

const DEFAULT_COLOR = 'rgba(0, 0, 0, 0.7)';

function getMergedYDomains(shouldMerge, series) {
  if (series.length === 0) {
    return {
      orderedYDomains: [{
        min: -1.25,
        max: 1.25
      }],
      orderedColors: [ DEFAULT_COLOR ],
      seriesWithMergedYDomains: []
    };
  } else {
    const rangeGroups = shouldMerge
      ? mergeRangesOfSameType(series, yDomainBySeriesId, metadataBySeriesId)
      : series.map(s => ({
          range: s.yDomain,
          color: _.get(s, 'layerProps.color'),
          seriesIds: [ s.seriesId ]
        }));

    const seriesWithMergedYDomains = series.map(s => _.defaults({
      yDomain: _.find(rangeGroups, group => _.contains(group.seriesIds, s.seriesId)).range
    }, s));

    return {
      seriesWithMergedYDomains,
      orderedYDomains: _.pluck(rangeGroups, 'range'),
      orderedColors: _.pluck(rangeGroups, 'color')
    }
  }
}

const memoizedGetMergedYDomains = memoize(getMergedYDomains, { max: 10 });

@PureRender
class DefaultChart extends React.Component {
  static propTypes = {
    xDomain: corePropTypes.range,
    series: React.PropTypes.arrayOf(propTypes.series),
    selection: corePropTypes.range,
    hover: React.PropTypes.number,

    mergeAxesOfSameType: React.PropTypes.bool,
    onPan: React.PropTypes.func,
    onZoom: React.PropTypes.func,
    onHover: React.PropTypes.func,
    onBrush: React.PropTypes.func
  };

  static defaultProps = {
    xDomain: { min: 0, max: 0 },
    series: []
  };

  render() {
    const {
      seriesWithMergedYDomains,
      orderedYDomains,
      orderedColors
    } = memoizedGetMergedYDomains(this.props.mergeAxesOfSameType, this.props.series);

    return (
      <div className='default-chart'>
        <Stack className='chart-body'>
          <MetadataDrivenDataLayer
            xDomain={this.props.xDomain}
            series={seriesWithMergedYDomains}
          />
          <BrushLayer
            xDomain={this.props.xDomain}
            selection={this.props.selection}
          />
          <InteractionCaptureLayer
            xDomain={this.props.xDomain}
            onHover={this.props.onHover}
            onPan={this.props.onPan}
            onZoom={this.props.onZoom}
            onBrush={this.props.onBrush}
          />
          <HoverLayer
            xDomain={this.props.xDomain}
            hover={this.props.hover}
          />
          <YAxisLayer
            yDomains={orderedYDomains}
            colors={orderedColors}
          />
        </Stack>
        <Stack className='time-axis'>
          <XAxisLayer
            xDomain={this.props.xDomain}
          />
        </Stack>
      </div>
    );
  }
}

export default DefaultChart;
