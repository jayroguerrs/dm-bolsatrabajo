import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicDatepickerComponent } from './dynamic-datepicker.component';

describe('DynamicDatepickerComponent', () => {
  let component: DynamicDatepickerComponent;
  let fixture: ComponentFixture<DynamicDatepickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicDatepickerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DynamicDatepickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
