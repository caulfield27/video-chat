import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root',
})
export class WebRtcService {
  private pc: RTCPeerConnection | null = null;
  public iceCandidatesQueue: RTCIceCandidateInit[] = [];

  constructor(private ws: WebsocketService) {}

  async connect() {
    try {
      this.pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });
    } catch (e) {
      console.error('create peer connection error:', e);
    }
  }

  addTracks(stream: MediaStream) {
    stream.getTracks().forEach((track) => {
      this.pc?.addTrack(track, stream);
    });
  }

  async createOffer(roomId: string | null) {
    if (!this.pc || !roomId) return;
    try {
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);
      this.ws.send({
        roomId,
        type: 'offer',
        data: offer,
      });
    } catch (e) {
      console.error('offer creation error:', e);
    }
  }

  async handleOffer(offer: RTCSessionDescriptionInit, roomId: string | null) {
    if (!this.pc || !roomId) return;
    try {
      await this.pc.setRemoteDescription(offer);
      const answer = await this.pc.createAnswer();
      await this.pc.setLocalDescription(answer);
      this.ws.send({
        roomId,
        type: 'answer',
        data: answer,
      });
      await this.flushPendingCandidates();
    } catch (e) {
      console.error('[rtc] handleOffer error:', e);
    }
  }

  async handleRemoteDescription(answer: RTCSessionDescriptionInit) {
    if (!this.pc) return;
    await this.pc.setRemoteDescription(answer);
    await this.flushPendingCandidates();
  }

  private async flushPendingCandidates() {
    if (!this.pc || !this.pc.remoteDescription || !this.iceCandidatesQueue.length) {
      return;
    }

    const pending = [...this.iceCandidatesQueue];
    this.iceCandidatesQueue = [];

    for (const candidate of pending) {
      try {
        await this.pc.addIceCandidate(candidate);
      } catch (e) {
        console.error('[rtc] flush candidate error:', e);
      }
    }
  }

  async addCandidate(candidate: RTCIceCandidateInit) {
    if (!this.pc) return;
    if (!this.pc.remoteDescription) {
      this.iceCandidatesQueue.push(candidate);
      return;
    }

    await this.pc.addIceCandidate(candidate);
  }

  addTrackListener(cb: (event: RTCTrackEvent) => void) {
    if (!this.pc) return;
    this.pc.ontrack = cb;
  }

  listenCandidates(roomId: string | null) {
    if (!this.pc || !roomId) return;

    this.pc.onicecandidate = (e) => {
      if (e.candidate) {
        this.ws.send({
          roomId,
          type: 'ice-candidate',
          data: e.candidate,
        });
      }
    };
  }
}
