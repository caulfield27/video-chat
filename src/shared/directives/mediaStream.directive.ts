import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  inject,
} from '@angular/core';

@Directive({
  selector: 'video[appMediaStream]',
  standalone: true,
})
export class MediaStreamDirective implements OnChanges, OnDestroy {
  @Input({ required: true, alias: 'appMediaStream' })
  stream: MediaStream | null = null;

  private readonly video = inject(ElementRef<HTMLVideoElement>).nativeElement;
  private readonly retryPlayback = () => {
    void this.tryPlay();
  };
  private boundStream: MediaStream | null = null;

  constructor() {
    this.video.autoplay = true;
    this.video.playsInline = true;
    this.video.addEventListener('loadedmetadata', this.retryPlayback);
    this.video.addEventListener('canplay', this.retryPlayback);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('stream' in changes) {
      this.bindStream();
    }
  }

  ngOnDestroy(): void {
    this.unbindStream();
    this.video.removeEventListener('loadedmetadata', this.retryPlayback);
    this.video.removeEventListener('canplay', this.retryPlayback);
  }

  private bindStream() {
    if (this.video.srcObject !== this.stream) {
      this.video.srcObject = this.stream;
    }

    this.unbindStream();
    this.boundStream = this.stream;

    if (!this.boundStream) {
      return;
    }

    this.boundStream.addEventListener('addtrack', this.retryPlayback);
    this.boundStream.addEventListener('removetrack', this.retryPlayback);
    void this.tryPlay();
  }

  private unbindStream() {
    if (!this.boundStream) {
      return;
    }

    this.boundStream.removeEventListener('addtrack', this.retryPlayback);
    this.boundStream.removeEventListener('removetrack', this.retryPlayback);
    this.boundStream = null;
  }

  private async tryPlay() {
    if (!this.video.srcObject) {
      return;
    }

    try {
      await this.video.play();
    } catch (error) {
      console.warn('video playback was blocked', error);
    }
  }
}
