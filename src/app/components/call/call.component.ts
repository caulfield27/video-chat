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

@Component({
  selector: 'app-call',
  templateUrl: './call.component.html',
  imports: [CommonModule],
})
export class CallComponent implements AfterViewInit, OnDestroy {
  isMuted = false;
  isVideoOff = false;
  isScreenSharing = false;
  isChatOpen = false;
  callDuration = signal('00:00');

  stream: MediaStream | null = null;
  remoteVideos: MediaStream[] = [];

  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;

  private callStartedAt = 0;
  private durationTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    public app: AppService,
    public i18n: I18nService,
    private rtc: WebRtcService,
  ) {}

  async ngAfterViewInit() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      this.stream = stream;
      this.bindLocalPreview(stream);
      this.rtc.addTracks(stream);

      this.rtc.addTrackListener((event) => {
        const remoteStream = event.streams[0];
        if (!remoteStream) return;

        const alreadyExists = this.remoteVideos.some((s) => s.id === remoteStream.id);
        if (!alreadyExists) {
          this.remoteVideos.push(remoteStream);
        }
      });

      this.rtc.listenCandidates(this.app.roomId());
      this.app.markSignalingReady();

      this.startDurationTimer();
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
  }

  onCallEnd() {
    this.app.currentView.set('menu');
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.stream?.getAudioTracks().forEach((track) => {
      track.enabled = !this.isMuted;
    });
  }

  toggleVideo() {
    this.isVideoOff = !this.isVideoOff;
    this.stream?.getVideoTracks().forEach((track) => {
      track.enabled = !this.isVideoOff;
    });
  }

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
  }

  get participantsCount() {
    return this.remoteVideos.length + 1;
  }

  get participantsLabel() {
    return this.participantsCount > 1
      ? this.i18n.t('call.participant.many')
      : this.i18n.t('call.participant.one');
  }

  get localStatusLabel() {
    if (this.isMuted && this.isVideoOff) return this.i18n.t('call.localStatus.mutedVideoOff');
    if (this.isMuted) return this.i18n.t('call.localStatus.muted');
    if (this.isVideoOff) return this.i18n.t('call.localStatus.videoOff');
    return this.i18n.t('call.localStatus.live');
  }

  get gridClass() {
    const count = this.remoteVideos.length;
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
