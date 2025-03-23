import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddInvestementComponent } from './add-investement.component';

describe('AddInvestementComponent', () => {
  let component: AddInvestementComponent;
  let fixture: ComponentFixture<AddInvestementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddInvestementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddInvestementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
