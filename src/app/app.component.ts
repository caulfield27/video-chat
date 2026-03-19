import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MenuComponent,
  CreateRoomComponent,
  JoinRoomComponent,
  CallComponent,
} from './components';
import { AppService } from './services/app.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MenuComponent,
    CreateRoomComponent,
    JoinRoomComponent,
    CallComponent,
  ],
  template: `
    <ng-container [ngSwitch]="app.currentView()">
      <app-menu *ngSwitchCase="'menu'"></app-menu>
      <app-create-room *ngSwitchCase="'create'"></app-create-room>
      <app-join-room *ngSwitchCase="'join'"></app-join-room>
      <app-call *ngSwitchCase="'call'"></app-call>
    </ng-container>
  `,
})
export class App {
  constructor(public app: AppService) {}
}
