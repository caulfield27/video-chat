import { Component, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MenuComponent,
  CreateRoomComponent,
  JoinRoomComponent,
  CallComponent,
} from './components';
import { AppService } from './services/app.service';
import { I18nService, Lang } from './services/i18n.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MenuComponent,
    CreateRoomComponent,
    JoinRoomComponent,
    CallComponent,
  ],
  template: `
    <div class="fixed right-4 top-4 z-50">
      <button
        type="button"
        (click)="toggleLanguageMenu()"
        class="flex min-w-44 items-center justify-between gap-3 rounded-lg border border-slate-600 bg-slate-900/90 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-emerald-300/40"
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
          class="h-4 w-4 text-slate-400 transition"
          [ngClass]="isLanguageMenuOpen ? 'rotate-180' : 'rotate-0'"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      @if (isLanguageMenuOpen) {
        <div class="mt-2 overflow-hidden rounded-lg border border-slate-600 bg-slate-900/95 shadow-lg">
          @for (lang of i18n.availableLangs; track lang) {
            <button
              type="button"
              (click)="onLangChange(lang)"
              class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-100 transition hover:bg-slate-700/70"
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

    <ng-container [ngSwitch]="app.currentView()">
      <app-menu *ngSwitchCase="'menu'"></app-menu>
      <app-create-room *ngSwitchCase="'create'"></app-create-room>
      <app-join-room *ngSwitchCase="'join'"></app-join-room>
      <app-call *ngSwitchCase="'call'"></app-call>
    </ng-container>
  `,
})
export class App {
  isLanguageMenuOpen = false;

  constructor(
    public app: AppService,
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
