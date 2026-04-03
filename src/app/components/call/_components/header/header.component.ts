import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, signal } from '@angular/core';
import { AppService } from '@/app/services/app.service';
import { I18nService } from '@/app/services/i18n.service';

@Component({
  selector: 'call-header',
  templateUrl: './header.component.html',
  imports: [CommonModule],
})
export class CallHeader implements OnDestroy, AfterViewInit {
  public isCodHidden: boolean = true;
  public isCopied: boolean = false;
  private callStartedAt = 0;
  private durationTimer: ReturnType<typeof setInterval> | null = null;
  callDuration = signal('00:00');
  constructor(
    public app: AppService,
    public i18n: I18nService,
  ) {}

  ngOnDestroy(): void {
    if (this.durationTimer) {
      clearInterval(this.durationTimer);
    }
  }

  ngAfterViewInit(): void {
    this.startDurationTimer();
  }

  handleCopy() {
    navigator.clipboard
      .writeText(this.app.roomId() ?? '')
      .then(() => {
        this.isCopied = true;
        setTimeout(() => (this.isCopied = false), 1000);
      })
      .catch(console.error);
  }

  private startDurationTimer() {
    this.callStartedAt = Date.now();

    this.durationTimer = setInterval(() => {
      const elapsedSec = Math.floor((Date.now() - this.callStartedAt) / 1000);
      const min = Math.floor(elapsedSec / 60)
        .toString()
        .padStart(2, '0');
      const sec = (elapsedSec % 60).toString().padStart(2, '0');
      this.callDuration.set(`${min}:${sec}`);
    }, 1000);
  }

  get participantsCount() {
    return this.app.remoteUsers().length + 1;
  }

  get participantsLabel() {
    return this.participantsCount > 1
      ? this.i18n.t('call.participant.many')
      : this.i18n.t('call.participant.one');
  }
}
