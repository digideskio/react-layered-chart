import { Range } from 'react-layered-chart';

import { Action, ActionType } from '../model/ActionType';
import { TBySeriesId } from '../model/typedefs';
import { requestDataLoad } from './dataActions';

export function setXDomain(payload: Range, isOverride: boolean = false) {
  return _dispatchAndRequestLoad({
    type: isOverride ? ActionType.SET_OVERRIDE_X_DOMAIN : ActionType.SET_X_DOMAIN,
    payload
  });
}

export function setYDomain(payload: TBySeriesId<Range>, isOverride: boolean = false) {
  return {
    type: isOverride ? ActionType.SET_OVERRIDE_Y_DOMAINS : ActionType.SET_Y_DOMAINS,
    payload
  };
}

export function setPhysicalChartWidth(payload: number) {
  return _dispatchAndRequestLoad({
    type: ActionType.SET_CHART_PHYSICAL_WIDTH,
    payload
  });
}

export function setHover(payload: number, isOverride: boolean = false) {
  return {
    type: isOverride ? ActionType.SET_OVERRIDE_HOVER : ActionType.SET_HOVER,
    payload
  };
}

export function setSelection(payload: Range, isOverride: boolean = false) {
  return {
    type: isOverride ? ActionType.SET_OVERRIDE_SELECTION : ActionType.SET_SELECTION,
    payload
  };
}

function _dispatchAndRequestLoad<P>(action: Action<P>) {
  return (dispatch, getState) => {
    dispatch(action);
    dispatch(requestDataLoad());
  };
}
