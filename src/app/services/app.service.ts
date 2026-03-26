import { Injectable, signal } from '@angular/core';
import { IMessage } from '../types';
import { WebRtcService } from '@/shared/services/webRtc.service';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  currentView = signal<'menu' | 'create' | 'join' | 'call'>('menu');
  roomId = signal<string | null>(null);

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
        await this.rtc.handleOffer(data as RTCSessionDescriptionInit, this.roomId());
        break;
      case 'answer':
        await this.rtc.handleRemoteDescription(data as RTCSessionDescriptionInit);
        break;
      case 'ice-candidate':
        await this.rtc.addCandidate(data as RTCIceCandidateInit);
        break;
      case 'joined':
        await this.rtc.createOffer(this.roomId());
        break;
    }
  }

  async onWsMessage(event: MessageEvent<unknown>) {
    try {
      const parsed = JSON.parse(event.data as string) as IMessage;

      if (parsed.type === 'self-joined') {
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
}
