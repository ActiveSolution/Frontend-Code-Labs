import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private events: Event[] = [];
  private subject$ = new ReplaySubject<Event[]>(10);

  events$: Observable<Event[]> = this.subject$.asObservable();

  constructor() { 
  }

  registerEvent(event: Event): void {
    this.events.push(event);

    this.subject$.next(this.events);
  }
}

export interface Event {
  message: string;
  timestamp: Date;
}