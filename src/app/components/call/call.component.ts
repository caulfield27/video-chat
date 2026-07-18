import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  OnDestroy,
  signal,
} from '@angular/core';
import { AppService } from '../../services/app.service';
import { I18nService } from '../../services/i18n.service';
import { WebsocketService } from '@/shared/services/websocket.service';
import { CallChat, CallGallery, CallHeader } from './_components';
import { CallFooter } from './_components/footer/footer.component';

@Component({
  selector: 'app-call',
  templateUrl: './call.component.html',
  styles: `
    :host {
      display: block;
      min-height: 100dvh;
      background: var(--bg-primary);
    }

    .call-chrome {
      transition:
        opacity 180ms ease,
        transform 180ms ease;
    }
  `,
  imports: [CommonModule, CallChat, CallGallery, CallHeader, CallFooter],
})
export class CallComponent implements AfterViewInit, OnDestroy {
  readonly mobileChromeVisible = signal(true);

  constructor(
    public app: AppService,
    public i18n: I18nService,
    private ws: WebsocketService,
  ) {}

  async ngAfterViewInit() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      this.app.stream.set(stream);
      this.app.streamId = stream.id;
      this.ws.send({
        type: 'joined-metadata',
        roomId: this.app.roomId(),
        from: stream.id,
        userName: this.app.userName(),
      });
      this.app.markSignalingReady();
      window.onbeforeunload = () => {
        this.ws.close(1000, this.app.roomId() ?? '');
        this.app.reset();
      };
    } catch (e) {
      console.error(e);
    }
  }

  ngOnDestroy(): void {
    const stream = this.app.stream();
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }

    this.ws.close(1000, this.app.roomId() ?? '');
    this.app.reset();
    window.onbeforeunload = null;
  }

  handleStageTap(event: MouseEvent) {
    if (window.innerWidth >= 768 || this.app.isChatOpen()) return;

    const target = event.target as HTMLElement | null;
    if (target?.closest('[data-no-stage-toggle]')) return;

    this.mobileChromeVisible.update((visible) => !visible);
  }
}
