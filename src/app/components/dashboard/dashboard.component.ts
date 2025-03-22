import { AfterViewInit, Component, ElementRef, viewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { NavbarComponent } from '../navbar/navbar.component';
import Chart from 'chart.js/auto';
import { DashboardInvestementsTableComponent } from '../dashboard-investements-table/dashboard-investements-table.component';
@Component({
  selector: 'app-dashboard',
  imports: [ButtonModule, NavbarComponent, DashboardInvestementsTableComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements AfterViewInit {
  pieChart!: Chart;
  pieChartCanvas = viewChild.required<ElementRef>('pieChartCanvas');
  lineChart!: Chart;
  lineChartCanvas = viewChild.required<ElementRef>('lineChartCanvas');

  constructor() {}

  ngAfterViewInit(): void {
    this.pieChart = new Chart(this.pieChartCanvas().nativeElement, {
      type: 'pie',
      data: {
        labels: ['Stock', 'Light Gray', 'White'],
        datasets: [
          {
            label: 'Distribution',
            data: [40, 35, 25], // Adjusted proportions for better balance
            backgroundColor: [
              'rgb(50, 50, 50)', // Dark Gray
              'rgb(150, 150, 150)', // Light Gray
              'rgb(230, 230, 230)', // White
            ],
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
      },
    });
    this.lineChart = new Chart(this.lineChartCanvas().nativeElement, {
      type: 'line',
      data: {
        labels: ['Stock', 'Light Gray', 'White'],
        datasets: [
          {
            label: 'Distribution',
            data: [40, 35, 25],
            fill: false,
            borderColor: 'rgb(50, 50, 50)',
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 4 / 3,
      },
    });
  }
}
