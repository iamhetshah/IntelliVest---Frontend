import { Component } from '@angular/core';
import { Table } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ProgressBar } from 'primeng/progressbar';
import { Button, ButtonModule } from 'primeng/button';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'app-dashboard-investements-table',
  imports: [
    TableModule,
    TagModule,
    IconFieldModule,
    InputTextModule,
    InputIconModule,
    MultiSelectModule,
    SelectModule,
    CommonModule,
    FormsModule,
    ButtonModule,
    ProgressBar,
    Button,
    ReactiveFormsModule,
  ],
  templateUrl: './dashboard-investements-table.component.html',
  styleUrl: './dashboard-investements-table.component.css',
})
export class DashboardInvestementsTableComponent {
  loading = false;
  customers = [
    {
      id: 1000,
      name: 'James Butt',
      country: {
        name: 'Algeria',
        code: 'dz',
      },
      company: 'Benton, John B Jr',
      date: '2015-09-13',
      status: 'unqualified',
      verified: true,
      activity: 17,
      representative: {
        name: 'Ioni Bowcher',
        image: 'ionibowcher.png',
      },
      balance: 70663,
    },
    {
      id: 1001,
      name: 'Josephine Darakjy',
      country: {
        name: 'Egypt',
        code: 'eg',
      },
      company: 'Chanay, Jeffrey A Esq',
      date: '2019-02-09',
      status: 'proposal',
      verified: true,
      activity: 0,
      representative: {
        name: 'Amy Elsner',
        image: 'amyelsner.png',
      },
      balance: 82429,
    },
    {
      id: 1002,
      name: 'Art Venere',
      country: {
        name: 'Panama',
        code: 'pa',
      },
      company: 'Chemel, James L Cpa',
      date: '2017-05-13',
      status: 'qualified',
      verified: false,
      activity: 63,
      representative: {
        name: 'Asiya Javayant',
        image: 'asiyajavayant.png',
      },
      balance: 28334,
    },
    {
      id: 1003,
      name: 'Lenna Paprocki',
      country: {
        name: 'Slovenia',
        code: 'si',
      },
      company: 'Feltz Printing Service',
      date: '2020-09-15',
      status: 'new',
      verified: false,
      activity: 37,
      representative: {
        name: 'Xuxue Feng',
        image: 'xuxuefeng.png',
      },
      balance: 88521,
    },
    {
      id: 1004,
      name: 'Donette Foller',
      country: {
        name: 'South Africa',
        code: 'za',
      },
      company: 'Printing Dimensions',
      date: '2016-05-20',
      status: 'proposal',
      verified: true,
      activity: 33,
      representative: {
        name: 'Asiya Javayant',
        image: 'asiyajavayant.png',
      },
      balance: 93905,
    },
    {
      id: 1005,
      name: 'Simona Morasca',
      country: {
        name: 'Egypt',
        code: 'eg',
      },
      company: 'Chapman, Ross E Esq',
      date: '2018-02-16',
      status: 'qualified',
      verified: false,
      activity: 68,
      representative: {
        name: 'Ivan Magalhaes',
        image: 'ivanmagalhaes.png',
      },
      balance: 50041,
    },
    {
      id: 1006,
      name: 'Mitsue Tollner',
      country: {
        name: 'Paraguay',
        code: 'py',
      },
      company: 'Morlong Associates',
      date: '2018-02-19',
      status: 'renewal',
      verified: true,
      activity: 54,
      representative: {
        name: 'Ivan Magalhaes',
        image: 'ivanmagalhaes.png',
      },
      balance: 58706,
    },
    {
      id: 1007,
      name: 'Leota Dilliard',
      country: {
        name: 'Serbia',
        code: 'rs',
      },
      company: 'Commercial Press',
      date: '2019-08-13',
      status: 'renewal',
      verified: true,
      activity: 69,
      representative: {
        name: 'Onyama Limba',
        image: 'onyamalimba.png',
      },
      balance: 26640,
    },
    {
      id: 1008,
      name: 'Sage Wieser',
      country: {
        name: 'Egypt',
        code: 'eg',
      },
      company: 'Truhlar And Truhlar Attys',
      date: '2018-11-21',
      status: 'unqualified',
      verified: true,
      activity: 76,
      representative: {
        name: 'Ivan Magalhaes',
        image: 'ivanmagalhaes.png',
      },
      balance: 65369,
    },
    {
      id: 1009,
      name: 'Kris Marrier',
      country: {
        name: 'Mexico',
        code: 'mx',
      },
      company: 'King, Christopher A Esq',
      date: '2015-07-07',
      status: 'proposal',
      verified: false,
      activity: 3,
      representative: {
        name: 'Onyama Limba',
        image: 'onyamalimba.png',
      },
      balance: 63451,
    },
    {
      id: 1010,
      name: 'Minna Amigon',
      country: {
        name: 'Romania',
        code: 'ro',
      },
      company: 'Dorl, James J Esq',
      date: '2018-11-07',
      status: 'qualified',
      verified: false,
      activity: 38,
      representative: {
        name: 'Anna Fali',
        image: 'annafali.png',
      },
      balance: 71169,
    },
    {
      id: 1011,
      name: 'Abel Maclead',
      country: {
        name: 'Singapore',
        code: 'sg',
      },
      company: 'Rangoni Of Florence',
      date: '2017-03-11',
      status: 'qualified',
      verified: true,
      activity: 87,
      representative: {
        name: 'Bernardo Dominic',
        image: 'bernardodominic.png',
      },
      balance: 96842,
    },
    {
      id: 1012,
      name: 'Kiley Caldarera',
      country: {
        name: 'Serbia',
        code: 'rs',
      },
      company: 'Feiner Bros',
      date: '2015-10-20',
      status: 'unqualified',
      verified: false,
      activity: 80,
      representative: {
        name: 'Onyama Limba',
        image: 'onyamalimba.png',
      },
      balance: 92734,
    },
    {
      id: 1013,
      name: 'Graciela Ruta',
      country: {
        name: 'Chile',
        code: 'cl',
      },
      company: 'Buckley Miller & Wright',
      date: '2016-07-25',
      status: 'negotiation',
      verified: false,
      activity: 59,
      representative: {
        name: 'Amy Elsner',
        image: 'amyelsner.png',
      },
      balance: 45250,
    },
    {
      id: 1014,
      name: 'Cammy Albares',
      country: {
        name: 'Philippines',
        code: 'ph',
      },
      company: 'Rousseaux, Michael Esq',
      date: '2019-06-25',
      status: 'new',
      verified: true,
      activity: 90,
      representative: {
        name: 'Asiya Javayant',
        image: 'asiyajavayant.png',
      },
      balance: 30236,
    },
    {
      id: 1015,
      name: 'Mattie Poquette',
      country: {
        name: 'Venezuela',
        code: 've',
      },
      company: 'Century Communications',
      date: '2017-12-12',
      status: 'negotiation',
      verified: false,
      activity: 52,
      representative: {
        name: 'Anna Fali',
        image: 'annafali.png',
      },
      balance: 64533,
    },
    {
      id: 1016,
      name: 'Meaghan Garufi',
      country: {
        name: 'Malaysia',
        code: 'my',
      },
      company: 'Bolton, Wilbur Esq',
      date: '2018-07-04',
      status: 'unqualified',
      verified: false,
      activity: 31,
      representative: {
        name: 'Ivan Magalhaes',
        image: 'ivanmagalhaes.png',
      },
      balance: 37279,
    },
    {
      id: 1017,
      name: 'Gladys Rim',
      country: {
        name: 'Netherlands',
        code: 'nl',
      },
      company: 'T M Byxbee Company Pc',
      date: '2020-02-27',
      status: 'renewal',
      verified: true,
      activity: 48,
      representative: {
        name: 'Stephen Shaw',
        image: 'stephenshaw.png',
      },
      balance: 27381,
    },
    {
      id: 1018,
      name: 'Yuki Whobrey',
      country: {
        name: 'Israel',
        code: 'il',
      },
      company: 'Farmers Insurance Group',
      date: '2017-12-21',
      status: 'negotiation',
      verified: true,
      activity: 16,
      representative: {
        name: 'Bernardo Dominic',
        image: 'bernardodominic.png',
      },
      balance: 9257,
    },
    {
      id: 1019,
      name: 'Fletcher Flosi',
      country: {
        name: 'Argentina',
        code: 'ar',
      },
      company: 'Post Box Services Plus',
      date: '2016-01-04',
      status: 'renewal',
      verified: true,
      activity: 19,
      representative: {
        name: 'Xuxue Feng',
        image: 'xuxuefeng.png',
      },
      balance: 67783,
    },
    {
      id: 1020,
      name: 'Bette Nicka',
      country: {
        name: 'Paraguay',
        code: 'py',
      },
      company: 'Sport En Art',
      date: '2016-10-21',
      status: 'renewal',
      verified: false,
      activity: 100,
      representative: {
        name: 'Onyama Limba',
        image: 'onyamalimba.png',
      },
      balance: 4609,
    },
  ];

  returnEventAsInputElement(event: any) {
    return event.target as HTMLInputElement;
  }

  statuses = [
    { label: 'Unqualified', value: 'unqualified' },
    { label: 'Qualified', value: 'qualified' },
    { label: 'New', value: 'new' },
    { label: 'Negotiation', value: 'negotiation' },
    { label: 'Renewal', value: 'renewal' },
    { label: 'Proposal', value: 'proposal' },
  ];

  representatives = [
    { name: 'Amy Elsner', image: 'amyelsner.png' },
    { name: 'Anna Fali', image: 'annafali.png' },
    { name: 'Asiya Javayant', image: 'asiyajavayant.png' },
    { name: 'Bernardo Dominic', image: 'bernardodominic.png' },
    { name: 'Elwin Sharvill', image: 'elwinsharvill.png' },
    { name: 'Ioni Bowcher', image: 'ionibowcher.png' },
    { name: 'Ivan Magalhaes', image: 'ivanmagalhaes.png' },
    { name: 'Onyama Limba', image: 'onyamalimba.png' },
    { name: 'Stephen Shaw', image: 'stephenshaw.png' },
    { name: 'Xuxue Feng', image: 'xuxuefeng.png' },
  ];

  clear(table: Table) {
    table.clear();
  }

  getSeverity(status: string) {
    switch (status) {
      case 'unqualified':
        return 'danger';

      case 'qualified':
        return 'success';

      case 'new':
        return 'info';

      case 'negotiation':
        return 'warn';

      case 'renewal':
        return null;

      default:
        return 'secondary';
    }
  }
}
