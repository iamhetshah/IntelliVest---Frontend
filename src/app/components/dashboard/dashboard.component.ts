import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  signal,
  viewChild,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { NavbarComponent } from '../navbar/navbar.component';
import Chart from 'chart.js/auto';
import { DialogModule } from 'primeng/dialog';
import { DashboardInvestementsTableComponent } from '../dashboard-investements-table/dashboard-investements-table.component';
import { AddInvestementComponent } from '../add-investement/add-investement.component';
import backendApis from '../../app.constants';
import { Colors } from 'chart.js';
import { HttpClient } from '@angular/common/http';
import { PortfolioResponse } from '../../models/stock.analysis.model';
import { DecimalPipe } from '@angular/common';
import { DatePickerStyle } from 'primeng/datepicker';
@Component({
  selector: 'app-dashboard',
  imports: [
    ButtonModule,
    NavbarComponent,
    DashboardInvestementsTableComponent,
    DialogModule,
    AddInvestementComponent,
    DecimalPipe,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements AfterViewInit {
  pieChart!: Chart;
  pieChartCanvas = viewChild.required<ElementRef>('pieChartCanvas');
  lineChart!: Chart;
  lineChartCanvas = viewChild.required<ElementRef>('lineChartCanvas');
  visible: boolean = false;
  showDialog() {
    this.visible = true;
  }

  pieData = signal<{ label: string[]; data: number[] }>({
    label: [],
    data: [],
  });

  barChart = signal<{ label: string[]; data: number[] }>({
    label: [],
    data: [],
  });

  backClicked = new EventEmitter();

  getRandom(min: number, max: number) {
    return Math.round(Math.floor(Math.random() * (max - min + 1)) + min);
  }

  portfolioData = signal<PortfolioResponse | undefined>(undefined);

  convertToNumber(num: string) {
    return Number.parseFloat(num);
  }

  portfolioLoading = false;
  constructor(private http: HttpClient) {
    Chart.register(Colors);

    this.http.get<PortfolioResponse>(backendApis.portfolio).subscribe({
      next: (res) => {
        this.portfolioData.set(res);
        this.pieChart = new Chart(this.pieChartCanvas().nativeElement, {
          type: 'pie',
          data: {
            labels: res.data.metrics.investmentLabels,
            datasets: [
              {
                label: 'Distribution',
                data: res.data.metrics.investmentAmounts,
                hoverOffset: 8, // Slightly larger hover effect for better UX
                borderColor: 'rgba(255, 255, 255, 0.2)', // Thin white borders for separation
                borderWidth: 2,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 4 / 3,
            plugins: {
              colors: {
                forceOverride: true,
              },
            },
          },
        });
      },
    });

    // this.http
    //   .get<{ message: string; data: { label: string; value: number }[] }>(
    //     backendApis.charts.pie
    //   )
    //   .subscribe({
    //     next: (res) => {
    //       res.data.forEach((data) => {
    //         this.pieData().data.push(data.value);
    //         this.pieData().label.push(data.label);
    //       });

    //       this.pieChart = new Chart(this.pieChartCanvas().nativeElement, {
    //         type: 'pie',
    //         data: {
    //           labels: this.pieData().label,
    //           datasets: [
    //             {
    //               label: 'Distribution',
    //               data: this.pieData().data,
    //               hoverOffset: 8, // Slightly larger hover effect for better UX
    //               borderColor: 'rgba(255, 255, 255, 0.2)', // Thin white borders for separation
    //               borderWidth: 2,
    //             },
    //           ],
    //         },
    //         options: {
    //           responsive: true,
    //           maintainAspectRatio: true,
    //           aspectRatio: 4 / 3,
    //           plugins: {
    //             colors: {
    //               forceOverride: true,
    //             },
    //           },
    //         },
    //       });
    //     },
    //   });
    this.http
      .get<{ message: string; data: { label: string; value: number }[] }>(
        backendApis.charts.bar
      )
      .subscribe({
        next: (res) => {
          res.data.forEach((data) => {
            this.barChart().data.push(data.value);
            this.barChart().label.push(data.label);
          });

          this.lineChart = new Chart(this.lineChartCanvas().nativeElement, {
            type: 'bar',
            data: {
              labels: this.barChart().label,
              datasets: [
                {
                  label: '% ROI',
                  data: this.barChart().data,
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  borderWidth: 2,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: true,
              aspectRatio: 4 / 3,
              plugins: {
                colors: {
                  forceOverride: true,
                },
              },
            },
          });
        },
      });
  }

  ngAfterViewInit(): void {
    this.http.get<{
      messsage: string;
      result: {
        totalPorfolioValue: number;
        totalReturns: number;
        totalInteresteEarned: number;
        totalProfitLoss: number;
      };
    }>(backendApis.dashboard.cards);
  }
}
