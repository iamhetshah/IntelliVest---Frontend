import { Component, EventEmitter, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputNumber } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { Message } from 'primeng/message';
import { InvestementAnalysisStockComponent } from '../investement-analysis-stock/investement-analysis-stock.component';
import { HttpClient } from '@angular/common/http';
import backendApis from '../../app.constants';

@Component({
  selector: 'app-add-investement-mutual-funds',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    SelectModule,
    InputNumber,
    FloatLabelModule,
    ButtonModule,
    Message,
    FloatLabelModule,
    InvestementAnalysisStockComponent,
  ],
  templateUrl: './add-investement-mutual-funds.component.html',
  styleUrl: './add-investement-mutual-funds.component.css',
})
export class AddInvestementMutualFundsComponent {
  loading: boolean = false;

  @Output() closeModalEvent = new EventEmitter();
  tryAgainAnalyze = false;

  mfForm = new FormGroup({
    fundType: new FormControl(
      {
        name: '',
        value: '',
      },
      [Validators.required]
    ),
    investType: new FormControl(
      {
        name: '',
        value: '',
      },
      [Validators.required]
    ),
    investAmount: new FormControl(0, [Validators.required]),
    riskProfile: new FormControl(
      {
        name: '',
        value: '',
      },
      [Validators.required]
    ),
    investmentName: new FormControl(
      {
        name: '',
        value: '',
      },
      [Validators.required]
    ),
  });

  constructor(private http: HttpClient) {}
  saveInvestShow = false;
  load() {
    this.loading = true;

    setTimeout(() => {
      this.loading = false;
    }, 2000);
  }
  fundTypeTypes = [
    {
      name: 'Equity',
      value: 'Equity',
    },
    {
      name: 'Hybrid',
      value: 'Hybrid',
    },
    {
      name: 'Index',
      value: 'Index',
    },
    {
      name: 'Debt',
      value: 'Debt',
    },
  ];

  investNames = [
    { name: 'SBI Bluechip Fund', value: 'sbi_bluechip_fund' },
    { name: 'HDFC Equity Fund', value: 'hdfc_equity_fund' },
    { name: 'Mirae Asset Large Cap Fund', value: 'mirae_asset_large_cap_fund' },
    {
      name: 'ICICI Prudential Value Discovery Fund',
      value: 'icici_prudential_value_discovery_fund',
    },
    {
      name: 'Axis Growth Opportunities Fund',
      value: 'axis_growth_opportunities_fund',
    },
  ];

  riskTypeTypes = [
    {
      name: 'Low',
      value: 'Low',
    },
    {
      name: 'Medium',
      value: 'Medium',
    },
    {
      name: 'High',
      value: 'High',
    },
  ];

  investTypeTypes = [
    {
      name: 'Lump Sum',
      value: 'LUMP SUM',
    },
    {
      name: 'SIP',
      value: 'SIP',
    },
  ];

  sanitizedHtml = '';
  analyze() {
    if (this.mfForm.invalid) {
      return;
    }
    this.tryAgainAnalyze = false;
    this.loading = true;
    this.saveInvestShow = false;
    this.http
      .post<{ success: string; component: string }>(
        backendApis.analysis.stock,
        {
          mfInvestType: this.mfForm.getRawValue().investType?.name,
          mfCategory: this.mfForm.getRawValue().fundType?.name,
          investmentAmount: this.mfForm.getRawValue().investAmount,
          investmentName: this.mfForm.getRawValue().investmentName,
          investmentType: 'mutual_fund',
        }
      )
      .subscribe({
        next: (res) => {
          const html = res.component;
          this.sanitizedHtml = html!;
          if (
            res.component.length === 0 ||
            res.component === null ||
            res.component === 'null'
          ) {
            this.tryAgainAnalyze = true;
          }
          this.saveInvestShow = true;
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.saveInvestShow = true;
        },
      });
  }

  saveInvest() {
    if (this.mfForm.invalid) {
      return;
    }

    const data = this.mfForm.getRawValue();

    this.http
      .post(backendApis.mutual_funds.add, {
        fundType: data.fundType?.name,
        investType: data.investType?.name,
        investAmount: data.investAmount,
        riskProfile: data.riskProfile?.name,
        investmentName: data.investmentName?.name,
      })
      .subscribe({
        next: (res) => {
          this.closeModalEvent.emit();
        },
      });
  }
}
