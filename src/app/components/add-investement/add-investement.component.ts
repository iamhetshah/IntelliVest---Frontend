import {
  Component,
  effect,
  EventEmitter,
  input,
  OnDestroy,
} from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AddInvestementStockComponent } from '../add-investement-stock/add-investement-stock.component';
import { AddInvestementMutualFundsComponent } from '../add-investement-mutual-funds/add-investement-mutual-funds.component';
import { AddInvestementGoldComponent } from '../add-investement-gold/add-investement-gold.component';
import { AddInvestementPpfComponent } from '../add-investement-ppf/add-investement-ppf.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
@Component({
  selector: 'app-add-investement',
  imports: [
    CardModule,
    ButtonModule,
    AddInvestementStockComponent,
    AddInvestementMutualFundsComponent,
    AddInvestementGoldComponent,
    AddInvestementPpfComponent,
  ],
  templateUrl: './add-investement.component.html',
  styleUrl: './add-investement.component.css',
})
export class AddInvestementComponent implements OnDestroy {
  backClicked = input.required<EventEmitter<null>>();
  investementsTypes = [
    {
      name: 'Stock',
      icon: 'pi pi-briefcase',
    },
    {
      name: 'Mutual Funds',
      icon: 'pi pi-money-bill',
    },
    {
      name: 'Gold',
      icon: 'pi pi-crown',
    },
    {
      name: 'PPF',
      icon: 'pi pi-indian-rupee',
    },
  ];

  selectedInvestement: string = '';

  modalCloseSubscription!: Subscription;
  ngOnInit() {
    this.modalCloseSubscription = this.backClicked().subscribe(() => {
      this.selectedInvestement = '';
    });
  }

  ngOnDestroy(): void {
    this.modalCloseSubscription.unsubscribe();
  }
}
