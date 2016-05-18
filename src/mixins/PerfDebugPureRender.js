import _ from 'lodash';
import shallowequal from 'shallowequal';

import mixinToDecorator from './mixinToDecorator';

function logUsefulStuff(current, next, propsOrState, componentName) {
  const currentKeys = _.keys(current);
  const nextKeys =  _.keys(next);
  const addedKeys = _.difference(nextKeys, currentKeys);
  const removedKeys = _.difference(currentKeys, nextKeys);
  if (addedKeys.length) {
    console.log(`${componentName} updated because ${propsOrState} had keys added: `, _.pick(next, addedKeys));
  }
  if (removedKeys.length) {
    console.log(`${componentName} updated because ${propsOrState} had keys removed: `, _.pick(current, removedKeys));
  }

  const changedKeys = {};
  _.each(_.intersection(currentKeys, nextKeys), key => {
    if (current[key] !== next[key]) {
      changedKeys[key] = [ current[key], next[key] ];
    }
  });

  if (_.size(changedKeys)) {
    console.log(`${componentName} updated because ${propsOrState} had changed keys, [ from, to ] pairs: `, changedKeys);
  }

  const equivalentChangedKeys = [];
  _.each(changedKeys, ([ current, next ], key) => {
    if (_.isEqual(current, next)) {
      equivalentChangedKeys.push(key);
    }
  });

  if (equivalentChangedKeys.length) {
    console.log(`${componentName} updated but some keys in ${propsOrState} are value-equals: `, equivalentChangedKeys);
  }
}

export const mixin = {
  shouldComponentUpdate: function(nextProps, nextState) {
    const shouldUpdate = !shallowequal(nextProps, this.props) || !shallowequal(nextState, this.state);
    if (shouldUpdate) {
      logUsefulStuff(this.props, nextProps, 'props', this.constructor.name);
      logUsefulStuff(this.state, nextState, 'state', this.constructor.name);
    }
    return shouldUpdate;
  }
};

export const decorator = mixinToDecorator(mixin);
