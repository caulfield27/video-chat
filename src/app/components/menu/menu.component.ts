import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppService } from '../../services/app.service';
import { I18nService } from '../../services/i18n.service';
import { LanguageSelectComponent } from '@/shared/components/languageSelect/languageSelect.component';
import { ToggleThemeComponent } from '@/shared/components/theme/themeToggle.component';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, LanguageSelectComponent, ToggleThemeComponent],
  templateUrl: './menu.component.html',
})
export class MenuComponent {
  constructor(
    private app: AppService,
    public i18n: I18nService,
  ) {}

  onCreate() {
    this.app.currentView.set('create');
  }

  onJoin() {
    this.app.currentView.set('join');
  }
}
