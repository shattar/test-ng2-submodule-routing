import { Routes, RouterModule } from '@angular/router';
import { NoContentComponent } from './no-content';

export const ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dispatch' },
  {
    path: 'dispatch', loadChildren: () => System.import('./dispatch').then((comp: any) => {
      return comp.default;
    })
  },
  { path: '**',    component: NoContentComponent },
];
