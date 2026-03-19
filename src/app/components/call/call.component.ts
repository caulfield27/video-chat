import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { AppService } from '../../services/app.service';

@Component({
  selector: 'app-call',
  templateUrl: './call.component.html',
  imports: [CommonModule],
})
export class CallComponent {
  isMuted = signal(false);
  isVideoOff = signal(false);
  isScreenSharing = signal(false);
  isChatOpen = signal(false);
  callDuration = signal('00:00');

  constructor(private app: AppService) {}

  onCallEnd() {
    this.app.currentView.set('menu');
  }
}
