import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestementAnalysisStockComponent } from './investement-analysis-stock.component';

describe('InvestementAnalysisStockComponent', () => {
  let component: InvestementAnalysisStockComponent;
  let fixture: ComponentFixture<InvestementAnalysisStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestementAnalysisStockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestementAnalysisStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
