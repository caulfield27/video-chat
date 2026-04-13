import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root',
})
export class WebRtcService {
  public peers = new Map<
    string,
    {
      pc: RTCPeerConnection;
      iceCandidatesQueue: RTCIceCandidateInit[];
    }
  >();

  constructor(private ws: WebsocketService) {}

  async connect(
    id: string,
    stream: MediaStream,
    trackListener: (ev: RTCTrackEvent) => void,
    roomId: string | null,
  ) {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });
      this.peers.set(id, {
        pc,
        iceCandidatesQueue: [],
      });
      this.addTracks(stream, id);
      this.addTrackListener(trackListener, id);
      this.listenCandidates(roomId, id, stream.id);
    } catch (e) {
      console.error('create peer connection error:', e);
    }
  }

  addTracks(stream: MediaStream, id: string) {
    const peer = this.peers.get(id);
    if (!peer) return;
    stream.getTracks().forEach((track) => {
      peer.pc.addTrack(track, stream);
    });
  }

  async createOffer(
    roomId: string | null,
    fromId: string,
    toId: string,
  ) {
    const peer = this.peers.get(toId);
    if (!peer || !roomId) return;
    try {
      const offer = await peer.pc.createOffer();
      await peer.pc.setLocalDescription(offer);
      this.ws.send({
        roomId,
        from: fromId,
        to: toId,
        type: 'offer',
        data: offer,
      });
    } catch (e) {
      console.error('offer creation error:', e);
    }
  }

  async handleOffer(
    offer: RTCSessionDescriptionInit,
    roomId: string | null,
    fromId: string,
    toId: string,
  ) {
    const peer = this.peers.get(fromId);
    if (!peer || !roomId) return;
    try {
      await peer.pc.setRemoteDescription(offer);
      const answer = await peer.pc.createAnswer();

      await peer.pc.setLocalDescription(answer);

      this.ws.send({
        roomId,
        from: toId,
        to: fromId,
        type: 'answer',
        data: answer,
      });
      await this.flushPendingCandidates(fromId);
    } catch (e) {
      console.error('[rtc] handleOffer error:', e);
    }
  }

  async handleRemoteDescription(
    answer: RTCSessionDescriptionInit,
    fromId: string,
  ) {
    const peer = this.peers.get(fromId);

    if (!peer) return;
    await peer.pc.setRemoteDescription(answer);
    await this.flushPendingCandidates(fromId);
  }

  private async flushPendingCandidates(peerId: string) {
    const peer = this.peers.get(peerId);
    if (!peer) return;
    if (
      !peer.pc ||
      !peer.pc.remoteDescription ||
      !peer.iceCandidatesQueue.length
    ) {
      return;
    }

    const pending = [...peer.iceCandidatesQueue];
    peer.iceCandidatesQueue = [];

    for (const candidate of pending) {
      try {
        await peer.pc.addIceCandidate(candidate);
      } catch (e) {
        console.error('[rtc] flush candidate error:', e);
      }
    }
  }

  async addCandidate(candidate: RTCIceCandidateInit, peerId: string) {
    const peer = this.peers.get(peerId);
 
    if (!peer) return;
    if (!peer.pc.remoteDescription) {
      peer.iceCandidatesQueue.push(candidate);
      return;
    }
    await peer.pc.addIceCandidate(candidate);
  }

  addTrackListener(cb: (event: RTCTrackEvent) => void, peerId: string) {
    const peer = this.peers.get(peerId);
    if (!peer) return;
    peer.pc.ontrack = cb;
  }

  listenCandidates(roomId: string | null, peerId: string, id: string) {
    const peer = this.peers.get(peerId);
    if (!peer || !roomId) return;
    peer.pc.onicecandidate = (e) => {
      if (e.candidate) {
        this.ws.send({
          roomId,
          from: id,
          to: peerId,
          type: 'ice-candidate',
          data: e.candidate,
        });
      }
    };
  }
}
