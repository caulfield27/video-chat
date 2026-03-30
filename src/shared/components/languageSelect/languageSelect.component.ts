import { Component, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService, Lang } from '@/app/services/i18n.service';

@Component({
  selector: 'language-select',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <button
        type="button"
        (click)="toggleLanguageMenu()"
        class="flex min-w-44 items-center justify-between gap-3 rounded-lg border border-[var(--stroke)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--brand-strong)]"
      >
        <span class="inline-flex items-center gap-2">
          <img
            [src]="flagFor(i18n.currentLang())"
            [alt]="languageLabel(i18n.currentLang())"
            class="h-4 w-6 rounded-sm object-cover"
          />
          {{ languageLabel(i18n.currentLang()) }}
        </span>
        <svg
          class="h-4 w-4 text-[var(--text-primary)] transition"
          [ngClass]="isLanguageMenuOpen ? 'rotate-180' : 'rotate-0'"
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

      @if (isLanguageMenuOpen) {
        <div
          class="mt-2 overflow-hidden rounded-lg border border-[var(--stroke)] bg-[var(--bg-primary)] shadow-lg"
        >
          @for (lang of i18n.availableLangs; track lang) {
            <button
              type="button"
              (click)="onLangChange(lang)"
              class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--text-primary)] transition hover:bg-[var(--bg-surface)]"
            >
              <img
                [src]="flagFor(lang)"
                [alt]="languageLabel(lang)"
                class="h-4 w-6 rounded-sm object-cover"
              />
              {{ languageLabel(lang) }}
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class LanguageSelectComponent {
  isLanguageMenuOpen = false;

  constructor(
    public i18n: I18nService,
    private host: ElementRef<HTMLElement>,
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.isLanguageMenuOpen = false;
    }
  }

  toggleLanguageMenu() {
    this.isLanguageMenuOpen = !this.isLanguageMenuOpen;
  }

  onLangChange(lang: Lang) {
    this.i18n.setLang(lang);
    this.isLanguageMenuOpen = false;
  }

  languageLabel(lang: Lang) {
    if (lang === 'ru') return this.i18n.t('lang.ru');
    if (lang === 'en') return this.i18n.t('lang.en');
    return this.i18n.t('lang.tj');
  }

  flagFor(lang: Lang) {
    if (lang === 'ru') return '/flags/ru.svg';
    if (lang === 'en') return '/flags/en.svg';
    return '/flags/tj.svg';
  }
}
