import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardInvestementsTableComponent } from './dashboard-investements-table.component';

describe('DashboardInvestementsTableComponent', () => {
  let component: DashboardInvestementsTableComponent;
  let fixture: ComponentFixture<DashboardInvestementsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardInvestementsTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardInvestementsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
