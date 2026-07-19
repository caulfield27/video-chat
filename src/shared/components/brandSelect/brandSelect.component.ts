import { Component, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrandService, Brand } from '@/app/services/brand.service';
import { I18nService } from '@/app/services/i18n.service';

@Component({
  selector: 'brand-select',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <button
        type="button"
        (click)="toggleBrandMenu()"
        class="glass-pill flex min-w-44 items-center justify-between gap-3 rounded-[var(--radius-btn)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none"
      >
        <span class="inline-flex items-center gap-2">
          <span
            class="h-4 w-4 rounded-full"
            [style.background]="brand.swatchFor(brand.currentBrand())"
          ></span>
          {{ brandLabel(brand.currentBrand()) }}
        </span>
        <svg
          class="h-4 w-4 text-[var(--text-primary)] transition"
          [ngClass]="isBrandMenuOpen ? 'rotate-180' : 'rotate-0'"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      @if (isBrandMenuOpen) {
        <div class="glass-dropdown absolute right-0 top-full z-50 mt-2 min-w-44 overflow-hidden">
          @for (option of brand.availableBrands; track option) {
            <button
              type="button"
              (click)="onBrandChange(option)"
              class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--text-primary)] transition-colors hover:bg-white/10"
            >
              <span
                class="h-4 w-4 rounded-full"
                [style.background]="brand.swatchFor(option)"
              ></span>
              {{ brandLabel(option) }}
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class BrandSelectComponent {
  isBrandMenuOpen = false;

  constructor(
    public brand: BrandService,
    public i18n: I18nService,
    private host: ElementRef<HTMLElement>,
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.isBrandMenuOpen = false;
    }
  }

  toggleBrandMenu() {
    this.isBrandMenuOpen = !this.isBrandMenuOpen;
  }

  onBrandChange(option: Brand) {
    this.brand.setBrand(option);
    this.isBrandMenuOpen = false;
  }

  brandLabel(option: Brand) {
    if (option === 'red') return this.i18n.t('brand.red');
    if (option === 'violet') return this.i18n.t('brand.violet');
    return this.i18n.t('brand.green');
  }
}
