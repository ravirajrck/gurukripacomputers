import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import * as pdfjsLib from 'pdfjs-dist';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
// वर्कर का पाथ सेट करना पड़ता है ताकि यह बड़े पीडीएफ को भी आसानी से लोड कर सके
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;