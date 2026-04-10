import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, signal } from '@angular/core';
import { AppService } from '@/app/services/app.service';
import { I18nService } from '@/app/services/i18n.service';
import { WebsocketService } from '@/shared/services/websocket.service';

@Component({
  selector: 'call-footer',
  templateUrl: './footer.component.html',
  imports: [CommonModule],
})
export class CallFooter {
  constructor(
    private ws: WebsocketService,
    public app: AppService,
    public i18n: I18nService,
  ) {}

  onCallEnd() {
    this.app.currentView.set('menu');
  }

  toggleScreenSharing() {
    this.app.isScreenSharing.update((prev) => !prev);
  }

  toggleMute() {
    this.app.isMuted.update((prev) => !prev);
    const stream = this.app.stream();
    if (!stream) return;
    stream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    this.ws.send({
      type: 'toggle-mute',
      roomId: this.app.roomId(),
      from: this.app.streamId,
    });
  }

  toggleVideo() {
    this.app.isVideoOff.update((prev) => !prev);
    const stream = this.app.stream();
    if (!stream) return;
    stream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    this.ws.send({
      type: 'toggle-video-off',
      roomId: this.app.roomId(),
      from: this.app.streamId,
    });
  }
}
