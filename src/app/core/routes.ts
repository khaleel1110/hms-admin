import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('../features/dashboards/dashboard/dashboard.component').then(_ => _.DashboardComponent)
  },
  {
    path: 'booking',
    loadComponent: () => import('../features/bookings/booking/booking.component').then(_ => _.BookingComponent)
  },  {
    path: 'add-booking',
    loadComponent: () => import('../features/bookings/add-booking/add-booking.component').then(_ => _.AddBookingComponent)
  },
  // Add a catch-all route
  { path: '**', redirectTo: 'dashboard' }
];
