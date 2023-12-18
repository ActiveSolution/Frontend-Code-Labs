import { Injectable } from '@angular/core';
import { Observable, interval, map, merge, scan, tap } from 'rxjs';
import { changeState } from './actions/motion.actions';
import { IMotionSensorState } from './reducers';
import { Store } from '@ngrx/store';

@Injectable({
  providedIn: 'root',
})
export class SensorDataFeedService {
  constructor(private store: Store) {
    let motionSensors: MotionSensorStateEmitter[] = [];

    for (let i = 0; i < 10; i++) {
      motionSensors.push(new MotionSensorStateEmitter(i));
    }

    this.motionSensorStream$ = merge(
      ...motionSensors.map((sensor) => sensor.startListen())
    ).pipe(
      tap((data) => {
        this.store.dispatch(changeState({ state: data }));
      })
    );
    // .pipe(
    //   filter(data => data.state !== data.prevousState));
  }

  motionSensorStream$: Observable<IMotionSensorState>;
}

class MotionSensorStateEmitter {
  constructor(private id: number) {}

  public startListen(): Observable<IMotionSensorState> {
    var resolution = Math.max(2500, Math.random() * 10000);

    return interval(resolution).pipe(
      map(() => Math.random() < 0.2),
      map((state) => {
        return {
          state: state,
          previousState: false,
          message: state ? 'Motion Detected' : 'No Motion Detected',
          timestamp: new Date(),
          name: `Motion Sensor ${this.id.toString()}`,
          id: this.id.toString(),
        };
      }),
      scan((acc, curr) => {
        return {
          ...curr,
          previousState: acc.state,
        };
      })
    );
  }
}
