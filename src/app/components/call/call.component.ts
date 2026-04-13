import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
import { AppService } from '../../services/app.service';
import { I18nService } from '../../services/i18n.service';
import { WebsocketService } from '@/shared/services/websocket.service';
import { LucideAngularModule, MicOff, VideoOff } from 'lucide-angular';
import { CallChat, CallHeader } from './_components';
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
  imports: [
    CommonModule,
    LucideAngularModule,
    CallChat,
    CallHeader,
    CallFooter,
  ],
})
export class CallComponent implements AfterViewInit, OnDestroy {
  readonly MicOffIcon = MicOff;
  readonly VideoOffIcon = VideoOff;

  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;

  public color = 'black';
  readonly mobileChromeVisible = signal(true);

  constructor(
    public app: AppService,
    public i18n: I18nService,
    private ws: WebsocketService,
  ) {
    this.color = app.randomColor;
  }

  async ngAfterViewInit() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      this.app.stream.set(stream);
      this.app.streamId = stream.id;
      this.bindLocalPreview(stream);
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

  get hasRemoteUsers() {
    return this.app.remoteUsers().length > 0;
  }

  get remoteGridClass() {
    const count = this.app.remoteUsers().length;
    if (count <= 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1 lg:grid-cols-2';
    if (count <= 4) return 'grid-cols-1 md:grid-cols-2';
    if (count <= 6) return 'grid-cols-2 xl:grid-cols-3';
    return 'grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4';
  }

  handleStageTap(event: MouseEvent) {
    if (window.innerWidth >= 768 || this.app.isChatOpen()) return;

    const target = event.target as HTMLElement | null;
    if (target?.closest('[data-no-stage-toggle]')) return;

    this.mobileChromeVisible.update((visible) => !visible);
  }

  handleCanPlay(e: Event) {
    const video = e.target as HTMLVideoElement;
    console.log('ready: ', video);
    
    video.play();
  }

  private bindLocalPreview(stream: MediaStream) {
    const video = this.localVideo?.nativeElement;
    if (video) {
      video.srcObject = stream;
      video.muted = true;
    }
  }
}
