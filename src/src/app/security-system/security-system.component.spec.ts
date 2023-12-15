import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecuritySystemComponent } from './security-system.component';

describe('SecuritySystemComponent', () => {
  let component: SecuritySystemComponent;
  let fixture: ComponentFixture<SecuritySystemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecuritySystemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SecuritySystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
