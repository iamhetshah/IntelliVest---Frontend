import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddInvestementGoldComponent } from './add-investement-gold.component';

describe('AddInvestementGoldComponent', () => {
  let component: AddInvestementGoldComponent;
  let fixture: ComponentFixture<AddInvestementGoldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddInvestementGoldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddInvestementGoldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
