import React from 'react';
import PureRender from 'pure-render-decorator';
import d3Scale from 'd3-scale';
import _ from 'lodash';

import CanvasRender from '../mixins/CanvasRender';
import AnimateProps from '../mixins/AnimateProps';

import AutoresizingCanvasLayer from './AutoresizingCanvasLayer';
import { getVisibleIndexBounds } from '../util';

@PureRender
@CanvasRender
@AnimateProps
class SimpleLineLayer extends React.Component {
  static propTypes = {
    data: React.PropTypes.arrayOf(React.PropTypes.shape({
      timestamp: React.PropTypes.number.isRequired,
      value: React.PropTypes.number.isRequired
    })).isRequired,
    xDomain: React.PropTypes.shape({
      start: React.PropTypes.number.isRequired,
      end: React.PropTypes.number.isRequired
    }).isRequired,
    yDomain: React.PropTypes.shape({
      start: React.PropTypes.number.isRequired,
      end: React.PropTypes.number.isRequired
    }).isRequired,
    yScale: React.PropTypes.func,
    stroke: React.PropTypes.string,
    fill: React.PropTypes.string
  };

  static defaultProps = {
    yScale: d3Scale.linear,
    stroke: 'rgba(0, 0, 0, 0.7)',
    fill: null
  };

  animatedProps = {
    yDomain: 1000
  };

  render() {
    return <AutoresizingCanvasLayer ref='canvasLayer' onSizeChange={this.canvasRender}/>;
  }

  canvasRender = () => {
    const canvas = this.refs.canvasLayer.getCanvasElement();
    const { width, height } = this.refs.canvasLayer.getDimensions();
    const context = canvas.getContext('2d');
    context.resetTransform();
    context.clearRect(0, 0, width, height);
    context.translate(0.5, 0.5);

    // Should we draw something if there is one data point?
    if (this.props.data.length < 2) {
      return;
    }

    const { firstIndex, lastIndex } = getVisibleIndexBounds(this.props.data, this.props.xDomain);
    if (firstIndex === lastIndex) {
      return;
    }

    const xScale = d3Scale.linear()
      .domain([ this.props.xDomain.start, this.props.xDomain.end ])
      .rangeRound([ 0, width ]);

    const yScale = this.props.yScale()
      .domain([ this.state['animated-yDomain'].start, this.state['animated-yDomain'].end ])
      .rangeRound([ height, 0 ]);

    context.beginPath();

    context.moveTo(xScale(this.props.data[firstIndex].timestamp), yScale(this.props.data[firstIndex].value));
    for (let i = firstIndex + 1; i <= lastIndex; ++i) {
      context.lineTo(xScale(this.props.data[i].timestamp), yScale(this.props.data[i].value));
    }

    if (this.props.stroke) {
      context.lineWidth = 1;
      context.strokeStyle = this.props.stroke;
      context.stroke();
    }

    if (this.props.fill) {
      context.lineTo(xScale(this.props.data[lastIndex].timestamp), height);
      context.lineTo(xScale(this.props.data[firstIndex].timestamp), height);
      context.closePath();
      context.fillStyle = this.props.fill;
      context.fill();
    }
  }
}

export default SimpleLineLayer;
