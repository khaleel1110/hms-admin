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
  }, {
    path: 'add-department',
    loadComponent: () => import('../features/deartment/add-department/add-department.component').then(_ => _.AddDepartmentComponent)
  },{
    path: 'department',
    loadComponent: () => import('../features/deartment/department-list/department-list.component').then(_ => _.DepartmentListComponent)
  }, {
    path: 'view-booking/:id',
    loadComponent: () => import('../features/bookings/view-booking/view-booking.component').then(_ => _.ViewBookingComponent)
  },{
    path: 'view-department/:id',
    loadComponent: () => import('../features/deartment/view-department/view-department.component').then(_ => _.ViewDepartmentComponent)
  },
  // Add a catch-all route
  { path: '**', redirectTo: 'dashboard' }
];
