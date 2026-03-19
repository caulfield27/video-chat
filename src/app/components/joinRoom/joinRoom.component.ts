import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-join-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './joinRoom.component.html'
})

export class JoinRoomComponent {
  userName = '';
  roomCode = '';
}