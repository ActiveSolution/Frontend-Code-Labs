import { Component, Input, Output, EventEmitter  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../event.service';

@Component({
  selector: 'app-security-keypad',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './security-keypad.component.html',
  styleUrl: './security-keypad.component.css'
})
export class SecurityKeypadComponent {
  @Input() code?: string;

  constructor(private eventService: EventService) {
    eventService.registerEvent({ message: 'Key pad initialized', timestamp: new Date() });
  }

  keyPress(key: string): void {
    this.eventService.registerEvent({ message: `Key ${key} pressed`, timestamp: new Date() });

    if(key === this.code) {
      this.eventService.registerEvent({ message: 'Correct code inputted', timestamp: new Date() });

      this.correctCodeInput.emit();
    }
  }

  @Output() correctCodeInput = new EventEmitter<void>();
}
