import { Injectable, effect, signal } from '@angular/core';

export type Brand = 'green' | 'red' | 'violet';

const BRAND_SWATCH: Record<Brand, string> = {
  green: '#16a34a',
  red: '#e11d48',
  violet: '#818cf8',
};

@Injectable({ providedIn: 'root' })
export class BrandService {
  private brand = signal<Brand>('green');

  currentBrand = this.brand.asReadonly();
  availableBrands: Brand[] = ['green', 'red', 'violet'];

  constructor() {
    effect(() => {
      document.documentElement.setAttribute('data-brand', this.brand());
    });
  }

  setBrand(brand: Brand) {
    this.brand.set(brand);
  }

  swatchFor(brand: Brand) {
    return BRAND_SWATCH[brand];
  }
}
