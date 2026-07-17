import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes)]
};

export const SIGNALING_SERVICE_URL = 'wss://webrtc-signaling-service-production.up.railway.app/';
export const GET_ICE_SERVERS = 'https://webrtc-signaling-service-production.up.railway.app/api/ice';
// export const SIGNALING_SERVICE_URL = 'ws://localhost:3000';
// export const GET_ICE_SERVERS = 'http://localhost:3000/api/ice';