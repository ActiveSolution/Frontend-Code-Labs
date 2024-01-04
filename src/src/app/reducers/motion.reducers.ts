import { createReducer, on } from '@ngrx/store';
import { changeState } from '../actions/motion.actions';
import { IMotionSensorFeatureState } from './index';

export const initialState: IMotionSensorFeatureState = {
  motionSensors: [],
};

export const motionSensorReducer = createReducer(
  initialState,
  on(changeState, (state, props) => {
    let existing  = state.motionSensors.find((sensor) => sensor.id === props.state.id);

    if (existing) {
      return {
        ...state,
        motionSensors: state.motionSensors.map((sensor) => sensor.id === props.state.id ? props.state : sensor
        ),
      };
    }

    return {
      ...state,
      motionSensors: [...state.motionSensors, props.state],
    };
  }) 
);
