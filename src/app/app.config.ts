import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { getApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import {
  browserSessionPersistence,
  getAuth,
  initializeAuth,
  provideAuth,
} from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideHttpClient } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideServiceWorker } from '@angular/service-worker';

const firebaseConfig = {
  apiKey: 'AIzaSyBVBuGH4sbA4D0xJjYDz8Tq7M9ZJX6kdoc',
  authDomain: 'product-catelouge.firebaseapp.com',
  projectId: 'product-catelouge',
  storageBucket: 'product-catelouge.firebasestorage.app',
  messagingSenderId: '938871231946',
  appId: '1:938871231946:web:e890079e4cd107c5c66b33',
  measurementId: 'G-LFDX1LGDYX',
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled', // Page change hote hi top par scroll karega
        anchorScrolling: 'enabled', // Agar anchor links hain to wahan scroll karega
      }),
    ),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => {
      const app = getApp(); // Jo app upar initialize hui hai, use get karein
      return initializeAuth(app, {
        persistence: browserSessionPersistence,
      });
    }),
    provideFirestore(() => getFirestore()),
    provideHttpClient(),
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      progressBar: true,
      closeButton: true,
      preventDuplicates: true,
    }),
    provideAnimations(), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }),
  ],
};
