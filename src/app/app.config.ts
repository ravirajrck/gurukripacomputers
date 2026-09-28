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
  apiKey: "AIzaSyASwsh_NIYV6W4CV23wGQeKVnXn0IySnsM",
  authDomain: "gurukripa-shop.firebaseapp.com",
  projectId: "gurukripa-shop",
  storageBucket: "gurukripa-shop.firebasestorage.app",
  messagingSenderId: "651970426363",
  appId: "1:651970426363:web:19523cd9980af283a0c75e",
  measurementId: "G-QM8D2DGZVB"
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
