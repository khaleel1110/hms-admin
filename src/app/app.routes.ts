import { Routes } from '@angular/router';
import { AuthGuard, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { inject } from '@angular/core';
import { map } from 'rxjs';
import { Auth, getIdTokenResult, user } from '@angular/fire/auth';

const redirectLoggedInToAdmin = () => redirectLoggedInTo(['admin/dashboard']);
const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['authentication']);

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'authentication'
  },
  {
    path: 'authentication',
    loadComponent: () => import('./features/authentication/log-in/log-in.component').then(m => m.LogInComponent),
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectLoggedInToAdmin }
  },
  {
    path: 'sign-up',
    loadComponent: () => import('./features/authentication/sign-up/sign-up.component').then(m => m.SignUpComponent),
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectLoggedInToAdmin }
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/authentication/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectLoggedInToAdmin }
  },
  {
    path: 'admin',
    loadComponent: () => import('./core/layout/layout.component').then(m => m.LayoutComponent),
    loadChildren: () => import('./core/routes').then(m => m.routes),
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: '**',
    redirectTo: 'authentication'
  }
];
