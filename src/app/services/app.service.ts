import { Injectable, signal } from '@angular/core';
import { IChatMessage, IMessage, IRemoteUser } from '../types';
import { WebRtcService } from '@/shared/services/webRtc.service';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  stream = signal<MediaStream | null>(null);
  isMuted = signal<boolean>(false);
  isVideoOff = signal<boolean>(false);
  isScreenSharing = signal<boolean>(false);
  currentView = signal<'menu' | 'create' | 'join' | 'call'>('menu');
  roomId = signal<string | null>(null);
  roomName = signal('');
  userName = signal('');
  streamId: string = '';
  remoteUsers = signal<IRemoteUser[]>([]);
  chatMessages = signal<IChatMessage[]>([]);
  nots = signal<number>(0);
  msgAudio = new Audio('/audio/message.wav');
  isChatOpen = signal<boolean>(false);
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
        {
          const from = signal.from!;
          const to = signal.to!;
          await this.rtc.handleOffer(
            data as RTCSessionDescriptionInit,
            this.roomId(),
            from,
            to,
          );
        }
        break;
      case 'answer':
        {
          const from = signal.from!;
          await this.rtc.handleRemoteDescription(
            data as RTCSessionDescriptionInit,
            from,
          );
        }
        break;
      case 'ice-candidate':
        const from = signal.from!;
        await this.rtc.addCandidate(data as RTCIceCandidateInit, from);
        break;
      case 'self-joined':
        this.roomName.set(signal.roomName!);
        this.roomId.set(signal.roomId ?? null);
        this.remoteUsers.update((prev) => [
          ...prev,
          ...signal.clients!.map((c) => ({
            streamId: c.streamId,
            userName: c.userName,
            isMuted: false,
            isVideoOff: false,
            stream: null,
            color: this.randomColor,
          })),
        ]);

        this.remoteUsers().forEach(async (user) => {
          await this.rtc.connect(
            user.streamId,
            this.stream()!,
            (e) => this.trackListener(e),
            this.roomId(),
          );
        });
        return;
    }
  }

  trackListener(event: RTCTrackEvent) {
    const remoteStream = event.streams[0];
    if (!remoteStream) return;
    const alreadyExists = this.remoteUsers().some(
      (user) => user.stream?.id === remoteStream.id,
    );
    if (!alreadyExists) {
      this.remoteUsers.update((prev) =>
        prev.map((u) =>
          u.streamId === remoteStream.id ? { ...u, stream: remoteStream } : u,
        ),
      );
    }
  }

  async onWsMessage(event: MessageEvent<unknown>) {
    try {
      const parsed = JSON.parse(event.data as string) as IMessage;

      if (parsed.type === 'joined-metadata') {
        this.remoteUsers.update((prev) => [
          ...prev,
          {
            streamId: parsed.from!,
            userName: parsed.userName!,
            isMuted: false,
            isVideoOff: false,
            stream: null,
            color: this.randomColor,
          },
        ]);
        await this.rtc.connect(
          parsed.from!,
          this.stream()!,
          (e) => this.trackListener(e),
          this.roomId(),
        );
        await this.rtc.createOffer(this.roomId(), this.streamId!, parsed.from!);
      } else if (parsed.type === 'disconnected') {
        this.remoteUsers.update((prev) =>
          prev.filter((u) => u.streamId !== parsed.from),
        );
      } else if (parsed.type === 'toggle-mute') {
        this.remoteUsers.update((prev) =>
          prev.map((u) => {
            if (u.streamId === parsed.from) {
              u.isMuted = !u.isMuted;
              u.stream?.getAudioTracks().forEach((track) => {
                track.enabled = !track.enabled;
              });
            }
            return u;
          }),
        );
        
      } else if (parsed.type === 'toggle-video-off') {
        this.remoteUsers.update((prev) =>
          prev.map((u) => {
            if (u.streamId === parsed.from) {
              u.isVideoOff = !u.isVideoOff;
              u.stream?.getVideoTracks().forEach((track) => {
                track.enabled = !track.enabled;
              });
            }
            return u;
          }),
        );
      } else if (parsed.type === 'chat-message') {
        if (!this.isChatOpen()) {
          this.nots.update((prev) => prev + 1);
          this.msgAudio.play();
        }

        this.chatMessages.update((prev) => [
          ...prev,
          {
            type: 'other',
            message: parsed.message!,
            user: parsed.client!,
          },
        ]);
      }

      if (
        parsed.type === 'offer' ||
        parsed.type === 'answer' ||
        parsed.type === 'ice-candidate' ||
        parsed.type === 'self-joined'
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

  toggleChat() {
    this.isChatOpen.update((prev) => !prev);
  }

  reset() {
    this.currentView.set('menu');
    this.roomId.set(null);
    this.roomName.set('');
    this.userName.set('');
    this.streamId = '';
    this.remoteUsers.set([]);
    this.chatMessages.set([]);
    this.nots.set(0);
    this.isChatOpen.set(false);
    this.signalingReady = false;
    this.pendingSignals = [];
  }
}
