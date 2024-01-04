import {
  createFeatureSelector,
  createSelector,
} from '@ngrx/store';

export interface State {
  motionSensorFeature: IMotionSensorFeatureState;
}

export interface IMotionSensorFeatureState {
  motionSensors: IMotionSensorState[];
}

export interface IMotionSensorState {
  state: boolean;
  previousState: boolean;
  message: string;
  timestamp: Date;
  name: string;
  id: string;
}

const getMotionSensorState = createFeatureSelector<IMotionSensorFeatureState>('motionSensors'); 

export const selectFeatureMotionSensor = createSelector(
  getMotionSensorState,
  (state: IMotionSensorFeatureState) => state.motionSensors
);