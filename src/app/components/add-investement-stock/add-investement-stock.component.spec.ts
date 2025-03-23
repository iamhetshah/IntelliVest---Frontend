import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddInvestementStockComponent } from './add-investement-stock.component';

describe('AddInvestementStockComponent', () => {
  let component: AddInvestementStockComponent;
  let fixture: ComponentFixture<AddInvestementStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddInvestementStockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddInvestementStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
