import React from 'react';
import PureRender from 'pure-render-decorator';
import d3 from 'd3';
import _ from 'lodash';

import CanvasRender from '../mixins/CanvasRender';
import AutoresizingCanvasLayer from './AutoresizingCanvasLayer';
import { getVisibleIndexBounds } from '../util';

@PureRender
@CanvasRender
class BucketedLineLayer extends React.Component {
  static propTypes = {
    data: React.PropTypes.arrayOf(React.PropTypes.shape({
      bounds: React.PropTypes.shape({
        startTime: React.PropTypes.number.isRequired,
        endTime: React.PropTypes.number.isRequired,
        minValue: React.PropTypes.number.isRequired,
        maxValue: React.PropTypes.number.isRequired
      }).isRequired,
      earliestPoint: React.PropTypes.shape({
        timestamp: React.PropTypes.number.isRequired,
        value: React.PropTypes.number.isRequired
      }).isRequired,
      latestPoint: React.PropTypes.shape({
        timestamp: React.PropTypes.number.isRequired,
        value: React.PropTypes.number.isRequired
      }).isRequired
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
    color: React.PropTypes.string,
    yAnimationDuration: React.PropTypes.number
  };

  static defaultProps = {
    yScale: d3.scale.linear,
    color: 'rgba(0, 0, 0, 0.7)',
    yAnimationDuration: 300
  };

  state = {
    animatingYDomain: {
      start: this.props.yDomain.start,
      end: this.props.yDomain.end
    }
  };

  render() {
    return <AutoresizingCanvasLayer ref='canvasLayer' onSizeChange={this.canvasRender}/>;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.yDomain !== nextProps.yDomain) {
      if (this.props.yAnimationDuration > 0) {
        this._animateYDomain(this.state.animatingYDomain, nextProps.yDomain);
      } else {
        this.setState({
          animatingYDomain: nextProps.yDomain
        });
      }
    }
  }

  _animateYDomain(fromDomain, toDomain) {
    clearInterval(this.__yDomainAnimator);

    const interpolator = d3.interpolateObject(fromDomain, toDomain);
    const ease = d3.ease('cubic-in-out');

    let frame = 0;
    this.__yDomainAnimator = setInterval(() => {
      const t = ease(frame / 30);
      this.setState({
        animatingYDomain: _.clone(interpolator(t))
      });

      frame++;
      if (frame === 30) {
        clearInterval(this.__yDomainAnimator);
      }
    }, this.props.yAnimationDuration / 30);
  }

  canvasRender = () => {
    const canvas = this.refs.canvasLayer.getCanvasElement();
    const { width, height } = this.refs.canvasLayer.getDimensions();
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, width, height);

    // Should we draw something if there is one data point?
    if (this.props.data.length < 2) {
      return;
    }

    // const { firstIndex, lastIndex } = getVisibleIndexBounds(this.props.data, this.props.xDomain);
    // if (firstIndex === lastIndex) {
    //   return;
    // }

    const firstIndex = 0;
    const lastIndex = this.props.data.length - 1;

    // Don't use rangeRound -- it causes flicker as you pan/zoom because it doesn't consistently round in one direction.
    const xScale = d3.scale.linear()
      .domain([ this.props.xDomain.start, this.props.xDomain.end ])
      .range([ 0, width ]);

    const yScale = this.props.yScale()
      .domain([ this.state.animatingYDomain.start, this.state.animatingYDomain.end ])
      .range([ height, 0 ]);

    const getComputedValuesForIndex = _.memoize(i => {
      const datum = this.props.data[i];

      const earliestX = Math.floor(xScale(datum.earliestPoint.timestamp));
      const latestX = Math.floor(xScale(datum.latestPoint.timestamp));

      let preferredX1;
      let preferredX2;
      if (latestX - earliestX < 2) {
        // Arbitrarily choose one, for now...
        // TODO: Should do something smarter here; this jitters badly during zooming if all the bounds don't
        // match up exactly, since some will hit this branch earlier than others.
        preferredX1 = earliestX;
        preferredX2 = earliestX + 1;
      } else {
        preferredX1 = earliestX;
        preferredX2 = latestX;
      }

      return {
        earliestPoint: {
          x: earliestX,
          y: Math.floor(yScale(datum.earliestPoint.value))
        },
        latestPoint: {
          x: latestX,
          y: Math.floor(yScale(datum.latestPoint.value))
        },
        preferredBounds: {
          x1: preferredX1,
          x2: preferredX2,
          y1: Math.floor(yScale(datum.bounds.minValue)),
          y2: Math.floor(yScale(datum.bounds.maxValue))
        }
      };
    });

    // Bars
    context.beginPath();
    for (let i = firstIndex; i <= lastIndex; ++i) {
      const computedValues = getComputedValuesForIndex(i);
      context.rect(
        computedValues.preferredBounds.x1,
        height - computedValues.preferredBounds.y2,
        computedValues.preferredBounds.x2 - computedValues.preferredBounds.x1,
        computedValues.preferredBounds.y2 - computedValues.preferredBounds.y1
      );
    }
    context.fillStyle = this.props.color;
    context.fill();

    // Lines
    context.beginPath();
    const firstComputedValues = getComputedValuesForIndex(firstIndex);
    context.moveTo(firstComputedValues.preferredBounds.x2, height - firstComputedValues.latestPoint.y)
    for (let i = firstIndex + 1; i <= lastIndex; ++i) {
      const computedValues = getComputedValuesForIndex(i);
      // TODO: Skip any that have touching rectangles?
      context.lineTo(computedValues.preferredBounds.x1, height - computedValues.earliestPoint.y);
      context.moveTo(computedValues.preferredBounds.x2, height - computedValues.latestPoint.y);
    }
    context.strokeStyle = this.props.color;
    context.stroke();
  }
}

export default BucketedLineLayer;