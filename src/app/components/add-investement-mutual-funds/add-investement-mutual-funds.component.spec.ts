import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddInvestementMutualFundsComponent } from './add-investement-mutual-funds.component';

describe('AddInvestementMutualFundsComponent', () => {
  let component: AddInvestementMutualFundsComponent;
  let fixture: ComponentFixture<AddInvestementMutualFundsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddInvestementMutualFundsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddInvestementMutualFundsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
