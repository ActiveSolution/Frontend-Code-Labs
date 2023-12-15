import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MotionSensorComponent } from '../motion-sensor/motion-sensor.component';
import { SecurityKeypadComponent } from '../security-keypad/security-keypad.component';
import { AlarmStateComponent } from '../alarm-state/alarm-state.component';
import { EventService } from '../event.service';

@Component({
  selector: 'app-security-system',
  standalone: true,
  imports: [CommonModule, MotionSensorComponent, SecurityKeypadComponent, AlarmStateComponent],
  templateUrl: './security-system.component.html',
  styleUrl: './security-system.component.css'
})
export class SecuritySystemComponent {
  alarmActive: boolean = false;
  alarmTriggered: boolean = false;
  code: string = '2';
  motionDetected: boolean = false;

  constructor(private eventService: EventService){
    eventService.registerEvent({ message: 'Security system initialized', timestamp: new Date() });
  }

  onMotion(motionDetected: boolean): void {
    this.motionDetected = motionDetected;

    if(this.motionDetected && this.alarmActive) {
      this.alarmTriggered = true;
      this.eventService.registerEvent({ message: 'Alarm triggered', timestamp: new Date() });
    }
  }

  onCodeMatch(): void {
    this.alarmActive = !this.alarmActive;
    this.eventService.registerEvent({ message: this.alarmActive ? 'Alarm activated' : 'Alarm deactivated', timestamp: new Date() });

    if(!this.alarmActive && this.alarmTriggered) {
      this.alarmTriggered = false;
      this.eventService.registerEvent({ message: 'Alarm cleared', timestamp: new Date() });
    }
  }
}
