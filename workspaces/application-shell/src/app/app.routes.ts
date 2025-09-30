import { loadRemoteModule } from '@angular-architects/module-federation';
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'one',
    loadComponent: () =>
      loadRemoteModule({
        type: 'manifest',
        remoteName: 'feature-one-app',
        exposedModule: './ComponentOne',
      }).then((m) => {
        console.log('Loading', m);
        return m.FeatureOneApp;
      }),
  },
  {
    path: 'two',
    loadComponent: () =>
      loadRemoteModule({
        type: 'manifest',
        remoteName: 'feature-two-app',
        exposedModule: './ComponentTwo',
      }).then((m) => m.FeatureTwoApp),
  },
  {
    path: 'all',
    loadComponent: () => import('./components/all-micro-frontends.component').then(m => m.AllMicroFrontendsComponent)
  },
  {
    path: '**',
    redirectTo: 'one',
  },
];
