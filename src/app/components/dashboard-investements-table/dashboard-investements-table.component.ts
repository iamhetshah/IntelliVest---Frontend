import { AfterViewInit, Component } from '@angular/core';
import { Table } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import backendApis from '../../app.constants';

interface Investment {
  platform: string;
  type: string;
  amount: number;
  interestRate?: number;
  tenure?: number;
  payoutOption?: string;
  quantity?: number;
  lockInPeriod?: number;
  frequency?: string;
  maturityDate?: string;
}

@Component({
  selector: 'app-dashboard-investments-table',
  standalone: true,
  imports: [
    TableModule,
    TagModule,
    IconFieldModule,
    InputTextModule,
    InputIconModule,
    SelectModule,
    CommonModule,
    FormsModule,
    ButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './dashboard-investements-table.component.html',
  styleUrl: './dashboard-investements-table.component.css',
})
export class DashboardInvestementsTableComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    this.http
      .get<{ message: string; investments: Investment[] }>(
        backendApis.dashboard.table
      )
      .subscribe({
        next: (res) => {
          console.log(res);
          this.investments.push(...res.investments);
        },
      });
  }
  constructor(private http: HttpClient) {}
  loading = false;

  investments: Investment[] = [];

  investmentTypes = [
    { label: 'Fixed Deposit', value: 'Fixed Deposit' },
    { label: 'Digital Gold', value: 'Digital Gold' },
    { label: 'PPF', value: 'PPF' },
  ];

  returnEventAsInputElement(event: any) {
    return event.target as HTMLInputElement;
  }

  clear(table: Table) {
    table.clear();
  }

  getTypeSeverity(type: string) {
    switch (type) {
      case 'Fixed Deposit':
        return 'success';
      case 'Digital Gold':
        return 'warn';
      case 'PPF':
        return 'info';
      default:
        return 'secondary';
    }
  }

  formatCurrency(amount: string): string {
    return (
      '₹ ' +
      parseFloat(amount).toLocaleString('en-IN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      })
    );
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
