import { Component, OnDestroy } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputNumber } from 'primeng/inputnumber';
import { SelectButton } from 'primeng/selectbutton';
import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { HttpClient } from '@angular/common/http';
import backendApis from '../../app.constants';
import { InvestementAnalysisStockComponent } from '../investement-analysis-stock/investement-analysis-stock.component';
import { interval, Subscription } from 'rxjs';
import { Message } from 'primeng/message';

@Component({
  selector: 'app-add-investement-stock',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    SelectModule,
    InputNumber,
    SelectButton,
    FloatLabelModule,
    ButtonModule,
    Message,
    InvestementAnalysisStockComponent,
  ],
  templateUrl: './add-investement-stock.component.html',
  styleUrl: './add-investement-stock.component.css',
})
export class AddInvestementStockComponent implements OnDestroy {
  stockForm = new FormGroup({
    investmentType: new FormControl('stock', [Validators.required]),
    investmentName: new FormControl({ name: '' }, [Validators.required]),
    stockQuantity: new FormControl(0, [Validators.min(1)]),
    stockAction: new FormControl('', [Validators.required]),
    timeHorizon: new FormControl('', [Validators.required]),
    currentPrice: new FormControl(9000, [Validators.required]),
  });

  stocks = [
    {
      name: 'Adani Power',
    },
  ];

  options = [
    { label: 'Buy', value: 'BUY' },
    { label: 'Sell', value: 'SELL' },
  ];

  loading: boolean = false;

  sanitizedHtml = '';

  load() {
    this.loading = true;

    setTimeout(() => {
      this.loading = false;
    }, 2000);
  }
  poolingSub: Subscription;
  constructor(private http: HttpClient) {
    this.http
      .get<{
        message: string;
        result: { _id: string; name: string; price: number }[];
      }>(backendApis.stocks.allStocks)
      .subscribe({
        next: (res) => {
          this.stocks = res.result;
        },
      });
    this.poolingSub = interval(5000).subscribe({
      next: (val) => {
        this.http
          .get<{
            message: string;
            result: { _id: string; name: string; price: number }[];
          }>(backendApis.stocks.allStocks)
          .subscribe({
            next: (res) => {
              this.stocks = res.result;
            },
          });
      },
    });
  }
  ngOnDestroy(): void {
    this.poolingSub.unsubscribe();
  }

  extractHtmlContent(text: string): string | null {
    const regex = /```html\s*([\s\S]*?)\s*```/;
    const match = text.match(regex);
    return match ? match[1] : null;
  }

  saveInvestShow = false;
  tryAgainAnalyze = false;
  analyze() {
    if (this.stockForm.invalid) {
      return;
    }
    this.tryAgainAnalyze = false;
    this.loading = true;
    this.http
      .post<{ success: string; component: string }>(
        backendApis.analysis.stock,
        {
          ...this.stockForm.getRawValue(),
          investmentName: this.stockForm.getRawValue().investmentName!.name,
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
          this.saveInvestShow = false;
        },
      });
  }

  saveInvest() {
    if (this.stockForm.invalid) {
      return;
    }
  }
}
