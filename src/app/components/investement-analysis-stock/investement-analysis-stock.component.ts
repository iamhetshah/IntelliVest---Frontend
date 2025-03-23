import { AfterViewInit, Component, computed, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-investement-analysis-stock',
  imports: [],
  templateUrl: './investement-analysis-stock.component.html',
  styleUrl: './investement-analysis-stock.component.css',
})
export class InvestementAnalysisStockComponent implements AfterViewInit {
  data = input.required<string>();
  html;
  constructor(private domSan: DomSanitizer) {
    this.html = computed(() => {
      const data = this.data();
      return this.domSan.bypassSecurityTrustHtml(data);
    });
  }
  ngAfterViewInit(): void {}
}
