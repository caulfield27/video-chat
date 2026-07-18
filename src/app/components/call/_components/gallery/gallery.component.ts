import { CommonModule } from '@angular/common';
import { Component, OnDestroy, computed, effect, signal } from '@angular/core';
import {
  ChevronLeft,
  ChevronRight,
  LucideAngularModule,
  Mic,
  MicOff,
} from 'lucide-angular';
import { AppService } from '@/app/services/app.service';
import { I18nService } from '@/app/services/i18n.service';
import { AudioLevelService } from '@/shared/services/audioLevel.service';
import { MediaStreamDirective } from '@/shared/directives/mediaStream.directive';
import { IGalleryTile } from '@/app/types';

const PAGE_SIZE = 9;
const SPEAKING_THRESHOLD = 0.02;

@Component({
  selector: 'call-gallery',
  templateUrl: './gallery.component.html',
  styles: `
    :host {
      display: contents;
    }
  `,
  imports: [CommonModule, LucideAngularModule, MediaStreamDirective],
})
export class CallGallery implements OnDestroy {
  readonly MicIcon = Mic;
  readonly MicOffIcon = MicOff;
  readonly ChevronLeftIcon = ChevronLeft;
  readonly ChevronRightIcon = ChevronRight;

  private readonly localColor: string;
  private readonly page = signal(0);

  readonly tiles = computed<IGalleryTile[]>(() => {
    const local: IGalleryTile = {
      id: 'local',
      userName: this.app.userName(),
      stream: this.app.stream(),
      isMuted: this.app.isMuted(),
      isVideoOff: this.app.isVideoOff(),
      color: this.localColor,
      isLocal: true,
    };

    return [
      local,
      ...this.app.remoteUsers().map(
        (user): IGalleryTile => ({
          id: user.streamId,
          userName: user.userName,
          stream: user.stream,
          isMuted: user.isMuted,
          isVideoOff: user.isVideoOff,
          color: user.color,
          isLocal: false,
        }),
      ),
    ];
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.tiles().length / PAGE_SIZE)),
  );

  readonly currentPage = computed(() =>
    Math.min(this.page(), this.totalPages() - 1),
  );

  readonly pageTiles = computed(() => {
    const start = this.currentPage() * PAGE_SIZE;
    return this.tiles().slice(start, start + PAGE_SIZE);
  });

  readonly gridDims = computed(() => {
    const count = this.pageTiles().length;
    if (count <= 1) return { cols: 1, rows: 1 };
    if (count === 2) return { cols: 2, rows: 1 };
    if (count <= 4) return { cols: 2, rows: 2 };
    return { cols: 3, rows: 3 };
  });

  readonly activeSpeakerId = computed(() => {
    const levels = this.audioLevel.levels();
    let best: string | null = null;
    let bestLevel = SPEAKING_THRESHOLD;

    for (const [id, level] of Object.entries(levels)) {
      if (level > bestLevel) {
        bestLevel = level;
        best = id;
      }
    }

    return best;
  });

  constructor(
    public app: AppService,
    public i18n: I18nService,
    private audioLevel: AudioLevelService,
  ) {
    this.localColor = this.app.randomColor;

    effect(() => {
      const stream = this.app.stream();
      if (stream) {
        this.audioLevel.track('local', stream);
      } else {
        this.audioLevel.untrack('local');
      }
    });

    effect(() => {
      const users = this.app.remoteUsers();
      this.audioLevel.retain(new Set(['local', ...users.map((u) => u.streamId)]));
      users.forEach((user) => {
        if (user.stream) {
          this.audioLevel.track(user.streamId, user.stream);
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.audioLevel.reset();
  }

  prevPage() {
    this.page.update((p) => Math.max(0, p - 1));
  }

  nextPage() {
    this.page.update((p) => Math.min(this.totalPages() - 1, p + 1));
  }

  isActiveSpeaker(tile: IGalleryTile) {
    return this.activeSpeakerId() === tile.id;
  }

  initials(name: string) {
    return name.trim().toLocaleUpperCase()[0] || '';
  }

  displayName(tile: IGalleryTile) {
    if (tile.userName) return tile.userName;
    return tile.isLocal ? this.i18n.t('call.you') : this.i18n.t('call.guest');
  }

  handleCanPlay(e: Event) {
    const video = e.target as HTMLVideoElement;
    void video.play().catch((err) => {
      console.warn('video playback was blocked', err);
    });
  }
}
