import React from 'react';
import PureRender from 'pure-render-decorator';
import _ from 'lodash';

import SimpleLineLayer from '../../core/layers/SimpleLineLayer';
import BucketedLineLayer from '../../core/layers/BucketedLineLayer';
import BarLayer from '../../core/layers/BarLayer';
import PointLayer from '../../core/layers/PointLayer';
import TimeSpanLayer from '../../core/layers/TimeSpanLayer';

import LayerType from '../LayerType';
import corePropTypes from '../../core/propTypes';
import propTypes from '../propTypes';

const LAYER_BY_TYPE = {
  [LayerType.SIMPLE_LINE]: SimpleLineLayer,
  [LayerType.BUCKETED_LINE]: BucketedLineLayer,
  [LayerType.BAR]: BarLayer,
  [LayerType.POINT]: PointLayer,
  [LayerType.TIME_SPAN]: TimeSpanLayer
};

@PureRender
class MetadataDrivenDataLayer extends React.Component {
  static propTypes = {
    xDomain: corePropTypes.range.isRequired,
    series: React.PropTypes.arrayOf(propTypes.series).isRequired
  };

  render() {
    return (
      <div className='layer metadata-driven-data-layer'>
        {this.props.series.map(this._getLayerForSeries)}
      </div>
    );
  }

  _getLayerForSeries = (series) => {
    const baseLayerProps = _.extend({
      xDomain: this.props.xDomain,
    }, _.omit(series, 'layerProps'), series.layerProps);

    if (series.layerProps.layerType === LayerType.GROUP) {
      return <div className='layer-group' key={series.seriesId}>
        {series.layerProps.groupedSeries.map(({ seriesId, layerType}) =>
          this._renderBaseLayer(layerType, seriesId, baseLayerProps)
        )}
      </div>
    } else {
      return this._renderBaseLayer(series.layerProps.layerType, series.seriesId, baseLayerProps);
    }
  }

  _renderBaseLayer(layerType, seriesId, baseLayerProps) {
    const LayerClass = LAYER_BY_TYPE[layerType];
    if (LayerClass) {
      return <LayerClass {...baseLayerProps} key={seriesId}/>
    } else {
      console.warn('not rendering data layer of unknown type ' + metadata.layerType);
      return null;
    }
  }
}

export default MetadataDrivenDataLayer;
