import { Injectable, signal } from '@angular/core';
import { IMessage, IRemoteUser } from '../types';
import { WebRtcService } from '@/shared/services/webRtc.service';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  currentView = signal<'menu' | 'create' | 'join' | 'call'>('menu');
  roomId = signal<string | null>(null);
  roomName = signal('');
  userName = signal('');
  streamId: string = '';
  remoteUsers = signal<IRemoteUser[]>([]);
  readonly colors: Record<number, string> = {
    1: '#0f172a',
    2: '#dc2626',
    3: '#f97316',
    4: '#3b82f6',
    5: '#22c55e',
  };

  private signalingReady = false;
  private pendingSignals: IMessage[] = [];

  constructor(private rtc: WebRtcService) {}

  resetSignalingState() {
    this.signalingReady = false;
    this.pendingSignals = [];
  }

  markSignalingReady() {
    this.signalingReady = true;
    void this.flushPendingSignals();
  }

  private async flushPendingSignals() {
    if (!this.signalingReady || !this.pendingSignals.length) return;

    const queue = [...this.pendingSignals];
    this.pendingSignals = [];

    for (const signal of queue) {
      await this.handleSignal(signal);
    }
  }

  private async handleSignal(signal: IMessage) {
    const { type, data } = signal;

    switch (type) {
      case 'offer':
        await this.rtc.handleOffer(
          data as RTCSessionDescriptionInit,
          this.roomId(),
        );
        break;
      case 'answer':
        await this.rtc.handleRemoteDescription(
          data as RTCSessionDescriptionInit,
        );
        break;
      case 'ice-candidate':
        await this.rtc.addCandidate(data as RTCIceCandidateInit);
        break;
      case 'joined':
        await this.rtc.createOffer(this.roomId());
        break;
      case 'joined-metadata':
        this.remoteUsers.update((prev) => [
          ...prev,
          {
            streamId: signal.streamId!,
            username: signal.userName!,
            isMuted: false,
            isVideoOff: false,
            stream: null,
            color: this.randomColor,
          },
        ]);
    }
  }

  async onWsMessage(event: MessageEvent<unknown>) {
    try {
      const parsed = JSON.parse(event.data as string) as IMessage;

      if (parsed.type === 'self-joined') {
        this.roomName.set(parsed.roomName!);
        this.roomId.set(parsed.roomId ?? null);
        this.currentView.set('call');
        return;
      }

      if (
        parsed.type === 'offer' ||
        parsed.type === 'answer' ||
        parsed.type === 'ice-candidate' ||
        parsed.type === 'joined'
      ) {
        if (!this.signalingReady) {
          this.pendingSignals.push(parsed);
          return;
        }

        await this.handleSignal(parsed);
      }
    } catch (e) {
      console.error(e);
    }
  }

  get randomColor() {
    return this.colors[Math.round(Math.random() * 5)];
  }
}
