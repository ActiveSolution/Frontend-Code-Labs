import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventLogComponent } from './event-log.component';

describe('EventLogComponent', () => {
  let component: EventLogComponent;
  let fixture: ComponentFixture<EventLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventLogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EventLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
