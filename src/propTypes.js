import React from 'react';

const range = React.PropTypes.shape({
  min: React.PropTypes.number.isRequired,
  max: React.PropTypes.number.isRequired
});

const dataPoint = React.PropTypes.shape({
  timestamp: React.PropTypes.number.isRequired,
  value: React.PropTypes.number.isRequired
});

export default {
  range,
  dataPoint
};
