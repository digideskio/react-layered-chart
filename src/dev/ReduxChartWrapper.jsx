import React from 'react';
import PureRender from 'pure-render-decorator';
import _ from 'lodash';

import InteractionActions from './flux/InteractionActions';
import SelectFromStore from './mixins/SelectFromStore';

@PureRender
@SelectFromStore
class ReduxChartWrapper extends React.Component {
  static propTypes = {
    store: React.PropTypes.object.isRequired,
    children: React.PropTypes.element.isRequired,
    seriesIds: React.PropTypes.arrayOf(React.PropTypes.string).isRequired
  };

  static selectFromStore = {
    xDomain: 'xDomain',
    yDomainBySeriesId: 'yDomainBySeriesId',
    metadataBySeriesId: 'metadataBySeriesId',
    dataBySeriesId: 'dataBySeriesId',
    selection: 'selection',
    hover: 'hover'
  };

  _onHover = (xPos) => {
    this.props.store.dispatch(InteractionActions.hover(xPos));
  };

  _onPan = (deltaX) => {
    this.props.store.dispatch(InteractionActions.pan(deltaX));
  };

  _onZoom = (factor, focus) => {
    this.props.store.dispatch(InteractionActions.zoom(factor, focus));
  };

  _onBrush = (brush) => {
    this.props.store.dispatch(InteractionActions.brush(brush));
  };

  render() {
    return React.cloneElement(React.Children.only(this.props.children), _.extend({
      onHover: this._onHover,
      onPan: this._onPan,
      onZoom: this._onZoom,
      onBrush: this._onBrush
    }, this._denormalizeSeries(), _.pick(this.state, 'selection', 'hover', 'xDomain')));
  }

  _denormalizeSeries() {
    const series = this.props.seriesIds.map(seriesId => ({
      seriesId,
      yDomain: this.state.yDomainBySeriesId[seriesId],
      data: this.state.dataBySeriesId[seriesId] || [],
      layerProps: this.state.metadataBySeriesId[seriesId]
    }));
    return { series };
  }
}

export default ReduxChartWrapper;
