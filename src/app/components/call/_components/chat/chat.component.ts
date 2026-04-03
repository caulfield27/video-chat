import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { WebsocketService } from '@/shared/services/websocket.service';
import { LucideAngularModule, SendHorizontal } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { AppService } from '@/app/services/app.service';
import { I18nService } from '@/app/services/i18n.service';

@Component({
  selector: 'call-chat',
  templateUrl: './chat.component.html',
  imports: [CommonModule, LucideAngularModule, FormsModule],
})
export class CallChat implements OnInit {
  public message: string = '';
  readonly SendIcon = SendHorizontal
  constructor(
    private ws: WebsocketService,
    public app: AppService,
    public i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.app.nots.set(0);
  }

  stringToColor(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${hash % 360}, 60%, 50%)`;
  }

  handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      this.handleSendMessage();
    }
  }

  handleSendMessage() {
    const client = {
      streamId: this.app.streamId,
      userName: this.app.userName(),
    };
    this.app.chatMessages.update((prev) => [
      ...prev,
      {
        type: 'me',
        message: this.message,
        user: client,
      },
    ]);
    this.ws.send({
      type: 'chat-message',
      roomId: this.app.roomId(),
      message: this.message,
      client,
    });
    this.message = '';
  }
}
