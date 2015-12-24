import React from 'react';
import PureRender from 'pure-render-decorator';
import _ from 'lodash';
import memoize from 'memoizee';
import d3Scale from 'd3-scale';

import BrushLayer from '../core/layers/BrushLayer';
import InteractionCaptureLayer from '../core/layers/InteractionCaptureLayer';
import HoverLayer from '../core/layers/HoverLayer';
import YAxisLayer from '../core/layers/YAxisLayer';
import XAxisLayer from '../core/layers/XAxisLayer';
import Stack from '../core/Stack';
import corePropTypes from '../core/propTypes';
import propTypes from './propTypes';

import MetadataDrivenDataLayer from './layers/MetadataDrivenDataLayer';

const DEFAULT_COLOR = 'rgba(0, 0, 0, 0.7)';

function setMetadataYScale(series) {
  return _.chain(series)
    .mapValues(s =>
      _.defaults({
        layerProps: _.defaults({
          yScale: d3Scale.log
        }, s.layerProps)
      }, s)
    )
    .value();
}

function unifyYDomains(series) {
  if (series.length === 0) {
    return {
      unifiedYDomain: {
        min: 0.5,
        max: 15
      },
      unifiedYDomainColor: DEFAULT_COLOR,
      seriesWithUnifiedYDomain: []
    }
  } else {
    const domains = _.pluck(series, 'yDomain');
    const unifiedYDomain = {
      // Hack(-ish): log scales must be strictly positive or negative. For now, assume positive.
      // https://github.com/d3/d3-scale#log-scales
      min: Math.max(1, _.min(domains, 'min').min),
      max: _.max(domains, 'max').max
    };
    const unifiedYDomainColor = _.chain(series)
      .pluck('layerProps.color')
      .reduce((a, b) => a === b ? a : DEFAULT_COLOR)
      .value();
    const seriesWithUnifiedYDomain = series.map(s => _.defaults({ yDomain: unifiedYDomain }, s));

    return {
      unifiedYDomain,
      unifiedYDomainColor,
      seriesWithUnifiedYDomain
    };
  }
}

const memoizedSetMetadataYScale = memoize(setMetadataYScale, { max: 10 });
const memoizedUnifyYDomains = memoize(unifyYDomains, { max: 10 });

@PureRender
class CombinedLogChart extends React.Component {
  static propTypes = {
    xDomain: corePropTypes.range,
    series: React.PropTypes.arrayOf(propTypes.series),
    selection: corePropTypes.range,
    hover: React.PropTypes.number,

    onPan: React.PropTypes.func,
    onZoom: React.PropTypes.func,
    onHover: React.PropTypes.func,
    onBrush: React.PropTypes.func
  };

  static defaultProps = {
    series: []
  };

  render() {
    const metadataBySeriesIdWithScale = memoizedSetMetadataYScale(this.props.series);

    const {
      unifiedYDomain,
      unifiedYDomainColor,
      seriesWithUnifiedYDomain
    } = memoizedUnifyYDomains(this.props.series);

    return (
      <div className='log-chart'>
        <Stack className='chart-body'>
          <MetadataDrivenDataLayer
            xDomain={this.props.xDomain}
            series={seriesWithUnifiedYDomain}
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
            yDomains={[ unifiedYDomain ]}
            scales={[ d3Scale.log ]}
            colors={[ unifiedYDomainColor ]}
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

export default CombinedLogChart;
