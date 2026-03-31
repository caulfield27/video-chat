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
import { WebRtcService } from '@/shared/services/webRtc.service';
import { I18nService } from '../../services/i18n.service';
import { WebsocketService } from '@/shared/services/websocket.service';
import { LucideAngularModule, MicOff, SendHorizontal } from 'lucide-angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-call',
  templateUrl: './call.component.html',
  imports: [CommonModule, LucideAngularModule, FormsModule],
})
export class CallComponent implements AfterViewInit, OnDestroy {
  readonly MicOffIcon = MicOff;
  readonly SendIcon = SendHorizontal;

  isMuted = false;
  isVideoOff = false;
  isScreenSharing = false;
  isChatOpen = false;
  callDuration = signal('00:00');

  stream: MediaStream | null = null;

  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;

  private callStartedAt = 0;
  private durationTimer: ReturnType<typeof setInterval> | null = null;
  public color = 'black';
  public isCodHidden: boolean = true;
  public isCopied: boolean = false;
  public message: string = '';

  constructor(
    public app: AppService,
    public i18n: I18nService,
    private rtc: WebRtcService,
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

      this.stream = stream;
      this.app.streamId = stream.id;
      this.bindLocalPreview(stream);
      this.rtc.addTracks(stream);

      this.ws.send({
        type: 'joined-metadata',
        roomId: this.app.roomId(),
        streamId: stream.id,
        userName: this.app.userName(),
      });
      this.rtc.addTrackListener((event) => {
        const remoteStream = event.streams[0];
        if (!remoteStream) return;

        const alreadyExists = this.app
          .remoteUsers()
          .some((user) => user.stream?.id === remoteStream.id);
        if (!alreadyExists) {
          this.app.remoteUsers.update((prev) =>
            prev.map((u) =>
              u.streamId === remoteStream.id
                ? { ...u, stream: remoteStream }
                : u,
            ),
          );
        }
      });

      this.rtc.listenCandidates(this.app.roomId());
      this.app.markSignalingReady();

      this.startDurationTimer();

      window.onbeforeunload = () => {
        this.ws.close(1000, this.app.roomId() ?? '');
        this.app.reset();
      };
    } catch (e) {
      console.error(e);
    }
  }

  ngOnDestroy(): void {
    if (this.durationTimer) {
      clearInterval(this.durationTimer);
    }

    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
    }

    this.ws.close(1000, this.app.roomId() ?? '');
    this.app.reset();
    window.onbeforeunload = null;
  }

  onCallEnd() {
    this.app.currentView.set('menu');
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.stream?.getAudioTracks().forEach((track) => {
      track.enabled = !this.isMuted;
    });
    this.ws.send({
      type: 'toggle-mute',
      roomId: this.app.roomId(),
      streamId: this.app.streamId,
    });
  }

  handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      this.handleSendMessage();
    }
  }

  stringToColor(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${hash % 360}, 60%, 50%)`;
  }

  handleSendMessage() {
    const user = {
      streamId: this.app.streamId,
      userName: this.app.userName(),
    };
    this.app.chatMessages.update((prev) => [
      ...prev,
      {
        type: 'me',
        message: this.message,
        user,
      },
    ]);
    this.ws.send({
      type: 'chat-message',
      roomId: this.app.roomId(),
      message: this.message,
      user,
    });
    this.message = '';
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

  toggleVideo() {
    this.isVideoOff = !this.isVideoOff;
    this.stream?.getVideoTracks().forEach((track) => {
      track.enabled = !this.isVideoOff;
    });
    this.ws.send({
      type: 'toggle-video-off',
      roomId: this.app.roomId(),
      streamId: this.app.streamId,
    });
  }

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
  }

  get participantsCount() {
    return this.app.remoteUsers().length + 1;
  }

  get participantsLabel() {
    return this.participantsCount > 1
      ? this.i18n.t('call.participant.many')
      : this.i18n.t('call.participant.one');
  }

  get localStatusLabel() {
    if (this.isMuted && this.isVideoOff)
      return this.i18n.t('call.localStatus.mutedVideoOff');
    if (this.isMuted) return this.i18n.t('call.localStatus.muted');
    if (this.isVideoOff) return this.i18n.t('call.localStatus.videoOff');
    return this.i18n.t('call.localStatus.live');
  }

  get gridClass() {
    const count = this.app.remoteUsers().length;
    if (count <= 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1 lg:grid-cols-2';
    if (count <= 4) return 'grid-cols-1 sm:grid-cols-2';
    if (count <= 6) return 'grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-2 lg:grid-cols-4';
  }

  private bindLocalPreview(stream: MediaStream) {
    const video = this.localVideo?.nativeElement;
    if (video) {
      video.srcObject = stream;
      video.muted = true;
    }
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
}
