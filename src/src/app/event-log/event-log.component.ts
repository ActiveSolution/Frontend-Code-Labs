import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService, Event } from '../event.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-event-log',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-log.component.html',
  styleUrl: './event-log.component.css'
})
export class EventLogComponent {
  events$!: Observable<Event[]>
  constructor(private eventService: EventService) {
  }

  ngOnInit() {
    this.events$ = this.eventService.events$;
  }
}
