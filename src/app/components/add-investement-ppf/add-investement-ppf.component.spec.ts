import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddInvestementPpfComponent } from './add-investement-ppf.component';

describe('AddInvestementPpfComponent', () => {
  let component: AddInvestementPpfComponent;
  let fixture: ComponentFixture<AddInvestementPpfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddInvestementPpfComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddInvestementPpfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
