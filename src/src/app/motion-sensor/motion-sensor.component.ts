import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../event.service';

@Component({
  selector: 'app-motion-sensor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './motion-sensor.component.html',
  styleUrl: './motion-sensor.component.css'
})
export class MotionSensorComponent {
  motionDetected: boolean = false;

  constructor(private eventService: EventService) {
    eventService.registerEvent({ message: 'Motion sensor initialized', timestamp: new Date() });
  }

  setMotionDetected(): void {
    this.motionDetected = true;

    this.eventService.registerEvent({ message: 'Motion detected', timestamp: new Date() });

    this.motionEvent.emit(true);
  }

  clearMotion(): void {
    this.motionDetected = false;

    this.eventService.registerEvent({ message: 'Motion cleared', timestamp: new Date() });

    this.motionEvent.emit(false);
  }

  @Output() motionEvent = new EventEmitter<boolean>();
}
