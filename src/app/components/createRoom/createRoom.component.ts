import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppService } from '../../services/app.service';
import { WebsocketService } from '../../../shared/services/websocket.service';
import { v4 as uuidv4 } from 'uuid';
import { I18nService } from '../../services/i18n.service';
import { SIGNALING_SERVICE_URL } from '@/app/app.config';

@Component({
  selector: 'app-create-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './createRoom.component.html',
})
export class CreateRoomComponent {
  userName = '';
  roomName = '';
  isCreating: boolean = false;

  constructor(
    private app: AppService,
    private ws: WebsocketService,
    public i18n: I18nService,
  ) {}

  onBack() {
    this.app.currentView.set('menu');
  }

  async onCreate() {
    try {
      this.isCreating = true;
      this.app.roomName.set(this.roomName);
      this.app.userName.set(this.userName);
      this.app.resetSignalingState();
      await this.ws.connect(SIGNALING_SERVICE_URL, (data) =>
        this.app.onWsMessage(data),
      );
      const roomId = uuidv4();
      this.app.roomId.set(roomId);
      this.ws.send({
        type: 'createRoom',
        roomname: this.roomName,
        roomId,
      });
      this.app.currentView.set('call');
    } catch (e) {
      console.error(e);
    } finally {
      this.isCreating = false;
    }
  }
}
