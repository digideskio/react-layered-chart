import React from 'react';

import propTypes from '../core/propTypes';

export const series = React.PropTypes.shape({
  seriesId: React.PropTypes.string.isRequired,
  yDomain: propTypes.range.isRequired,
  data: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  layerProps: React.PropTypes.object
});

export default {
  series
}
