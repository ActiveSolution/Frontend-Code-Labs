import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { SensorDataFeedService } from './sensor-data-feed.service';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private events: Event[] = [];
  private subject$ = new ReplaySubject<Event[]>(10);

  events$: Observable<Event[]> = this.subject$.asObservable();

  constructor(sensorDataFeedService: SensorDataFeedService) { 
    sensorDataFeedService.motionSensorStream$.subscribe((data) => {
      this.registerEvent({ message: data.message, timestamp: data.timestamp });
    });
  }

  registerEvent(event: Event): void {
    if(this.events.length >= 20) {
      this.events.shift();
    }

    this.events.push(event);

    this.subject$.next(this.events);
  }
}

export interface Event {
  message: string;
  timestamp: Date;
}