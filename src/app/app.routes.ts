import { Routes } from '@angular/router';
import {AuthGuard, redirectLoggedInTo, redirectUnauthorizedTo} from '@angular/fire/auth-guard';
const redirectLoggedInToAdmin = () => redirectLoggedInTo(['/admin/dashboard']);
const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['/authentication']);

export const routes: Routes = [

  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/admin',
  },
  {
    path: 'admin',
    loadComponent: () => import('./core/layout/layout.component').then(_ => _.LayoutComponent),
    loadChildren: () => import('./core/routes').then(_ => _.routes),
  },
  /* {
     path: 'authentication',
     loadComponent: () => import('./features/authentication/log-in/log-in.component').then(_ => _.LogInComponent),
     canActivate: [AuthGuard], data: { authGuardPipe: redirectLoggedInToAdmin }
   },*/
];
