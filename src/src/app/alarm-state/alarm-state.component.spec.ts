import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlarmStateComponent } from './alarm-state.component';

describe('AlarmStateComponent', () => {
  let component: AlarmStateComponent;
  let fixture: ComponentFixture<AlarmStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlarmStateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AlarmStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
