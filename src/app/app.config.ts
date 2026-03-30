import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes)]
};

// export const SIGNALING_SERVICE_URL = 'wss://webrtc-signaling-service.onrender.com';
export const SIGNALING_SERVICE_URL = 'ws://localhost:3000';