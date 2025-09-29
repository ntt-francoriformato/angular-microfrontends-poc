import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { FeatureTwoApp } from './app/app';

bootstrapApplication(FeatureTwoApp, appConfig)
  .catch((err) => console.error(err));
