import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../event.service';
import { IMotionSensorState } from '../sensor-data-feed.service';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-motion-sensor',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './motion-sensor.component.html',
  styleUrl: './motion-sensor.component.css'
})
export class MotionSensorComponent {
  @Input({ required: true }) state!: IMotionSensorState;
  motionDetected: boolean = false;

  constructor(eventService: EventService) {
    eventService.registerEvent({ message: 'Motion sensor initialized', timestamp: new Date() });
  }
}
