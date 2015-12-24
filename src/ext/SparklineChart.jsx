import React from 'react';
import PureRender from 'pure-render-decorator';

import Stack from '../core/Stack';
import corePropTypes from '../core/propTypes';
import propTypes from './propTypes';

import MetadataDrivenDataLayer from './layers/MetadataDrivenDataLayer';

@PureRender
class SparklineChart extends React.Component {
  static propTypes = {
    xDomain: corePropTypes.range,
    series: React.PropTypes.arrayOf(propTypes.series)
  };

  static defaultProps = {
    xDomain: { min: 0, max: 0 },
    series: []
  };

  render() {
    return (
      <Stack className='sparkline-chart'>
        <MetadataDrivenDataLayer
          xDomain={this.props.xDomain}
          series={this.props.series}
        />
      </Stack>
    );
  }
}

export default SparklineChart;
