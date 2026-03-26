import { AppService } from '@/app/services/app.service';
import { WebRtcService } from '@/shared/services/webRtc.service';
import { WebsocketService } from '@/shared/services/websocket.service';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-join-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './joinRoom.component.html',
})
export class JoinRoomComponent {
  userName = '';
  roomCode = '';
  isJoining = false;

  constructor(
    private ws: WebsocketService,
    private app: AppService,
    private rtc: WebRtcService,
    public i18n: I18nService,
  ) {}

  onBack() {
    this.app.currentView.set('menu');
  }

  async onJoin() {
    try {
      this.isJoining = true;
      this.app.resetSignalingState();
      await this.ws.connect('wss://webrtc-signaling-service.onrender.com', (data) =>
        this.app.onWsMessage(data),
      );
      await this.rtc.connect();

      const roomId = this.roomCode.trim();
      this.app.roomId.set(roomId || null);

      this.ws.send({
        type: 'joinRoom',
        roomId,
      });
    } catch (e) {
      console.error(e);
      this.isJoining = false;
    }
  }
}
