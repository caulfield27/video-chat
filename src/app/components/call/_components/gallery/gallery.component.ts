import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  signal,
  viewChild,
} from '@angular/core';
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
const TILE_ASPECT = 16 / 9;

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
export class CallGallery implements AfterViewInit, OnDestroy {
  readonly MicIcon = Mic;
  readonly MicOffIcon = MicOff;
  readonly ChevronLeftIcon = ChevronLeft;
  readonly ChevronRightIcon = ChevronRight;

  readonly gridEl = viewChild<ElementRef<HTMLDivElement>>('gridEl');

  private readonly localColor: string;
  private readonly page = signal(0);
  private readonly containerSize = signal({ width: 0, height: 0 });
  private resizeObserver: ResizeObserver | null = null;

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
    const { width, height } = this.containerSize();

    if (count <= 1) return { cols: 1, rows: 1 };
    if (!width || !height) return this.fallbackDims(count);

    let best = { cols: 1, rows: count, area: 0 };
    for (let cols = 1; cols <= count; cols++) {
      const rows = Math.ceil(count / cols);
      const cellW = width / cols;
      const cellH = height / rows;

      let tileW = cellW;
      let tileH = tileW / TILE_ASPECT;
      if (tileH > cellH) {
        tileH = cellH;
        tileW = tileH * TILE_ASPECT;
      }

      const area = tileW * tileH;
      if (area > best.area) {
        best = { cols, rows, area };
      }
    }

    return { cols: best.cols, rows: best.rows };
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

  ngAfterViewInit(): void {
    const el = this.gridEl()?.nativeElement;
    if (!el) return;

    this.resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      this.containerSize.set({ width, height });
    });
    this.resizeObserver.observe(el);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
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

  private fallbackDims(count: number) {
    if (count === 2) return { cols: 1, rows: 2 };
    if (count <= 4) return { cols: 2, rows: 2 };
    return { cols: 3, rows: 3 };
  }
}
