import { createAction, props } from '@ngrx/store';
import { IMotionSensorState } from '../reducers';

export const changeState = createAction('[Motion] State change', props<{ state: IMotionSensorState }>());