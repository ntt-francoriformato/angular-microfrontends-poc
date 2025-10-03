import { CentralizedApi } from '@angular-microfrontends-poc/shared-types';

declare global {
  interface Window {
    CentralizedAPI?: CentralizedApi;
  }
}