import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { AppService } from '../../services/app.service';
import { WebRtcService } from '@/shared/services/webRtc.service';
import { I18nService } from '../../services/i18n.service';
import { WebsocketService } from '@/shared/services/websocket.service';
import { LucideAngularModule, MicOff } from 'lucide-angular';
import { CallChat, CallHeader } from './_components';
import { CallFooter } from './_components/footer/footer.component';

@Component({
  selector: 'app-call',
  templateUrl: './call.component.html',
  imports: [
    CommonModule,
    LucideAngularModule,
    CallChat,
    CallHeader,
    CallFooter,
  ],
})
export class CallComponent implements AfterViewInit, OnDestroy {
  readonly MicOffIcon = MicOff;

  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;

  public color = 'black';

  constructor(
    public app: AppService,
    public i18n: I18nService,
    private rtc: WebRtcService,
    private ws: WebsocketService,
  ) {
    this.color = app.randomColor;
  }

  async ngAfterViewInit() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      this.app.stream.set(stream);
      this.app.streamId = stream.id;
      this.bindLocalPreview(stream);
      
      // await this.rtc.connect(
      //   stream.id,
      //   stream,
      //   this.app.trackListener,
      //   this.app.roomId(),
      // );

      // this.rtc.addTracks(stream, stream.id);
      this.ws.send({
        type: 'joined-metadata',
        roomId: this.app.roomId(),
        streamId: stream.id,
        userName: this.app.userName(),
      });
      // this.rtc.addTrackListener((event) => {
      //   const remoteStream = event.streams[0];
      //   if (!remoteStream) return;
      //   const alreadyExists = this.app
      //     .remoteUsers()
      //     .some((user) => user.stream?.id === remoteStream.id);
      //   if (!alreadyExists) {
      //     this.app.remoteUsers.update((prev) =>
      //       prev.map((u) =>
      //         u.streamId === remoteStream.id
      //           ? { ...u, stream: remoteStream }
      //           : u,
      //       ),
      //     );
      //   }
      // }, stream.id);

      // this.rtc.listenCandidates(this.app.roomId(), stream.id);
      this.app.markSignalingReady();

      window.onbeforeunload = () => {
        this.ws.close(1000, this.app.roomId() ?? '');
        this.app.reset();
      };
    } catch (e) {
      console.error(e);
    }
  }

  ngOnDestroy(): void {
    const stream = this.app.stream();
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }

    this.ws.close(1000, this.app.roomId() ?? '');
    this.app.reset();
    window.onbeforeunload = null;
  }

  get gridClass() {
    const count = this.app.remoteUsers().length + 1;
    if (count <= 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1 lg:grid-cols-2';
    if (count <= 4) return 'grid-cols-1 sm:grid-cols-2';
    if (count <= 6) return 'grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-2 lg:grid-cols-4';
  }

  private bindLocalPreview(stream: MediaStream) {
    const video = this.localVideo?.nativeElement;
    if (video) {
      video.srcObject = stream;
      video.muted = true;
    }
  }
}
