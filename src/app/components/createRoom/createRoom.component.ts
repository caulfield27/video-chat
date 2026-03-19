import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppService } from '../../services/app.service';

@Component({
  selector: 'app-create-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './createRoom.component.html',
})
export class CreateRoomComponent {
  userName = '';
  roomName = '';

  constructor(private app: AppService) {}

  onBack() {
    this.app.currentView.set('menu');
  }

  onCreate() {
    this.app.currentView.set('call');
  }
}
