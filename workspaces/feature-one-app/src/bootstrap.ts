import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { FeatureOneApp } from './app/app';

bootstrapApplication(FeatureOneApp, appConfig)
  .catch((err) => console.error(err));
