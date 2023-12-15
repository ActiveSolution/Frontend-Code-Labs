import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityKeypadComponent } from './security-keypad.component';

describe('SecurityKeypadComponent', () => {
  let component: SecurityKeypadComponent;
  let fixture: ComponentFixture<SecurityKeypadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecurityKeypadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SecurityKeypadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
